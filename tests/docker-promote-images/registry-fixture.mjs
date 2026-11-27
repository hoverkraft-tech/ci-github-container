import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

export async function prepare(
	exec,
	temporaryRoot,
	sourceRegistry,
	destinationRegistry,
) {
	const context = await fs.mkdtemp(
		path.join(temporaryRoot, "promotion-fixture-"),
	);
	const source = `${sourceRegistry}/promotion-test`;
	try {
		await fs.writeFile(
			path.join(context, "Dockerfile"),
			"FROM scratch\nCOPY payload /payload\n",
		);
		await fs.writeFile(
			path.join(context, "payload"),
			"immutable image promotion fixture\n",
		);
		for (const architecture of ["amd64", "arm64"]) {
			await exec.exec("docker", [
				"buildx",
				"build",
				"--builder",
				"default",
				"--provenance=false",
				"--platform",
				`linux/${architecture}`,
				"--tag",
				`${source}:${architecture}`,
				"--push",
				context,
			]);
		}
		await exec.exec("docker", [
			"buildx",
			"imagetools",
			"create",
			"--tag",
			`${source}:multi`,
			`${source}:amd64`,
			`${source}:arm64`,
		]);
		const images = {};
		for (const [name, tag] of [
			["single", "amd64"],
			["multi", "multi"],
		]) {
			const result = await exec.getExecOutput("docker", [
				"buildx",
				"imagetools",
				"inspect",
				"--format",
				"{{json .Manifest}}",
				`${source}:${tag}`,
			]);
			const { digest } = JSON.parse(result.stdout);
			assert.match(digest, /^sha256:[a-f0-9]{64}$/);
			await fs.writeFile(
				path.join(context, "evidence.json"),
				JSON.stringify({ fixture: name }),
			);
			await exec.exec("regctl", [
				"artifact",
				"put",
				"--subject",
				`${source}@${digest}`,
				"--artifact-type",
				"application/vnd.hoverkraft.test+json",
				"--file",
				path.join(context, "evidence.json"),
			]);
			await exec.exec("regctl", [
				"artifact",
				"put",
				`${source}:sha256-${digest.slice(7)}.sig`,
				"--artifact-type",
				"application/vnd.hoverkraft.legacy-test+json",
				"--file",
				path.join(context, "evidence.json"),
			]);
			images[name] = {
				source: `${source}:${tag}@${digest}`,
				destination: `${destinationRegistry}/promotion-test:${name}`,
			};
		}
		return images;
	} finally {
		await fs.rm(context, { recursive: true, force: true });
	}
}

// These local registries exercise the copy tool's transport and attachment contract.
// The existing hosted promotion fixture verifies real builder signatures/provenance.
export async function copyAndVerify(exec, images) {
	for (const [name, { source, destination }] of Object.entries(images)) {
		const digest = source.split("@")[1];
		const targetRepository = destination.slice(0, destination.lastIndexOf(":"));
		const target = `${targetRepository}@${digest}`;
		await exec.exec("regctl", [
			"image",
			"copy",
			"--referrers",
			"--digest-tags",
			source,
			target,
		]);
		await exec.exec("docker", [
			"buildx",
			"imagetools",
			"create",
			"--prefer-index=false",
			"--tag",
			destination,
			target,
		]);
		const result = await exec.getExecOutput("docker", [
			"buildx",
			"imagetools",
			"inspect",
			"--format",
			"{{json .Manifest}}",
			destination,
		]);
		assert.equal(JSON.parse(result.stdout).digest, digest);
		const referrers = async (reference) =>
			JSON.parse(
				(
					await exec.getExecOutput("regctl", [
						"artifact",
						"list",
						reference,
						"--format",
						"body",
					])
				).stdout,
			)
				.manifests.map((ref) => ref.digest)
				.sort();
		const expectedReferrers = await referrers(source);
		assert(expectedReferrers.length > 0, "Fixture must have OCI referrers");
		assert.deepEqual(await referrers(target), expectedReferrers);
		const legacy = `sha256-${digest.slice(7)}.sig`;
		const originalRepository = source.slice(0, source.indexOf("@"));
		const original = originalRepository.slice(
			0,
			originalRepository.lastIndexOf(":"),
		);
		const legacyManifest = async (repository) =>
			(
				await exec.getExecOutput("docker", [
					"buildx",
					"imagetools",
					"inspect",
					"--raw",
					`${repository}:${legacy}`,
				])
			).stdout;
		assert.equal(
			await legacyManifest(targetRepository),
			await legacyManifest(original),
		);
		const inspect = async (reference) =>
			JSON.parse(
				(
					await exec.getExecOutput("docker", [
						"buildx",
						"imagetools",
						"inspect",
						"--raw",
						reference,
					])
				).stdout,
			);
		const expected = await inspect(source);
		assert.deepEqual(await inspect(destination), expected);
		if (name === "multi") {
			assert.deepEqual(
				expected.manifests.map(({ platform }) => platform.architecture).sort(),
				["amd64", "arm64"],
			);
		} else {
			assert(
				!expected.manifests,
				"A single-platform manifest must not be wrapped in an index",
			);
		}
	}
}
