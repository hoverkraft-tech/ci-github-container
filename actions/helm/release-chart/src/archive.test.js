import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { cleanupArchiveInput, prepareArchiveInput } from "./archive.js";

const checksum = "a".repeat(64);

function fixture(t) {
	const runnerTemp = fs.mkdtempSync(path.join(os.tmpdir(), "helm-input-test-"));
	t.after(() => fs.rmSync(runnerTemp, { recursive: true, force: true }));
	return {
		artifactId: "123",
		archiveName: "chart-1.0.0.tgz",
		expectedChecksum: checksum,
		runnerTemp,
	};
}

test("local archive input preserves caller-owned files without allocating download storage", (t) => {
	const input = fixture(t);
	const archive = path.join(input.runnerTemp, "local.tgz");
	fs.writeFileSync(archive, "caller bytes");
	const resolved = prepareArchiveInput({
		archive,
		expectedChecksum: checksum,
		runnerTemp: input.runnerTemp,
	});
	cleanupArchiveInput(resolved.directory);
	assert.equal(resolved.archive, archive);
	assert.deepEqual(fs.readdirSync(input.runnerTemp), ["local.tgz"]);
	assert.equal(fs.readFileSync(archive, "utf8"), "caller bytes");
});

test("artifact inputs isolate repeated downloads and clean only the owned directory", (t) => {
	const input = fixture(t);
	const first = prepareArchiveInput(input);
	const second = prepareArchiveInput(input);
	assert.notEqual(first.directory, second.directory);
	assert.equal(path.dirname(first.archive), first.directory);
	assert.equal(path.basename(first.archive), input.archiveName);
	fs.writeFileSync(first.archive, "partial download");
	fs.writeFileSync(second.archive, "another invocation");
	cleanupArchiveInput(first.directory);
	cleanupArchiveInput(first.directory);
	assert.equal(fs.existsSync(first.directory), false);
	assert.equal(fs.readFileSync(second.archive, "utf8"), "another invocation");
});

for (const [name, overrides, message] of [
	[
		"missing source",
		{ artifactId: "", archiveName: "" },
		/local archive or one/,
	],
	["mixed sources", { archive: "local.tgz" }, /either archive or artifact-id/],
	[
		"artifact name on local input",
		{ archive: "local.tgz", artifactId: "" },
		/either archive or artifact-id/,
	],
	["multiple IDs", { artifactId: "123,456" }, /positive integer/],
	["unsafe integer ID", { artifactId: "9007199254740993" }, /positive integer/],
	["missing filename", { archiveName: "" }, /basename/],
	["parent traversal", { archiveName: "../chart.tgz" }, /basename/],
	["Windows path", { archiveName: "C:\\chart.tgz" }, /basename/],
	["control character", { archiveName: "chart\n.tgz" }, /basename/],
	["missing checksum", { expectedChecksum: "" }, /SHA-256 checksum/],
]) {
	test(`rejects ${name} before allocating download storage`, (t) => {
		const input = fixture(t);
		assert.throws(
			() => prepareArchiveInput({ ...input, ...overrides }),
			message,
		);
		assert.deepEqual(fs.readdirSync(input.runnerTemp), []);
	});
}
