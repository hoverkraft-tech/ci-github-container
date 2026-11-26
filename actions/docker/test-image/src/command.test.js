import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { Command } from "./command.js";

test("retains command diagnostics while propagating a nonzero exit", async (t) => {
	const directory = mkdtempSync(path.join(tmpdir(), "test-image-command-"));
	t.after(() => rmSync(directory, { recursive: true, force: true }));
	const log = path.join(directory, "engine.log");
	await assert.rejects(
		new Command().run(
			process.execPath,
			["-e", "console.error('failing assertion'); process.exit(3)"],
			{ log },
		),
		/exited with 3/,
	);
	assert.match(readFileSync(log, "utf8"), /failing assertion/);
});

test("bounds an engine that never exits and reaps its process", async () => {
	await assert.rejects(
		new Command({ timeout: 150 }).run(process.execPath, [
			"-e",
			"setInterval(() => {}, 1000)",
		]),
		/timed out/,
	);
});
