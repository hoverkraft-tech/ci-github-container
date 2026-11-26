import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

export async function prepare(
	exec,
	temporaryRoot,
	sourceRegistry,
	destinationRegistry,
) {
	const context = await fs.mkdtemp(path.join(temporaryRoot, "mirror-fixture-"));
	const source = `${sourceRegistry}/mirror-test`;
	try {
		await fs.writeFile(
			path.join(context, "Dockerfile"),
			"FROM scratch\nCOPY payload /payload\n",
		);
		await fs.writeFile(
			path.join(context, "payload"),
			"immutable image mirror fixture\n",
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
			images[name] = {
				source: `${source}:${tag}@${digest}`,
				destination: `${destinationRegistry}/mirror-test:${name}`,
			};
		}
		return images;
	} finally {
		await fs.rm(context, { recursive: true, force: true });
	}
}

export async function verify(exec, images, outputs) {
	for (const [name, { source, destination }] of Object.entries(images)) {
		const digest = source.split("@")[1];
		assert.equal(outputs[name], `${destination}@${digest}`);
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
