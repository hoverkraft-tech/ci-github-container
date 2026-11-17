import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMMIT = /^[a-f0-9]{40}$/u;

export class DocumentationChanges {
	constructor({ github, context, git }) {
		this.github = github;
		this.context = context;
		this.git = git;
	}

	async #readCheckout(property, workspace) {
		const args =
			property === "head"
				? ["rev-parse", "HEAD"]
				: ["status", "--porcelain=v1", "-z", "--untracked-files=all"];
		if (this.git) return this.git(args);
		const { stdout } = await execFileAsync("git", args, {
			cwd: workspace,
			encoding: "utf8",
			maxBuffer: 4 * 1024 * 1024,
			timeout: 15_000,
		});
		return stdout;
	}

	validPath(value) {
		return (
			typeof value === "string" &&
			value.length > 0 &&
			!value.includes("\\") &&
			!/\p{Cc}/u.test(value) &&
			!value.split("/").some((part) => !part || part === "." || part === "..")
		);
	}

	unrelated(file, paths, chart, values) {
		if (!this.validPath(file)) return false;
		if (
			!chart ||
			file === chart ||
			file.startsWith(`${chart}/`) ||
			file === values
		)
			return false;
		return paths.some((entry) =>
			entry.endsWith("/") ? file.startsWith(entry) : file === entry,
		);
	}

	async requiresGeneration({
		paths = "",
		attempt,
		workflowRef,
		checkoutRef,
		workspace,
		workingDirectory,
		valuesFile = "",
	}) {
		const { context, github } = this;
		const branch = context.payload?.repository?.default_branch;
		if (
			!paths.trim() ||
			![context.ref, context.sha].includes(checkoutRef) ||
			attempt !== 1 ||
			context.eventName !== "push" ||
			!branch ||
			context.ref !== `refs/heads/${branch}` ||
			!COMMIT.test(context.sha || "")
		)
			return true;
		try {
			const ignored = paths
				.split(/\r?\n/u)
				.map((entry) => entry.trim())
				.filter(Boolean);
			if (ignored.some((entry) => !this.validPath(entry.replace(/\/$/u, ""))))
				return true;
			const prefix = `${context.repo.owner}/${context.repo.repo}/.github/workflows/`;
			if (!workflowRef?.startsWith(prefix)) return true;
			const workflow = workflowRef.slice(prefix.length).split("@")[0];
			if (!/^[^/]+\.ya?ml$/u.test(workflow)) return true;
			const chart = path.relative(workspace, workingDirectory);
			const values = valuesFile ? path.relative(workspace, valuesFile) : "";
			if (
				(chart && !this.validPath(chart)) ||
				(values && !this.validPath(values))
			)
				return true;
			if ((await this.#readCheckout("head", workspace)).trim() !== context.sha)
				return true;
			if (await this.#readCheckout("status", workspace)) return true;

			const { data } = await github.rest.actions.listWorkflowRuns({
				...context.repo,
				workflow_id: workflow,
				branch,
				event: "push",
				status: "success",
				per_page: 1,
			});
			const baseline = data.workflow_runs?.[0];
			if (
				!baseline ||
				baseline.id === context.runId ||
				baseline.head_branch !== branch ||
				baseline.event !== "push" ||
				baseline.status !== "completed" ||
				baseline.conclusion !== "success" ||
				!COMMIT.test(baseline.head_sha || "")
			)
				return true;

			const { data: comparison } =
				await github.rest.repos.compareCommitsWithBasehead({
					...context.repo,
					basehead: `${baseline.head_sha}...${context.sha}`,
					per_page: 1,
					page: 1,
				});
			if (
				comparison.status !==
					(baseline.head_sha === context.sha ? "identical" : "ahead") ||
				comparison.base_commit?.sha !== baseline.head_sha ||
				comparison.merge_base_commit?.sha !== baseline.head_sha ||
				!Array.isArray(comparison.files) ||
				comparison.files.length >= 300 ||
				new Set(comparison.files.map((file) => file?.filename)).size !==
					comparison.files.length
			)
				return true;
			return comparison.files.some((file) => {
				if (!this.unrelated(file?.filename, ignored, chart, values))
					return true;
				if (file.status === "renamed")
					return !this.unrelated(
						file.previous_filename,
						ignored,
						chart,
						values,
					);
				return !["added", "modified", "removed"].includes(file.status);
			});
		} catch {
			return true;
		}
	}
}
