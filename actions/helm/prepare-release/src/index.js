import fs from "node:fs";
import path from "node:path";
import { parseDocument } from "yaml";

export class ChartRelease {
	constructor({ github, context, exec, workspace, workflowRef }) {
		Object.assign(this, { github, context, exec, workspace, workflowRef });
	}

	chart(directory) {
		if (typeof directory !== "string" || !directory.trim())
			throw new Error("A chart path is required.");
		const root = fs.realpathSync(this.workspace);
		const file = fs.realpathSync(path.resolve(root, directory, "Chart.yaml"));
		const relative = path.relative(root, file);
		if (relative.startsWith("..") || path.isAbsolute(relative)) {
			throw new Error("Chart.yaml must stay inside the repository.");
		}
		const original = fs.readFileSync(file, "utf8");
		const document = parseDocument(original);
		if (document.errors.length) throw document.errors[0];
		if (!document.get("name") || !document.get("version")) {
			throw new Error("Chart.yaml requires name and version.");
		}
		return { file, relative, original, document };
	}

	version(tag) {
		if (!/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
			throw new Error(
				"Chart releases require a stable SemVer tag, optionally prefixed with v.",
			);
		}
		return tag.replace(/^v/, "");
	}

	branch() {
		const branch = this.context.payload.repository.default_branch;
		if (
			this.context.ref !== `refs/heads/${branch}` ||
			!["workflow_dispatch", "schedule"].includes(this.context.eventName)
		) {
			throw new Error(
				"Start chart release preparation manually or on schedule from the default branch.",
			);
		}
		return branch;
	}

	async inspect({ directory, updateAppVersion }) {
		const { document } = this.chart(directory);
		if (!this.context.ref.startsWith("refs/tags/")) {
			this.branch();
			return { status: "plan", tag: "" };
		}
		if (this.context.eventName !== "workflow_dispatch") {
			throw new Error(
				"Resume chart releases through workflow_dispatch at the prepared tag.",
			);
		}
		const tag = this.context.ref.slice("refs/tags/".length);
		const version = this.version(tag);
		if (
			String(document.get("version")) !== version ||
			(updateAppVersion && String(document.get("appVersion")) !== version)
		) {
			throw new Error(
				"The prepared tag and committed chart versions must match.",
			);
		}
		const branch = this.context.payload.repository.default_branch;
		const ancestry = await this.exec.getExecOutput(
			"git",
			[
				"merge-base",
				"--is-ancestor",
				this.context.sha,
				`refs/remotes/origin/${branch}`,
			],
			{ ignoreReturnCode: true },
		);
		if (ancestry.exitCode !== 0) {
			throw new Error(
				"The release tag must point to a commit on the default branch.",
			);
		}
		try {
			const { data } = await this.github.rest.repos.getReleaseByTag({
				...this.context.repo,
				tag,
			});
			if (!data.draft) return { status: "released", tag };
		} catch (error) {
			if (error.status !== 404) throw error;
		}
		return { status: "ready", tag };
	}

	async prepare({ directory, tag, updateAppVersion }) {
		const branchName = this.branch();
		const version = this.version(tag);
		const repositoryNameWithOwner = `${this.context.repo.owner}/${this.context.repo.repo}`;
		const workflow = this.workflowRef
			?.slice(`${repositoryNameWithOwner}/`.length)
			.split("@")[0];
		if (
			!this.workflowRef?.startsWith(`${repositoryNameWithOwner}/`) ||
			!/^\.github\/workflows\/[^/]+\.ya?ml$/.test(workflow)
		) {
			throw new Error(
				"The calling workflow reference is required for release dispatch.",
			);
		}
		const { file, relative, original, document } = this.chart(directory);
		const current = this.version(String(document.get("version")))
			.split(".")
			.map(Number);
		const planned = version.split(".").map(Number);
		for (let index = 0; index < planned.length; index++) {
			if (planned[index] < current[index])
				throw new Error(
					"The planned version is older than the committed chart version.",
				);
			if (planned[index] > current[index]) break;
		}
		document.set("version", version);
		if (updateAppVersion) document.set("appVersion", version);
		const contents = document.toString();
		let sha = this.context.sha;
		if (contents !== original) {
			const result = await this.github.graphql(
				`mutation($input: CreateCommitOnBranchInput!) {
					createCommitOnBranch(input: $input) { commit { oid } }
				}`,
				{
					input: {
						branch: { repositoryNameWithOwner, branchName },
						expectedHeadOid: sha,
						message: { headline: `chore(release): prepare chart ${tag}` },
						fileChanges: {
							additions: [
								{
									path: relative.split(path.sep).join("/"),
									contents: Buffer.from(contents).toString("base64"),
								},
							],
						},
					},
				},
			);
			sha = result.createCommitOnBranch.commit.oid;
			fs.writeFileSync(file, contents);
		} else {
			const { data } = await this.github.rest.git.getRef({
				...this.context.repo,
				ref: `heads/${branchName}`,
			});
			if (data.object.sha !== sha)
				throw new Error("The default branch moved; start a new release run.");
		}
		try {
			await this.github.rest.git.createRef({
				...this.context.repo,
				ref: `refs/tags/${tag}`,
				sha,
			});
		} catch (error) {
			if (error.status !== 422) throw error;
			const { data } = await this.github.rest.repos.getCommit({
				...this.context.repo,
				ref: `refs/tags/${tag}`,
			});
			if (data.sha !== sha)
				throw new Error("The release tag already targets another commit.");
		}
		await this.github.rest.actions.createWorkflowDispatch({
			...this.context.repo,
			workflow_id: workflow.split("/").at(-1),
			ref: tag,
		});
		return { status: "dispatched", tag };
	}
}
