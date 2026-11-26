import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { ImageMirror } from "./mirror.js";

const digest = `sha256:${"a".repeat(64)}`;
const source = `ghcr.io/example/app:validated@${digest}`;
const destination = "docker.io/example/app:1.2.3";

test("mirroring requires an immutable source and an explicit registry tag", () => {
	const mirror = new ImageMirror(source, destination);
	assert.equal(mirror.source, `ghcr.io/example/app@${digest}`);
	assert.equal(mirror.sourceRegistry, "ghcr.io");
	assert.equal(mirror.destinationRegistry, "docker.io");
	for (const invalid of [
		"ghcr.io/example/app:latest",
		`example/app@${digest}`,
		"--help",
		`${source}\nextra`,
		`${source}\n`,
	]) {
		assert.throws(() => new ImageMirror(invalid, destination));
	}
	for (const invalid of [
		"docker.io/example/app",
		source,
		"example/app:latest",
		"docker.io/example/app:bad tag",
		`${destination}\n`,
	]) {
		assert.throws(() => new ImageMirror(source, invalid));
	}
});

test("mirroring reports the unchanged digest and cleans its metadata", async (t) => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "mirror-contract-"));
	t.after(() => fs.rm(root, { recursive: true, force: true }));
	const mirror = new ImageMirror(source, destination);
	const execute = (publishedDigest) => ({
		exec: async (_command, args) => {
			await fs.writeFile(
				args[args.indexOf("--metadata-file") + 1],
				JSON.stringify({
					"containerimage.descriptor": { digest: publishedDigest },
				}),
			);
		},
	});
	assert.equal(
		await mirror.copy(execute(digest), root),
		`${destination}@${digest}`,
	);
	assert.deepEqual(await fs.readdir(root), []);
	await assert.rejects(
		mirror.copy(execute(`sha256:${"b".repeat(64)}`), root),
		/Mirrored digest differs/,
	);
	assert.deepEqual(await fs.readdir(root), []);
	await assert.rejects(
		mirror.copy(
			{
				exec: async () => {
					throw new Error("denied");
				},
			},
			root,
		),
		/denied/,
	);
	assert.deepEqual(await fs.readdir(root), []);
});
