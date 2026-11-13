import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import yaml from "yaml";

const { planPreparation, buildDependencies, packageChart } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);

function fixture(t, dependencies = []) {
	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), "helm-prepare-test-"),
	);
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const chartPath = path.join(directory, "chart");
	const runnerTemp = path.join(directory, "output");
	fs.mkdirSync(chartPath);
	fs.mkdirSync(runnerTemp);
	fs.writeFileSync(
		path.join(chartPath, "Chart.yaml"),
		yaml.stringify({
			apiVersion: "v2",
			name: "example",
			version: "1.2.3",
			dependencies,
		}),
	);
	return { chartPath, runnerTemp };
}

function localFixture(t) {
	const dependency = {
		name: "child",
		version: "1.2.3",
		repository: "file://child",
	};
	const f = fixture(t, [dependency]);
	const child = path.join(f.chartPath, "child");
	fs.mkdirSync(child);
	fs.writeFileSync(
		path.join(child, "Chart.yaml"),
		yaml.stringify({
			apiVersion: "v2",
			name: "child",
			version: "1.2.3",
		}),
	);
	const lockPath = path.join(f.chartPath, "Chart.lock");
	fs.writeFileSync(
		lockPath,
		`# Preserve when unchanged\n${yaml.stringify({
			dependencies: [dependency],
			digest:
				"sha256:6ee08f66523d9958320413765343a91c3d328a69e03b9b798b1dc0c3bb835c9b",
			generated: "2026-01-01T00:00:00Z",
		})}`,
	);
	return { ...f, child, lockPath };
}

test("charts without dependencies package once and expose the archive checksum", async (t) => {
	const f = fixture(t);
	const { charts } = planPreparation(f);
	let packages = 0;
	const exec = {
		exec: async (_command, args) => {
			assert.equal(args[0], "package");
			packages++;
			fs.writeFileSync(
				path.join(args.at(-1), "example-1.2.3.tgz"),
				"chart bytes",
			);
		},
	};
	const result = await packageChart({ ...f, charts, exec });
	assert.equal(packages, 1);
	assert.equal(fs.readFileSync(result.archive, "utf8"), "chart bytes");
	assert.equal(
		result.checksum,
		createHash("sha256").update("chart bytes").digest("hex"),
	);
	assert.equal(fs.existsSync(path.join(f.chartPath, "Chart.lock")), false);
});

for (const state of ["missing", "stale", "malformed"]) {
	test(`${state} dependency lock fails before preparation`, (t) => {
		const f = localFixture(t);
		if (state === "missing") fs.unlinkSync(f.lockPath);
		if (state === "stale")
			fs.writeFileSync(f.lockPath, "dependencies: []\ndigest: sha256:stale\n");
		if (state === "malformed") fs.writeFileSync(f.lockPath, "dependencies: [");
		const original = fs.existsSync(f.lockPath)
			? fs.readFileSync(f.lockPath, "utf8")
			: null;
		assert.throws(() => planPreparation(f));
		assert.equal(
			fs.existsSync(f.lockPath) ? fs.readFileSync(f.lockPath, "utf8") : null,
			original,
		);
	});
}

test("metadata updates include every local chart and leave published overrides last", (t) => {
	const f = localFixture(t);
	const override = {
		file: "Chart.yaml",
		path: ".appVersion",
		value: "application-version",
	};
	const plan = planPreparation({
		...f,
		name: "published",
		tag: "2.0.0",
		values: JSON.stringify([override]),
	});
	assert(
		plan.values.some(
			(value) =>
				value.file === "child/Chart.yaml" &&
				value.path === ".version" &&
				value.value === "2.0.0",
		),
	);
	assert(
		plan.values.some(
			(value) =>
				value.file === "Chart.yaml" &&
				value.path === ".dependencies[0].version" &&
				value.value === "2.0.0",
		),
	);
	assert(
		plan.values.some(
			(value) => value.path === ".name" && value.value === "published",
		),
	);
	assert.deepEqual(plan.values.at(-1), override);
	assert.throws(() => planPreparation({ ...f, values: "{}" }), /not an array/);
});

test("unchanged local locks retain their exact contents", async (t) => {
	const f = localFixture(t);
	const original = fs.readFileSync(f.lockPath, "utf8");
	await buildDependencies({
		charts: planPreparation(f).charts,
		exec: { exec: async () => {} },
	});
	assert.equal(fs.readFileSync(f.lockPath, "utf8"), original);
});

test("preparation does not accept dependency identity changes after planning", async (t) => {
	const f = localFixture(t);
	const { charts } = planPreparation(f);
	const file = path.join(f.chartPath, "Chart.yaml");
	const chart = yaml.parse(fs.readFileSync(file, "utf8"));
	chart.dependencies[0].repository = "https://charts.example.test";
	fs.writeFileSync(file, yaml.stringify(chart));
	await assert.rejects(
		buildDependencies({
			charts,
			exec: { exec: async () => assert.fail("must fail before Helm") },
		}),
		/only change local dependency versions/,
	);
});

for (const failure of ["command", "ambiguous output"]) {
	test(`failed packaging (${failure}) removes partial archives`, async (t) => {
		const f = fixture(t);
		const exec = {
			exec: async (_command, args) => {
				fs.writeFileSync(path.join(args.at(-1), "partial.tgz"), "partial");
				if (failure === "command") throw new Error("package failed");
				fs.writeFileSync(
					path.join(args.at(-1), "unexpected.tgz"),
					"unexpected",
				);
			},
		};
		await assert.rejects(
			packageChart({ ...f, charts: planPreparation(f).charts, exec }),
		);
		assert.deepEqual(fs.readdirSync(f.runnerTemp), []);
	});
}
