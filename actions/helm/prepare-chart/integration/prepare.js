import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import { packageChart, planPreparation } from "../src/index.js";

const repository = fileURLToPath(new URL("../../../../", import.meta.url));
const updateAction = yaml.parse(
	fs.readFileSync(
		path.join(repository, "actions/helm/update-chart-values/action.yml"),
		"utf8",
	),
);
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const updateValues = new AsyncFunction(
	"process",
	"core",
	updateAction.runs.steps[0].with.script,
);

test("prepared archives contain current nested sources, final values and locked external dependencies", {
	timeout: 120000,
}, async (t) => {
	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), "helm-preparation-integration-"),
	);
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const chartPath = path.join(directory, "umbrella chart");
	fs.cpSync(
		path.join(repository, "tests/charts/umbrella-application"),
		chartPath,
		{ recursive: true },
	);
	const env = {
		...process.env,
		HELM_CACHE_HOME: path.join(directory, "cache"),
		HELM_CONFIG_HOME: path.join(directory, "config"),
		HELM_DATA_HOME: path.join(directory, "data"),
	};
	const command = (program, args) =>
		execFileSync(program, args, { env, encoding: "utf8", timeout: 60000 });
	const exec = {
		exec: async (program, args) => {
			command(program, args);
		},
	};
	const appPath = path.join(chartPath, "charts/app");
	const leafPath = path.join(appPath, "charts/leaf");
	fs.mkdirSync(path.join(leafPath, "templates"), { recursive: true });
	fs.writeFileSync(
		path.join(leafPath, "Chart.yaml"),
		"apiVersion: v2\nname: leaf\nversion: 0.0.0\n",
	);
	const app = yaml.parse(
		fs.readFileSync(path.join(appPath, "Chart.yaml"), "utf8"),
	);
	app.dependencies = [
		{
			name: "leaf",
			version: ">=0.0.0 <1.0.0",
			repository: "file://./charts/leaf",
			"import-values": [{ parent: "settings", child: "exports.defaults" }],
		},
	];
	fs.writeFileSync(path.join(appPath, "Chart.yaml"), yaml.stringify(app));
	const template = path.join(leafPath, "templates/current.yaml");
	fs.writeFileSync(template, "# stale nested source\n");
	command("helm", ["dependency", "update", appPath]);
	command("helm", ["repo", "add", "valkey", "https://valkey.io/valkey-helm/"]);
	command("helm", ["dependency", "build", chartPath]);
	const external = yaml
		.parse(fs.readFileSync(path.join(chartPath, "Chart.lock"), "utf8"))
		.dependencies.find((dependency) => dependency.name === "valkey");
	const archives = [];
	const literalValue = `quoted ' " value $(exit 19)`;
	for (const tag of ["1.2.3", "2.0.0"]) {
		fs.writeFileSync(template, `# current nested source ${tag}\n`);
		const plan = planPreparation({
			chartPath,
			name: "prepared",
			tag,
			values: JSON.stringify([
				{ file: "charts/app/values.yaml", path: ".image.tag", value: tag },
				{ path: ".publishedLiteral", value: literalValue },
			]),
		});
		await updateValues(
			{
				env: {
					INPUT_PATH: chartPath,
					INPUT_VALUES: JSON.stringify(plan.values),
				},
			},
			{
				setOutput: (_name, script) => command("sh", ["-c", script]),
			},
		);
		const result = await packageChart({
			exec,
			chartPath,
			charts: plan.charts,
			runnerTemp: directory,
		});
		assert.equal(
			result.checksum,
			createHash("sha256")
				.update(fs.readFileSync(result.archive))
				.digest("hex"),
		);
		const extract = path.join(directory, `extracted-${tag}`);
		fs.mkdirSync(extract);
		command("tar", ["-xzmf", result.archive, "-C", extract]);
		const prepared = path.join(extract, "prepared");
		const metadata = yaml.parse(
			fs.readFileSync(path.join(prepared, "Chart.yaml"), "utf8"),
		);
		assert.equal(metadata.name, "prepared");
		assert.equal(
			yaml.parse(fs.readFileSync(path.join(prepared, "values.yaml"), "utf8"))
				.publishedLiteral,
			literalValue,
		);
		assert.equal(metadata.version, tag);
		assert.equal(metadata.appVersion, tag);
		assert.equal(
			metadata.dependencies.find((dependency) => dependency.name === "app")
				.version,
			tag,
		);
		assert.equal(
			fs.readFileSync(
				path.join(prepared, "charts/app/charts/leaf/templates/current.yaml"),
				"utf8",
			),
			`# current nested source ${tag}\n`,
		);
		assert.equal(
			yaml.parse(
				fs.readFileSync(path.join(prepared, "charts/app/values.yaml"), "utf8"),
			).image.tag,
			tag,
		);
		assert.equal(
			yaml.parse(
				fs.readFileSync(
					path.join(prepared, "charts/app/charts/leaf/Chart.yaml"),
					"utf8",
				),
			).version,
			tag,
		);
		assert.equal(
			yaml.parse(
				fs.readFileSync(
					path.join(prepared, "charts/valkey/Chart.yaml"),
					"utf8",
				),
			).version,
			external.version,
		);
		assert.deepEqual(
			yaml
				.parse(fs.readFileSync(path.join(chartPath, "Chart.lock"), "utf8"))
				.dependencies.find((dependency) => dependency.name === "valkey"),
			external,
		);
		archives.push(result);
	}
	assert.notEqual(archives[0].archive, archives[1].archive);
	assert.notEqual(archives[0].checksum, archives[1].checksum);
	assert.equal(
		createHash("sha256")
			.update(fs.readFileSync(archives[0].archive))
			.digest("hex"),
		archives[0].checksum,
	);
});
