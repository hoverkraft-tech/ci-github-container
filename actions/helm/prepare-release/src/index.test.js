import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";

const { ChartRelease } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);

function fixture(t) {
	const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "chart-release-"));
	t.after(() => fs.rmSync(workspace, { recursive: true, force: true }));
	fs.mkdirSync(path.join(workspace, "chart"));
	const chartFile = path.join(workspace, "chart/Chart.yaml");
	fs.writeFileSync(
		chartFile,
		'apiVersion: v2\nname: example\nversion: 1.2.3\nappVersion: "8.4.0" # upstream application\n',
	);
	const calls = [];
	const context = {
		repo: { owner: "example", repo: "charts" },
		ref: "refs/heads/main",
		sha: "original-commit",
		eventName: "workflow_dispatch",
		payload: { repository: { default_branch: "main" } },
	};
	const github = {
		graphql: async (_query, variables) => {
			calls.push({ type: "commit", ...variables.input });
			return { createCommitOnBranch: { commit: { oid: "release-commit" } } };
		},
		rest: {
			git: {
				getRef: async () => ({ data: { object: { sha: context.sha } } }),
				createRef: async (input) => calls.push({ type: "tag", ...input }),
			},
			actions: {
				createWorkflowDispatch: async (input) =>
					calls.push({ type: "dispatch", ...input }),
			},
			repos: {
				getReleaseByTag: async () => {
					throw Object.assign(new Error("Missing release"), { status: 404 });
				},
				getCommit: async () => ({ data: { sha: "release-commit" } }),
			},
		},
	};
	const exec = { getExecOutput: async () => ({ exitCode: 0 }) };
	const release = new ChartRelease({
		github,
		context,
		exec,
		workspace,
		workflowRef: "example/charts/.github/workflows/release.yml@refs/heads/main",
	});
	return { release, workspace, chartFile, calls, context, github, exec };
}

for (const updateAppVersion of [false, true]) {
	test(`commit the chart and ${updateAppVersion ? "update" : "preserve"} the application version`, async (t) => {
		const f = fixture(t);
		assert.equal(
			(await f.release.inspect({ directory: "chart", updateAppVersion }))
				.status,
			"plan",
		);
		assert.deepEqual(
			await f.release.prepare({
				directory: "chart",
				tag: "v1.3.0",
				updateAppVersion,
			}),
			{ status: "dispatched", tag: "v1.3.0" },
		);
		const [commit, tag, dispatch] = f.calls;
		assert.equal(commit.expectedHeadOid, "original-commit");
		assert.deepEqual(commit.branch, {
			repositoryNameWithOwner: "example/charts",
			branchName: "main",
		});
		assert.equal(commit.fileChanges.additions.length, 1);
		assert.equal(commit.fileChanges.additions[0].path, "chart/Chart.yaml");
		const contents = Buffer.from(
			commit.fileChanges.additions[0].contents,
			"base64",
		).toString();
		const chart = parse(contents);
		assert.equal(chart.version, "1.3.0");
		assert.equal(chart.appVersion, updateAppVersion ? "1.3.0" : "8.4.0");
		assert.match(contents, /# upstream application/);
		assert.equal(tag.sha, "release-commit");
		assert.equal(tag.ref, "refs/tags/v1.3.0");
		assert.equal(dispatch.workflow_id, "release.yml");
		assert.equal(dispatch.ref, "v1.3.0");
	});
}

test("a conflicting branch update cannot create a tag or dispatch", async (t) => {
	const f = fixture(t);
	f.github.graphql = async () => {
		throw new Error("expectedHeadOid does not match");
	};
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.3.0" }),
		/expectedHeadOid/,
	);
	assert.deepEqual(f.calls, []);
	assert.equal(parse(fs.readFileSync(f.chartFile, "utf8")).version, "1.2.3");
});

test("resume the immutable tag after a dispatch failure", async (t) => {
	const f = fixture(t);
	f.github.rest.actions.createWorkflowDispatch = async () => {
		throw new Error("Dispatch unavailable");
	};
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.3.0" }),
		/Dispatch unavailable/,
	);
	f.context.ref = "refs/tags/1.3.0";
	f.context.sha = "release-commit";
	assert.deepEqual(await f.release.inspect({ directory: "chart" }), {
		status: "ready",
		tag: "1.3.0",
	});
	assert.deepEqual(
		f.calls.map((call) => call.type),
		["commit", "tag"],
	);
	f.github.rest.repos.getReleaseByTag = async () => ({
		data: { draft: false },
	});
	assert.equal(
		(await f.release.inspect({ directory: "chart" })).status,
		"released",
	);
});

test("reject a tag whose source versions or ancestry do not match", async (t) => {
	const f = fixture(t);
	f.context.ref = "refs/tags/1.2.4";
	await assert.rejects(
		f.release.inspect({ directory: "chart" }),
		/versions must match/,
	);
	f.context.ref = "refs/tags/1.2.3";
	await assert.rejects(
		f.release.inspect({ directory: "chart", updateAppVersion: true }),
		/versions must match/,
	);
	f.exec.getExecOutput = async () => ({ exitCode: 1 });
	await assert.rejects(
		f.release.inspect({ directory: "chart" }),
		/default branch/,
	);
	assert.deepEqual(f.calls, []);
});

test("an existing tag at another commit is never moved", async (t) => {
	const f = fixture(t);
	f.github.rest.git.createRef = async () => {
		throw Object.assign(new Error("Already exists"), { status: 422 });
	};
	f.github.rest.repos.getCommit = async () => ({
		data: { sha: "other-commit" },
	});
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.3.0" }),
		/another commit/,
	);
	assert.deepEqual(
		f.calls.map((call) => call.type),
		["commit"],
	);
});

test("reject untrusted triggers and paths before writes", async (t) => {
	const f = fixture(t);
	f.context.eventName = "pull_request";
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.3.0" }),
		/default branch/,
	);
	f.context.eventName = "workflow_dispatch";
	f.context.ref = "refs/heads/feature";
	await assert.rejects(
		f.release.inspect({ directory: "chart" }),
		/default branch/,
	);
	f.context.ref = "refs/heads/main";
	const outside = fs.mkdtempSync(path.join(os.tmpdir(), "outside-chart-"));
	t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
	fs.writeFileSync(
		path.join(outside, "Chart.yaml"),
		"name: outside\nversion: 1.2.3\n",
	);
	fs.symlinkSync(outside, path.join(f.workspace, "outside"));
	await assert.rejects(
		f.release.inspect({ directory: "outside" }),
		/inside the repository/,
	);
	assert.deepEqual(f.calls, []);
});

test("unchanged metadata still checks the selected branch head", async (t) => {
	const f = fixture(t);
	f.github.rest.git.getRef = async () => ({
		data: { object: { sha: "newer-commit" } },
	});
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.2.3" }),
		/branch moved/,
	);
	assert.deepEqual(f.calls, []);
});

test("invalid or older release identities cannot update the chart", async (t) => {
	const f = fixture(t);
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "not-a-version" }),
		/SemVer/,
	);
	await assert.rejects(
		f.release.prepare({ directory: "chart", tag: "1.1.9" }),
		/older than/,
	);
	assert.deepEqual(f.calls, []);
});
