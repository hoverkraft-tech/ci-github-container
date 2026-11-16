const assert = require("node:assert/strict");
const { test } = require("node:test");
const selectTags = require("./index.js");

function fixture({
	pages,
	states = {},
	owner = "owner",
	repo = "repository",
	failure,
}) {
	const calls = [];
	const list = async ({ page }) => ({ data: pages[page - 1] || [] });
	const github = {
		rest: {
			packages: {
				getAllPackageVersionsForPackageOwnedByOrg: list,
				getAllPackageVersionsForPackageOwnedByUser: list,
			},
			pulls: {
				get: async (input) => {
					calls.push(input);
					if (failure) throw failure;
					return { data: { state: states[input.pull_number] || "open" } };
				},
			},
		},
	};
	const options = {
		github,
		context: { repo: { owner, repo } },
		core: { debug() {}, warning() {}, setFailed() {} },
		imageName: `${owner}/${repo}/application`,
		pullRequestTagFilter: "^pr-([0-9]+)(?:-|$)",
		preserveTagsFilter: "^v",
		isOrganization: true,
	};
	return { calls, run: () => selectTags(options) };
}

function version(...tags) {
	return { name: tags.join(","), metadata: { container: { tags } } };
}

test("shares one PR lookup across concurrent versions and subsequent pages", async () => {
	// Arrange
	const tags = Array.from({ length: 200 }, (_, index) => `pr-42-${index}`);
	const pages = [tags.slice(0, 100), tags.slice(100)].map((page) =>
		page.map((tag) => version(tag)),
	);
	const { calls, run } = fixture({ pages, states: { 42: "closed" } });
	// Act
	const selected = await run();
	// Assert
	assert.deepEqual(selected, tags);
	assert.equal(calls.length, 1);
});

test("keeps open PRs, ambiguous versions and preserved tags out of selection", async () => {
	// Arrange
	const { calls, run } = fixture({
		pages: [
			[
				version("pr-70-build", "v1.0.0"),
				version("pr-71-build"),
				version("pr-70-shared", "pr-72-shared"),
				version("main"),
			],
		],
		states: { 70: "closed", 71: "open", 72: "closed" },
	});
	// Act
	const selected = await run();
	// Assert
	assert.deepEqual(selected, ["pr-70-build"]);
	assert.deepEqual(calls.map(({ pull_number }) => pull_number).sort(), [
		"70",
		"71",
	]);
});

for (const repo of ["repository", "another-repository"]) {
	test(`refreshes PR state for a later invocation in ${repo}`, async () => {
		// Arrange
		const pages = [[version("pr-81-build")]];
		const first = fixture({ pages, states: { 81: "closed" } });
		await first.run();
		const second = fixture({ pages, repo, states: { 81: "open" } });
		// Act
		const selected = await second.run();
		// Assert
		assert.deepEqual(selected, []);
		assert.equal(second.calls.length, 1);
	});
}

test("rejects selection when a shared PR lookup fails", async () => {
	// Arrange
	const failure = Object.assign(new Error("API unavailable"), { status: 503 });
	const { calls, run } = fixture({
		pages: [[version("pr-90-a"), version("pr-90-b")]],
		failure,
	});
	// Act and assert
	await assert.rejects(run(), failure);
	assert.equal(calls.length, 1);
});
