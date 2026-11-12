const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { test } = require("node:test");
const { promotionContract } = require("./contract");
const { ImagePromotion } = require("./promotion");

const raw =
	'{"schemaVersion":2,"mediaType":"application/vnd.oci.image.manifest.v1+json","config":{}}';
const digest = `sha256:${createHash("sha256").update(raw).digest("hex")}`;
const context = {
	repo: { owner: "example", repo: "application" },
	sha: "a".repeat(40),
	ref: "refs/heads/main",
	eventName: "push",
	payload: {},
	serverUrl: "https://github.com",
};
const options = {
	registry: "ghcr.io",
	repository: "example/application",
	context,
	runId: "20",
	attempt: "1",
	repositoryId: "10",
};

function candidate() {
	const base = "ghcr.io/example/application/backend";
	const tag = "candidate-10-20-1-12345678-1234-1234-1234-123456789abc";
	return {
		name: "backend",
		registry: "ghcr.io",
		repository: "example/application/backend",
		digest,
		tags: [tag],
		images: [`${base}:${tag}@${digest}`],
		platforms: ["linux/amd64"],
		"multi-platform": false,
		candidate: {
			destinations: [`${base}:main`, `${base}:latest`],
			source: { repository: "example/application", revision: context.sha },
			run: { id: "20", attempt: "1" },
		},
	};
}
function results(images = { backend: candidate() }) {
	return {
		build: {
			result: "success",
			outputs: { "built-images": JSON.stringify(images) },
		},
		test: {
			result: "success",
			outputs: { "validated-images": JSON.stringify(images) },
		},
		lint: { result: "success", outputs: {} },
	};
}
function claim(overrides = {}) {
	return {
		schema: 1,
		runId: "20",
		attempt: "1",
		createdAt: "2026-11-12T10:00:00Z",
		destinations: promotionContract.destinations({ backend: candidate() }),
		...overrides,
	};
}
function harness(overrides = {}) {
	const state = {
		writes: [],
		records: [],
		statuses: [],
		commands: [],
		manifest: raw,
		source: context.sha,
		run: {
			status: "in_progress",
			conclusion: null,
			run_attempt: 1,
			created_at: "2026-11-12T10:00:00Z",
		},
		...overrides,
	};
	const github = {
		rest: {
			actions: { getWorkflowRun: async () => ({ data: state.run }) },
			pulls: { get: async () => ({ data: state.pullRequest }) },
			repos: {
				getCommit: async () => ({ data: { sha: state.source } }),
				listDeployments: () => {},
				createDeployment: async (request) => {
					state.records.push(request);
					return { status: 201, data: { id: state.records.length } };
				},
				createDeploymentStatus: async (request) => {
					state.statuses.push(request.state);
				},
			},
		},
		paginate: async () => state.records,
	};
	const exec = {
		getExecOutput: async (command, args) => {
			state.commands.push([command, ...args]);
			if (command === "cosign") {
				if (state.badSignature)
					throw new Error("Signature verification failed");
				return { stdout: "verified" };
			}
			if (command === "gh") {
				if (state.badProvenance)
					throw new Error("Provenance verification failed");
				return {
					stdout: JSON.stringify([
						{
							verificationResult: {
								statement: {
									subject: [
										{
											name: "ghcr.io/example/application/backend",
											digest: { sha256: digest.slice(7) },
										},
									],
									predicate: {
										runDetails: {
											metadata: {
												invocationId: `https://github.com/example/application/actions/runs/20/attempts/${state.provenanceAttempt || 1}`,
											},
										},
									},
								},
							},
						},
					]),
				};
			}
			if (args.includes("--dry-run")) return { stdout: `${state.manifest}\n` };
			if (args.includes("inspect"))
				return { stdout: `Digest: ${state.badDigest || digest}\n` };
			const destination = args[args.indexOf("--tag") + 1];
			if (destination === state.failDestination)
				throw new Error("Registry write failed");
			assert(
				state.records.length > 0,
				"Publication must be journaled before writing tags",
			);
			state.writes.push(destination);
			if (state.cancelAfterWrite) state.run.status = "completed";
			return { stdout: "" };
		},
	};
	const core = { info: () => {}, warning: () => {} };
	const promotion = new ImagePromotion({
		github,
		context: structuredClone(context),
		core,
		exec,
		runId: "20",
		attempt: "1",
	});
	return { state, promotion, github };
}

test("requires all candidate producers, validation jobs and other checks to succeed", () => {
	// Arrange
	const input = results();
	// Act
	const images = promotionContract.collect(JSON.stringify(input));
	// Assert
	assert.deepEqual(promotionContract.validate(images, options), {
		backend: candidate(),
	});
});
for (const result of ["failure", "cancelled", "skipped", "", undefined]) {
	test(`rejects ${result || "missing"} required results`, () => {
		const input = results();
		input.lint.result = result;
		assert.throws(
			() => promotionContract.collect(JSON.stringify(input)),
			/did not succeed/,
		);
	});
}
for (const [name, mutate] of [
	[
		"missing producer",
		(input) => {
			delete input.build;
		},
	],
	[
		"missing validator",
		(input) => {
			delete input.test;
		},
	],
	[
		"missing image evidence",
		(input) => {
			input.test.outputs["validated-images"] = "{}";
		},
	],
	[
		"different validated digest",
		(input) => {
			const image = candidate();
			image.digest = `sha256:${"b".repeat(64)}`;
			input.test.outputs["validated-images"] = JSON.stringify({
				backend: image,
			});
		},
	],
	[
		"different destinations",
		(input) => {
			const image = candidate();
			image.candidate.destinations.pop();
			input.test.outputs["validated-images"] = JSON.stringify({
				backend: image,
			});
		},
	],
	[
		"build claiming its own validation",
		(input) => {
			Object.assign(input.build.outputs, input.test.outputs);
			delete input.test;
		},
	],
	[
		"extra validation",
		(input) => {
			input.test.outputs["validated-images"] = JSON.stringify({
				backend: candidate(),
				extra: candidate(),
			});
		},
	],
]) {
	test(`rejects ${name}`, () => {
		const input = results();
		mutate(input);
		assert.throws(() => promotionContract.collect(JSON.stringify(input)));
	});
}
for (const value of ["null", "[]", "{}", "not JSON"]) {
	test(`rejects invalid job-results ${value}`, () =>
		assert.throws(() => promotionContract.collect(value)));
}
for (const [name, mutate] of [
	[
		"unauthorized registry",
		(image) => {
			image.registry = "untrusted.example";
		},
	],
	[
		"unauthorized repository",
		(image) => {
			image.repository = "other/application/backend";
		},
	],
	[
		"cross-repository destination",
		(image) => {
			image.candidate.destinations = ["ghcr.io/other/app:main"];
		},
	],
	[
		"empty destinations",
		(image) => {
			image.candidate.destinations = [];
		},
	],
	[
		"duplicate destinations",
		(image) => {
			image.candidate.destinations.push(image.candidate.destinations[0]);
		},
	],
	[
		"candidate destination",
		(image) => {
			image.candidate.destinations = [
				`ghcr.io/${image.repository}:candidate-other`,
			];
		},
	],
	[
		"malformed destination",
		(image) => {
			image.candidate.destinations = [`ghcr.io/${image.repository}:main;echo`];
		},
	],
	[
		"stale run",
		(image) => {
			image.candidate.run.id = "19";
		},
	],
	[
		"stale attempt",
		(image) => {
			image.candidate.run.attempt = "2";
		},
	],
	[
		"stale source",
		(image) => {
			image.candidate.source.revision = "b".repeat(40);
		},
	],
	[
		"different source repository",
		(image) => {
			image.candidate.source.repository = "other/repo";
		},
	],
	[
		"missing candidate",
		(image) => {
			delete image.candidate;
		},
	],
	[
		"digest mismatch",
		(image) => {
			image.images[0] = image.images[0].replace(
				digest,
				`sha256:${"b".repeat(64)}`,
			);
		},
	],
	[
		"tag from another attempt",
		(image) => {
			image.tags[0] = image.tags[0].replace("-20-1-", "-20-2-");
		},
	],
	[
		"invalid digest",
		(image) => {
			image.digest = "sha256:invalid";
		},
	],
]) {
	test(`rejects ${name}`, () => {
		const image = candidate();
		mutate(image);
		assert.throws(() =>
			promotionContract.validate({ backend: image }, options),
		);
	});
}
for (const tag of ["pr-42", "main", "v1.2.3", "1.2.3"]) {
	test(`accepts validated same-repository ${tag} destinations`, () => {
		const image = candidate();
		image.candidate.destinations = [`ghcr.io/${image.repository}:${tag}`];
		assert.deepEqual(promotionContract.validate({ backend: image }, options), {
			backend: image,
		});
	});
}

test("retains exact digest and returns consumer metadata only after successful publication", async () => {
	const { state, promotion } = harness();
	const output = await promotion.promote({ backend: candidate() });
	assert.deepEqual(state.writes, candidate().candidate.destinations);
	assert.equal(output.backend.digest, digest);
	assert.deepEqual(output.backend.tags, ["main", "latest"]);
	assert.equal(output.backend.candidate, undefined);
	assert(output.backend.images.every((image) => image.endsWith(`@${digest}`)));
	assert.deepEqual(state.statuses, ["in_progress", "success"]);
	assert(
		state.commands.some((command) => command.includes("--prefer-index=false")),
	);
});
for (const [name, overrides] of [
	["missing signature", { badSignature: true }],
	["missing provenance", { badProvenance: true }],
	["provenance from previous attempt", { provenanceAttempt: 2 }],
	["rewritten manifest bytes", { manifest: `${raw} ` }],
	["changed candidate tag", { badDigest: `sha256:${"b".repeat(64)}` }],
	["changed source", { source: "b".repeat(40) }],
	[
		"cancelled run",
		{ run: { status: "completed", conclusion: "cancelled", run_attempt: 1 } },
	],
	[
		"superseded attempt",
		{ run: { status: "in_progress", conclusion: null, run_attempt: 2 } },
	],
]) {
	test(`rejects ${name} before any publication claim or registry write`, async () => {
		const { state, promotion } = harness(overrides);
		await assert.rejects(promotion.promote({ backend: candidate() }));
		assert.deepEqual(state.writes, []);
		assert.deepEqual(state.records, []);
	});
}
for (const [name, previous] of [
	["newer run", claim({ runId: "21", createdAt: "2026-11-12T10:01:00Z" })],
	["later same-second run", claim({ runId: "21" })],
	["newer attempt", claim({ attempt: "2" })],
	[
		"different digest in same attempt",
		claim({
			destinations: {
				[candidate().candidate.destinations[0]]: `sha256:${"b".repeat(64)}`,
			},
		}),
	],
]) {
	test(`rejects ${name} claims before registry writes, including failed publication`, async () => {
		const { state, promotion } = harness({ records: [{ payload: previous }] });
		await assert.rejects(promotion.promote({ backend: candidate() }));
		assert.deepEqual(state.writes, []);
		assert.equal(state.records.length, 1);
	});
}
test("ignores newer claims for disjoint destinations and older overlapping claims", () => {
	const records = [
		{
			payload: claim({
				runId: "30",
				createdAt: "2026-11-12T11:00:00Z",
				destinations: { "ghcr.io/example/application/other:main": digest },
			}),
		},
		{ payload: claim({ runId: "19", createdAt: "2026-11-12T09:00:00Z" }) },
	];
	assert.doesNotThrow(() =>
		promotionContract.rejectSuperseded(claim(), records),
	);
});
test("rejects unknown journal schemas instead of losing supersession protection", () => {
	assert.throws(() =>
		promotionContract.rejectSuperseded(claim(), [
			{ payload: claim({ schema: 2 }) },
		]),
	);
});
test("identical same-attempt promotion is idempotent", async () => {
	const { state, promotion } = harness();
	const first = await promotion.promote({ backend: candidate() });
	const second = await promotion.promote({ backend: candidate() });
	assert.deepEqual(second, first);
	assert.equal(state.records.length, 2);
	assert.deepEqual(state.statuses, [
		"in_progress",
		"success",
		"in_progress",
		"success",
	]);
});
test("partial tag failure preserves the claim, reports failure and permits identical recovery", async () => {
	const { state, promotion } = harness({
		failDestination: candidate().candidate.destinations[1],
	});
	await assert.rejects(
		promotion.promote({ backend: candidate() }),
		/Registry write failed/,
	);
	assert.deepEqual(state.writes, [candidate().candidate.destinations[0]]);
	assert.deepEqual(state.statuses, ["in_progress", "failure"]);
	assert.equal(state.records.length, 1);
});
test("a previously interrupted identical claim can complete", async () => {
	const { state, promotion } = harness({ records: [{ payload: claim() }] });
	await promotion.promote({ backend: candidate() });
	assert.deepEqual(state.writes, candidate().candidate.destinations);
	assert.equal(state.statuses.at(-1), "success");
});
test("cancellation after one tag stops remaining writes and retains the claim", async () => {
	const { state, promotion } = harness({ cancelAfterWrite: true });
	await assert.rejects(
		promotion.promote({ backend: candidate() }),
		/no longer running/,
	);
	assert.equal(state.writes.length, 1);
	assert.equal(state.records.length, 1);
	assert.deepEqual(state.statuses, ["in_progress", "failure"]);
});
test("journal API errors fail closed", async () => {
	const { state, promotion, github } = harness();
	github.paginate = async () => {
		throw new Error("GitHub unavailable");
	};
	await assert.rejects(
		promotion.promote({ backend: candidate() }),
		/GitHub unavailable/,
	);
	assert.deepEqual(state.writes, []);
});
test("failure to record final success withholds successful output", async () => {
	const { state, promotion, github } = harness();
	github.rest.repos.createDeploymentStatus = async (request) => {
		if (request.state === "success") throw new Error("GitHub unavailable");
	};
	await assert.rejects(
		promotion.promote({ backend: candidate() }),
		/GitHub unavailable/,
	);
	assert.deepEqual(state.writes, candidate().candidate.destinations);
	assert.equal(state.records.length, 1);
});
for (const [name, request, current] of [
	[
		"fork",
		{
			number: 1,
			head: { repo: { full_name: "fork/application" }, sha: "b".repeat(40) },
		},
		{},
	],
	[
		"closed PR",
		{
			number: 1,
			head: { repo: { full_name: "example/application" }, sha: "b".repeat(40) },
		},
		{ state: "closed", head: { sha: "b".repeat(40) } },
	],
	[
		"updated PR",
		{
			number: 1,
			head: { repo: { full_name: "example/application" }, sha: "b".repeat(40) },
		},
		{ state: "open", head: { sha: "c".repeat(40) } },
	],
]) {
	test(`rejects ${name} before writes`, async () => {
		const { state, promotion } = harness({ pullRequest: current });
		promotion.context.eventName = "pull_request";
		promotion.context.ref = "refs/pull/1/merge";
		promotion.context.payload.pull_request = request;
		await assert.rejects(promotion.promote({ backend: candidate() }));
		assert.deepEqual(state.writes, []);
	});
}

test("preflights every image before publishing any destination", async () => {
	const { state, promotion } = harness();
	const frontend = candidate();
	frontend.name = "frontend";
	frontend.repository = "example/application/frontend";
	frontend.images = frontend.images.map((reference) =>
		reference.replace("/backend:", "/frontend:"),
	);
	frontend.candidate.destinations = frontend.candidate.destinations.map(
		(reference) => reference.replace("/backend:", "/frontend:"),
	);
	await assert.rejects(
		promotion.promote({ backend: candidate(), frontend }),
		/No provenance/,
	);
	assert.deepEqual(state.writes, []);
	assert.deepEqual(state.records, []);
});

for (const [eventName, ref] of [
	["push", "refs/tags/v1.2.3"],
	["workflow_dispatch", "refs/heads/main"],
	["schedule", "refs/heads/main"],
]) {
	test(`validates the live source for ${eventName} ${ref}`, async () => {
		const { state, promotion } = harness();
		promotion.context.eventName = eventName;
		promotion.context.ref = ref;
		await promotion.promote({ backend: candidate() });
		assert.equal(state.statuses.at(-1), "success");
	});
}

test("accepts a current run reported as queued while its promotion job executes", async () => {
	const { state, promotion } = harness();
	state.run.status = "queued";
	await promotion.promote({ backend: candidate() });
	assert.equal(state.statuses.at(-1), "success");
});
