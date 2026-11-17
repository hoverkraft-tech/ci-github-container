import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const { DocumentationChanges } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./change-detection.js", import.meta.url)
);

const head = "a".repeat(40);
const previous = "b".repeat(40);
const baseline = {
	id: 10,
	head_sha: previous,
	head_branch: "trunk",
	event: "push",
	status: "completed",
	conclusion: "success",
};
const options = {
	paths: "application/\ndocs/\ne2e/\nREADME.md",
	attempt: 1,
	workflowRef:
		"owner/repository/.github/workflows/custom-main.yaml@refs/heads/trunk",
	checkoutRef: "refs/heads/trunk",
	workspace: "/workspace",
	workingDirectory: "/workspace/charts",
};

function fixture() {
	const state = {
		baseline,
		head,
		dirty: "",
		comparison: {
			status: "ahead",
			base_commit: { sha: previous },
			merge_base_commit: { sha: previous },
			files: [{ filename: "application/main.ts", status: "modified" }],
		},
	};
	const context = {
		eventName: "push",
		ref: "refs/heads/trunk",
		sha: head,
		runId: 20,
		repo: { owner: "owner", repo: "repository" },
		payload: {
			repository: { default_branch: "trunk" },
			before: "c".repeat(40),
		},
	};
	const github = {
		rest: {
			actions: {
				async listWorkflowRuns({ workflow_id }) {
					assert.equal(workflow_id, "custom-main.yaml");
					return {
						data: { workflow_runs: state.baseline ? [state.baseline] : [] },
					};
				},
			},
			repos: {
				async compareCommitsWithBasehead({ basehead }) {
					assert.equal(basehead, `${state.baseline.head_sha}...${head}`);
					return { data: state.comparison };
				},
			},
		},
	};
	const git = async ([command]) => {
		if (state.gitFailure) throw new Error("Git unavailable");
		return command === "rev-parse" ? state.head : state.dirty;
	};
	return {
		state,
		context,
		github,
		changes: new DocumentationChanges({ github, context, git }),
	};
}

for (const [filename, required] of [
	["application/backend/main.ts", false],
	["docs/guide.md", false],
	["README.md", false],
	["charts/application/values.yaml", true],
	["charts/application/README.md", true],
	[".github/workflows/custom-main.yaml", true],
	["scripts/generate-docs.js", true],
	[".prettierignore", true],
	["unknown/file", true],
	["application-other/main.ts", true],
	["README.md/child", true],
	["docs/../charts/values.yaml", true],
	["application/bad\npath", true],
]) {
	test(`changes to ${JSON.stringify(filename)} require generation: ${required}`, async () => {
		const { state, changes } = fixture();
		state.comparison.files = [{ filename, status: "modified" }];
		assert.equal(await changes.requiresGeneration(options), required);
	});
}

for (const [filename, previousFilename, required] of [
	["docs/new.md", "docs/old.md", false],
	["docs/new.md", "charts/old.md", true],
	["charts/new.md", "docs/old.md", true],
	["docs/new.md", undefined, true],
]) {
	test(`rename ${previousFilename} to ${filename} requires generation: ${required}`, async () => {
		const { state, changes } = fixture();
		state.comparison.files = [
			{ filename, status: "renamed", previous_filename: previousFilename },
		];
		assert.equal(await changes.requiresGeneration(options), required);
	});
}

test("includes chart changes left pending by failed or cancelled pushes", async () => {
	const { state, changes, github } = fixture();
	github.rest.repos.compareCommitsWithBasehead = async ({ basehead }) => ({
		data: {
			...state.comparison,
			files: basehead.startsWith(previous)
				? [{ filename: "charts/Chart.yaml", status: "modified" }]
				: [{ filename: "application/main.ts", status: "modified" }],
		},
	});
	assert.equal(await changes.requiresGeneration(options), true);
});

for (const [label, overrides, files] of [
	[
		"chart directory",
		{
			paths: "application/",
			workingDirectory: "/workspace/application/charts",
		},
		["application/charts/values.yaml"],
	],
	[
		"values file",
		{ valuesFile: "/workspace/application/chart-values.yaml" },
		["application/chart-values.yaml"],
	],
	["root search", { workingDirectory: "/workspace" }, ["application/main.ts"]],
]) {
	test(`protects ${label} even when it is declared unrelated`, async () => {
		const { state, changes } = fixture();
		state.comparison.files = files.map((filename) => ({
			filename,
			status: "modified",
		}));
		assert.equal(
			await changes.requiresGeneration({ ...options, ...overrides }),
			true,
		);
	});
}

for (const [label, comparison] of [
	["diverged", { status: "diverged" }],
	["wrong base", { base_commit: { sha: "c".repeat(40) } }],
	["uncertain ancestry", { merge_base_commit: { sha: "c".repeat(40) } }],
	["missing files", { files: undefined }],
	[
		"truncated files",
		{
			files: Array.from({ length: 300 }, (_, index) => ({
				filename: `docs/${index}.md`,
				status: "modified",
			})),
		},
	],
	[
		"duplicate files",
		{ files: Array(2).fill({ filename: "docs/guide.md", status: "modified" }) },
	],
	[
		"unknown status",
		{ files: [{ filename: "docs/guide.md", status: "unknown" }] },
	],
]) {
	test(`generates for ${label} comparison`, async () => {
		const { state, changes } = fixture();
		state.comparison = { ...state.comparison, ...comparison };
		assert.equal(await changes.requiresGeneration(options), true);
	});
}

for (const invalid of [
	null,
	{ ...baseline, conclusion: "failure" },
	{ ...baseline, status: "in_progress" },
	{ ...baseline, event: "pull_request" },
	{ ...baseline, head_branch: "other" },
	{ ...baseline, head_sha: "invalid" },
	{ ...baseline, id: 20 },
]) {
	test(`generates without a trustworthy baseline: ${JSON.stringify(invalid)}`, async () => {
		const { state, changes } = fixture();
		state.baseline = invalid;
		assert.equal(await changes.requiresGeneration(options), true);
	});
}

for (const overrides of [
	{ paths: "" },
	{ paths: "../other/" },
	{ paths: "/absolute/" },
	{ attempt: 2 },
	{ attempt: undefined },
	{ checkoutRef: "" },
	{ checkoutRef: "refs/heads/other" },
	{ workflowRef: "invalid" },
	{ workingDirectory: "/outside" },
	{ valuesFile: "/outside/values.yaml" },
]) {
	test(`generates for unsupported options: ${JSON.stringify(overrides)}`, async () => {
		const { changes } = fixture();
		assert.equal(
			await changes.requiresGeneration({ ...options, ...overrides }),
			true,
		);
	});
}

for (const overrides of [
	{ eventName: "workflow_dispatch" },
	{ eventName: "pull_request" },
	{ ref: "refs/heads/other" },
	{ sha: "invalid" },
]) {
	test(`generates outside a first default-branch push: ${JSON.stringify(overrides)}`, async () => {
		const { changes, context } = fixture();
		Object.assign(context, overrides);
		assert.equal(await changes.requiresGeneration(options), true);
	});
}

for (const [label, overrides] of [
	["checkout mismatch", { head: previous }],
	["modified tracked inputs", { dirty: " M charts/values.yaml\0" }],
	["untracked template", { dirty: "?? charts/README.md.gotmpl\0" }],
	["Git failure", { gitFailure: true }],
]) {
	test(`generates after ${label}`, async () => {
		const { state, changes } = fixture();
		Object.assign(state, overrides);
		assert.equal(await changes.requiresGeneration(options), true);
	});
}

for (const endpoint of ["actions", "repos"]) {
	test(`generates after a ${endpoint} API failure`, async () => {
		const { github, changes } = fixture();
		const method =
			endpoint === "actions"
				? "listWorkflowRuns"
				: "compareCommitsWithBasehead";
		github.rest[endpoint][method] = async () => {
			throw new Error("Unavailable");
		};
		assert.equal(await changes.requiresGeneration(options), true);
	});
}

test("skips an unchanged successful revision", async () => {
	const { state, changes } = fixture();
	state.baseline = { ...baseline, head_sha: head };
	state.comparison = {
		status: "identical",
		base_commit: { sha: head },
		merge_base_commit: { sha: head },
		files: [],
	};
	assert.equal(await changes.requiresGeneration(options), false);
});
