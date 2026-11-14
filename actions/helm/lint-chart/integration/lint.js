import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { create, extract } from "tar";
import yaml from "yaml";
import { lintChart } from "../src/index.js";

const repository = fileURLToPath(new URL("../../../../", import.meta.url));
const checksum = (file) =>
	createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("chart-testing preserves metadata, YAML, schema and template checks on prepared archives", {
	timeout: 120000,
}, async (t) => {
	const directory = fs.mkdtempSync(
		path.join(os.tmpdir(), "helm-lint-integration-"),
	);
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const env = {
		...process.env,
		HELM_CACHE_HOME: path.join(directory, "cache"),
		HELM_CONFIG_HOME: path.join(directory, "config"),
		HELM_DATA_HOME: path.join(directory, "data"),
	};
	const execute = (program, args, options = {}) =>
		execFileSync(program, args, {
			env,
			encoding: "utf8",
			stdio: "pipe",
			timeout: 60000,
			...options,
		});
	const exec = {
		exec: async (program, args, options) => {
			execute(program, args, options);
		},
		getExecOutput: async (program, args, options) => {
			const result = spawnSync(program, args, {
				env,
				encoding: "utf8",
				timeout: 60000,
				...options,
			});
			if (result.error) throw result.error;
			return {
				exitCode: result.status,
				stdout: result.stdout,
				stderr: result.stderr,
			};
		},
	};
	let preparedArchive = process.env.PREPARED_ARCHIVE;
	if (!preparedArchive) {
		const source = path.join(directory, "source");
		fs.cpSync(path.join(repository, "tests/charts/application"), source, {
			recursive: true,
		});
		execute("helm", [
			"repo",
			"add",
			"valkey",
			"https://valkey.io/valkey-helm/",
		]);
		execute("helm", ["dependency", "build", source]);
		execute("helm", ["package", source, "--destination", directory]);
		preparedArchive = path.join(
			directory,
			fs.readdirSync(directory).find((file) => file.endsWith(".tgz")),
		);
	}
	const originalChecksum = checksum(preparedArchive);
	const workingDirectory = path.join(directory, "repository with spaces");
	fs.mkdirSync(workingDirectory);
	const config = {
		"chart-yaml-schema": path.join(
			repository,
			"tests/charts/chart-schema.yaml",
		),
		"lint-conf": path.join(repository, "tests/charts/lintconf.yaml"),
		"validate-maintainers": false,
		// A selected prepared chart must not discover source charts or refresh repositories.
		all: true,
		charts: ["missing-source-chart"],
		"chart-repos": ["unused=https://invalid.invalid"],
		"skip-helm-dependencies": false,
		upgrade: true,
	};
	fs.writeFileSync(
		path.join(workingDirectory, "ct.yaml"),
		yaml.stringify(config),
	);
	await lintChart({
		exec,
		archive: preparedArchive,
		expectedChecksum: originalChecksum,
		workingDirectory,
	});
	const scenarios = [
		{
			name: "metadata",
			file: "Chart.yaml",
			mutate: (content) => content.replace(/^apiVersion:.*\n/m, ""),
			error: /apiVersion|schema/i,
		},
		{
			name: "yaml-policy",
			file: "values.yaml",
			mutate: (content) => `${content}\nreplicaCount: 1\nreplicaCount: 2\n`,
			error: /duplication|duplicate/i,
		},
		{
			name: "values-schema",
			file: "values.yaml",
			mutate: (content) =>
				yaml.stringify({ ...yaml.parse(content), replicaCount: "invalid" }),
			error: /replicaCount|schema/i,
		},
		{
			name: "template",
			file: "templates/invalid.tpl",
			mutate: () => '{{ fail "invalid-template-fixture" }}\n',
			error: /invalid-template-fixture/,
		},
	];
	for (const scenario of scenarios) {
		await t.test(scenario.name, async () => {
			const unpacked = path.join(directory, scenario.name);
			fs.mkdirSync(unpacked);
			extract({
				file: preparedArchive,
				cwd: unpacked,
				sync: true,
				strict: true,
			});
			const name = fs.readdirSync(unpacked)[0];
			const file = path.join(unpacked, name, scenario.file);
			fs.writeFileSync(
				file,
				scenario.mutate(
					fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "",
				),
			);
			const archive = path.join(directory, `${scenario.name}.tgz`);
			create({ file: archive, cwd: unpacked, gzip: true, sync: true }, [name]);
			const expectedChecksum = checksum(archive);
			await assert.rejects(
				lintChart({ exec, archive, expectedChecksum, workingDirectory }),
				(error) => {
					assert.match(
						`${error.message}\n${error.stdout ?? ""}\n${error.stderr ?? ""}`,
						scenario.error,
					);
					return true;
				},
			);
			if (scenario.name === "values-schema") {
				fs.writeFileSync(
					path.join(workingDirectory, "first values.yaml"),
					"replicaCount: invalid\n",
				);
				fs.writeFileSync(
					path.join(workingDirectory, "last values.yaml"),
					"replicaCount: 2\n",
				);
				await lintChart({
					exec,
					archive,
					expectedChecksum,
					workingDirectory,
					valuesFiles: "first values.yaml\nlast values.yaml",
				});
			}
			assert.equal(checksum(archive), expectedChecksum);
			assert(
				!fs
					.readdirSync(workingDirectory)
					.some((entry) => entry.startsWith(".helm-lint-")),
			);
		});
	}
	assert.equal(checksum(preparedArchive), originalChecksum);
});
