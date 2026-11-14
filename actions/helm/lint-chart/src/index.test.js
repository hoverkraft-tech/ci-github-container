import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { create } from "tar";

const { lintChart } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);
const hash = (file) =>
	createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function fixture(t) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "helm-lint-test-"));
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const workingDirectory = path.join(directory, "repository with spaces");
	const chart = path.join(directory, "source");
	fs.mkdirSync(workingDirectory);
	fs.mkdirSync(chart);
	fs.writeFileSync(
		path.join(chart, "Chart.yaml"),
		"apiVersion: v2\nname: application\nversion: 1.2.3\n",
	);
	fs.writeFileSync(path.join(chart, "values.yaml"), "replicaCount: 1\n");
	const archive = path.join(directory, "prepared chart.tgz");
	const pack = (files = ["source"]) => {
		create(
			{
				file: archive,
				cwd: directory,
				gzip: true,
				sync: true,
				preservePaths: true,
			},
			files,
		);
		return hash(archive);
	};
	const expectedChecksum = pack();
	return {
		directory,
		workingDirectory,
		chart,
		archive,
		expectedChecksum,
		pack,
	};
}

test("lints one unchanged archive with retained policies and ordered validation overlays", async (t) => {
	const f = fixture(t);
	const config = {
		"validate-maintainers": false,
		"lint-conf": "lintconf.yaml",
		"additional-commands": ["custom-check {{ .Path }}"],
		"helm-lint-extra-args": "--strict",
	};
	fs.writeFileSync(
		path.join(f.workingDirectory, "ct.yaml"),
		JSON.stringify(config),
	);
	fs.writeFileSync(
		path.join(f.workingDirectory, "first values.yaml"),
		"replicaCount: 2\n",
	);
	fs.writeFileSync(
		path.join(f.workingDirectory, "last values.yaml"),
		"replicaCount: 3\n",
	);
	const before = fs.readdirSync(f.workingDirectory);
	let calls = 0;
	await lintChart({
		...f,
		valuesFiles: "first values.yaml\nlast values.yaml",
		exec: {
			async exec(program, args, { cwd, env }) {
				calls++;
				assert.equal(program, "ct");
				assert(args.includes("--skip-helm-dependencies"));
				assert(args.includes("--chart-repos="));
				assert(args.includes("--all=false"));
				assert(args.includes("--exclude-deprecated=false"));
				assert.equal(env.CT_UPGRADE, "false");
				assert(args.includes("--print-config=false"));
				assert(args.includes("--debug=false"));
				assert.deepEqual(
					JSON.parse(
						fs.readFileSync(args[args.indexOf("--config") + 1], "utf8"),
					),
					{ ...config, upgrade: false },
				);
				const chart = path.resolve(cwd, args[args.indexOf("--charts") + 1]);
				assert.equal(
					fs.readFileSync(path.join(chart, "values.yaml"), "utf8"),
					"replicaCount: 1\n",
				);
				const extra =
					args[args.indexOf("--helm-lint-extra-args") + 1].split(" ");
				assert.equal(extra[0], "--strict");
				assert.equal(extra[1], "--values");
				assert.equal(extra[3], "--values");
				assert.equal(
					fs.readFileSync(path.resolve(cwd, extra[2]), "utf8"),
					"replicaCount: 2\n",
				);
				assert.equal(
					fs.readFileSync(path.resolve(cwd, extra[4]), "utf8"),
					"replicaCount: 3\n",
				);
			},
			async getExecOutput(program, args, options) {
				assert.equal(program, "helm");
				assert.equal(args[0], "template");
				assert(!args.includes("--strict"));
				assert(args.includes("--debug=false"));
				assert.equal(options.silent, true);
				const overlays = args.flatMap((arg, index) =>
					arg === "--values" ? [args[index + 1]] : [],
				);
				assert.equal(overlays.length, 2);
				assert.equal(
					fs.readFileSync(path.resolve(options.cwd, overlays[1]), "utf8"),
					"replicaCount: 3\n",
				);
				return {
					exitCode: 0,
					stdout: "rendered Secret must remain private",
					stderr: "",
				};
			},
		},
	});
	assert.equal(calls, 1);
	assert.equal(hash(f.archive), f.expectedChecksum);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), before);
});

test("rejects missing or mismatched artifact identity before invoking tools", async (t) => {
	const f = fixture(t);
	for (const expectedChecksum of ["", "a".repeat(64)]) {
		await assert.rejects(
			lintChart({
				...f,
				expectedChecksum,
				exec: { exec: () => assert.fail("must not invoke tools") },
			}),
			/checksum/i,
		);
	}
	assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
});

test("rejects unsafe entries and ambiguous chart roots before extraction", async (t) => {
	const f = fixture(t);
	fs.symlinkSync(f.workingDirectory, path.join(f.chart, "link"));
	const exec = { exec: () => assert.fail("must not invoke tools") };
	await assert.rejects(
		lintChart({ ...f, expectedChecksum: f.pack(), exec }),
		/unsafe/,
	);
	fs.unlinkSync(path.join(f.chart, "link"));
	fs.writeFileSync(path.join(f.directory, "unexpected.txt"), "caller-owned\n");
	create(
		{
			file: f.archive,
			cwd: f.chart,
			gzip: true,
			sync: true,
			preservePaths: true,
		},
		["../unexpected.txt"],
	);
	await assert.rejects(
		lintChart({ ...f, expectedChecksum: hash(f.archive), exec }),
		/unsafe/,
	);
	await assert.rejects(
		lintChart({
			...f,
			expectedChecksum: f.pack(["source", "unexpected.txt"]),
			exec,
		}),
		/one root chart/,
	);
	await assert.rejects(
		lintChart({
			...f,
			expectedChecksum: f.pack(["source", "source/Chart.yaml"]),
			exec,
		}),
		/duplicate/,
	);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
	assert.equal(
		fs.readFileSync(path.join(f.directory, "unexpected.txt"), "utf8"),
		"caller-owned\n",
	);
});

test("propagates lint failure and cleans only its temporary files", async (t) => {
	const f = fixture(t);
	fs.mkdirSync(path.join(f.workingDirectory, ".helm-lint-caller-owned"));
	await assert.rejects(
		lintChart({
			...f,
			exec: {
				async exec() {
					throw new Error("invalid chart schema");
				},
			},
		}),
		/invalid chart schema/,
	);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), [
		".helm-lint-caller-owned",
	]);
	assert.equal(hash(f.archive), f.expectedChecksum);
});

test("render failures retain diagnostics without logging rendered Secrets", async (t) => {
	const f = fixture(t);
	await assert.rejects(
		lintChart({
			...f,
			exec: {
				async exec() {},
				async getExecOutput(_program, _args, options) {
					assert.equal(options.silent, true);
					return {
						exitCode: 1,
						stdout: "private-rendered-secret",
						stderr: "required fixture value",
					};
				},
			},
		}),
		(error) => {
			assert.match(error.message, /required fixture value/);
			assert(!error.message.includes("private-rendered-secret"));
			return true;
		},
	);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
});

test("rejects successful custom commands that change the chart or original archive", async (t) => {
	for (const target of ["extraction", "archive"]) {
		const f = fixture(t);
		await assert.rejects(
			lintChart({
				...f,
				exec: {
					async exec(_program, args, { cwd }) {
						const file =
							target === "archive"
								? f.archive
								: path.join(
										cwd,
										args[args.indexOf("--charts") + 1],
										"values.yaml",
									);
						fs.appendFileSync(file, "# changed\n");
					},
				},
			}),
			/must not modify/,
		);
		assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
	}
});
