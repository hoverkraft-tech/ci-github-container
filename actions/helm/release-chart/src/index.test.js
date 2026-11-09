import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import yaml from "yaml";

const { run } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);

function fixture(t, dependencies = []) {
	const chartPath = fs.mkdtempSync(path.join(os.tmpdir(), "chart-lock-"));
	t.after(() => fs.rmSync(chartPath, { recursive: true, force: true }));
	const chart = {
		apiVersion: "v2",
		name: "example",
		version: "1.2.3",
		dependencies,
	};
	fs.writeFileSync(path.join(chartPath, "Chart.yaml"), yaml.stringify(chart));
	const lockPath = path.join(chartPath, "Chart.lock");
	const errors = [];
	const core = { debug() {}, setFailed: (message) => errors.push(message) };
	return { chartPath, lockPath, errors, core };
}

test("charts without dependencies do not need a lockfile", (t) => {
	const f = fixture(t);
	run({ ...f, tag: "1.2.3" });
	assert.deepEqual(f.errors, []);
	assert.equal(fs.existsSync(f.lockPath), false);
});

test("missing lockfile fails when dependencies are present", (t) => {
	const f = fixture(t, [
		{ name: "child", version: "1.2.3", repository: "file://child" },
	]);
	run({ ...f, tag: "1.2.3" });
	assert.deepEqual(f.errors, [`Chart.lock file not found: ${f.lockPath}`]);
});

test("external and already versioned local dependencies keep the original lockfile", (t) => {
	for (const repository of ["https://charts.example.test", "file://child"]) {
		const dependencies = [{ name: "child", version: "1.2.3", repository }];
		const f = fixture(t, dependencies);
		const original = `# User comment\n${yaml.stringify({ dependencies, generated: "unchanged", digest: "sha256:unchanged" })}`;
		fs.writeFileSync(f.lockPath, original);
		run({ ...f, tag: "2.0.0" });
		assert.equal(fs.readFileSync(f.lockPath, "utf8"), original);
		assert.deepEqual(f.errors, []);
	}
});

test("local placeholder versions are replaced and the Helm digest is updated", (t) => {
	const dependency = {
		name: "child",
		version: "1.2.3",
		repository: "file://child",
	};
	const f = fixture(t, [dependency]);
	fs.writeFileSync(
		f.lockPath,
		yaml.stringify({ dependencies: [{ ...dependency, version: "0.0.0" }] }),
	);
	run({ ...f, tag: "1.2.3" });
	const lock = yaml.parse(fs.readFileSync(f.lockPath, "utf8"));
	assert.deepEqual(lock.dependencies, [dependency]);
	assert.equal(
		lock.digest,
		"sha256:6ee08f66523d9958320413765343a91c3d328a69e03b9b798b1dc0c3bb835c9b",
	);
	assert.ok(Number.isFinite(Date.parse(lock.generated)));
	assert.deepEqual(f.errors, []);
});

test("malformed YAML fails without changing the lockfile", (t) => {
	const f = fixture(t, [{ name: "child" }]);
	fs.writeFileSync(f.lockPath, "dependencies: [");
	assert.throws(() => run({ ...f, tag: "1.2.3" }));
	assert.equal(fs.readFileSync(f.lockPath, "utf8"), "dependencies: [");
});
