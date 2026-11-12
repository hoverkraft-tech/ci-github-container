const assert = require("node:assert/strict");
const { test } = require("node:test");
const { ImageVerification } = require("./verification");

const digest = `sha256:${"a".repeat(64)}`;
const first = `ghcr.io/example/application/backend@${digest}`;
const second = `ghcr.io/example/application/frontend@${digest}`;
const identity =
	"https://github.com/example/application/.github/workflows/build.yml@refs/heads/main";
const issuer = "https://token.actions.githubusercontent.com";
const options = { images: first, identity, issuer };

function harness(overrides = {}, failure) {
	const commands = [];
	const verification = new ImageVerification({ ...options, ...overrides });
	const exec = {
		exec: async (command, args) => {
			commands.push([command, ...args]);
			if (failure) return failure(commands.length);
			return 0;
		},
	};
	return { commands, verify: () => verification.verify(exec) };
}

for (const [format, images] of [
	["JSON", JSON.stringify([first, second])],
	["commas", `${first},${second}`],
	["newlines", `${first}\n${second}`],
	["spaces", ` ${first}  ${second} `],
]) {
	test(`verifies every digest with exact identity and issuer (${format})`, async () => {
		const { commands, verify } = harness({ images });
		assert.deepEqual(await verify(), [first, second]);
		assert.deepEqual(
			commands,
			[first, second].map((image) => [
				"cosign",
				"verify",
				"--certificate-oidc-issuer",
				issuer,
				"--certificate-identity",
				identity,
				image,
			]),
		);
	});
}

test("supports an explicit identity regexp and custom issuer", async () => {
	const regexp = "^https://gitlab\\.com/example/application/.*$";
	const { commands, verify } = harness({
		identity: "",
		identityRegexp: regexp,
		issuer: "https://gitlab.com",
	});
	assert.deepEqual(await verify(), [first]);
	assert.deepEqual(commands, [
		[
			"cosign",
			"verify",
			"--certificate-oidc-issuer",
			"https://gitlab.com",
			"--certificate-identity-regexp",
			regexp,
			first,
		],
	]);
});

test("normalizes tags and deduplicates only identical repository digests", async () => {
	const tagged = first.replace("@", ":main@");
	const { commands, verify } = harness({
		images: JSON.stringify([tagged, first, tagged, second]),
	});
	assert.deepEqual(await verify(), [first, second]);
	assert.equal(commands.length, 2);
});

for (const repository of [
	"localhost:5000/team/image",
	"ghcr.io/team/charts/application",
	"registry.example.com/team/image__name--part",
]) {
	test(`accepts immutable OCI references for ${repository}`, async () => {
		const image = `${repository}@${digest}`;
		assert.deepEqual(await harness({ images: image }).verify(), [image]);
	});
}

for (const [name, overrides] of [
	["empty images", { images: " " }],
	["empty list", { images: "[]" }],
	["malformed JSON", { images: "[" }],
	["non-string image", { images: JSON.stringify([42]) }],
	["non-string input", { images: [] }],
	["JSON object", { images: "{}" }],
	["mutable tag", { images: "ghcr.io/example/application:main" }],
	["missing registry", { images: `example/application@${digest}` }],
	["malformed digest", { images: "ghcr.io/example/application@sha256:bad" }],
	["option instead of reference", { images: "--insecure-ignore-tlog" }],
	["missing identity", { identity: "" }],
	["two identity policies", { identityRegexp: ".*" }],
	["empty issuer", { issuer: " " }],
]) {
	test(`rejects ${name}`, () => {
		assert.throws(() => new ImageVerification({ ...options, ...overrides }));
	});
}

test("validates all references before executing Cosign", () => {
	assert.throws(() => harness({ images: JSON.stringify([first, "invalid"]) }));
});

test("passes identity text as one argument without shell interpolation", async () => {
	const exact = "identity; $(do-not-run)";
	const { commands, verify } = harness({ identity: exact });
	await verify();
	assert.equal(commands[0][5], exact);
});

test("stops and returns no verified set when a later verification fails", async () => {
	const { commands, verify } = harness(
		{
			images: JSON.stringify([
				first,
				second,
				`ghcr.io/example/third@${digest}`,
			]),
		},
		(count) => {
			if (count === 2) throw new Error("Certificate identity mismatch");
			return 0;
		},
	);
	await assert.rejects(verify, /Certificate identity mismatch/);
	assert.equal(commands.length, 2);
});

test("rejects a nonzero verifier exit status", async () => {
	await assert.rejects(
		harness({}, () => 1).verify,
		/Signature verification failed/,
	);
});

test("propagates registry failures without returning verified images", async () => {
	await assert.rejects(
		harness({}, () => {
			throw new Error("Registry unavailable");
		}).verify,
		/Registry unavailable/,
	);
});
