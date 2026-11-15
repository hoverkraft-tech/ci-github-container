import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { create } from "tar";

const { stageChart, installChart } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);
const sha = (file) =>
	createHash("sha256").update(fs.readFileSync(file)).digest("hex");

function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "chart-install-test-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const workingDirectory = path.join(root, "caller with spaces");
	const source = path.join(root, "application");
	fs.mkdirSync(workingDirectory);
	fs.mkdirSync(path.join(source, "ci"), { recursive: true });
	fs.writeFileSync(
		path.join(source, "Chart.yaml"),
		"apiVersion: v2\nname: application\nversion: 1.0.0\n",
	);
	fs.writeFileSync(path.join(source, "values.yaml"), "replicaCount: 1\n");
	fs.writeFileSync(
		path.join(source, "ci/scenario-values.yaml"),
		"replicaCount: 2\n",
	);
	const archive = path.join(root, "prepared chart.tgz");
	const pack = (files = ["application"]) => {
		create({ cwd: root, file: archive, gzip: true, sync: true }, files);
		return sha(archive);
	};
	return {
		root,
		source,
		workingDirectory,
		archive,
		expectedChecksum: pack(),
		pack,
	};
}

test("installs only staged content with ordered overlays, retained settings and private credentials", async (t) => {
	const f = fixture(t);
	fs.writeFileSync(
		path.join(f.workingDirectory, "ct.yaml"),
		JSON.stringify({
			charts: ["unrelated-source"],
			all: true,
			upgrade: true,
			"skip-helm-dependencies": false,
			"chart-repos": ["unused=https://invalid.invalid"],
			"skip-clean-up": true,
			"helm-extra-args": "--timeout 120s",
			"helm-extra-set-args": "--set=existing=value",
			"release-label": "instance",
			"print-logs": false,
		}),
	);
	for (const [name, value] of [
		["first values.yaml", 3],
		["last values.yaml", 4],
	]) {
		fs.writeFileSync(
			path.join(f.workingDirectory, name),
			`replicaCount: ${value}\n`,
		);
	}
	const before = fs.readdirSync(f.workingDirectory);
	const stage = stageChart({
		...f,
		valuesFiles: "first values.yaml\nlast values.yaml",
		namespace: "default",
	});
	fs.writeFileSync(
		path.join(f.source, "values.yaml"),
		"invalid source must not be used",
	);
	const calls = [];
	await installChart({
		...stage,
		registry: "ghcr.io",
		username: "test-user",
		password: "private-password",
		helmSet: "image.tag=candidate\nlist=one,two",
		exec: {
			async exec(command, args, options) {
				calls.push(command);
				assert.equal(options.env.KUBECONFIG, stage.kubeconfig);
				assert.equal(options.env.CT_SKIP_HELM_DEPENDENCIES, "true");
				if (command === "kubectl") {
					if (args.includes("secret")) assert.equal(options.silent, true);
					else assert.deepEqual(args, ["get", "namespace", "default"]);
					return 0;
				}
				assert.equal(command, "ct");
				assert.equal(args[0], "install");
				for (const flag of [
					"--all=false",
					"--exclude-deprecated=false",
					"--chart-repos=",
					"--upgrade=false",
					"--skip-clean-up=false",
					"--print-config=false",
					"--debug=false",
				]) {
					assert(args.includes(flag), flag);
				}
				const chart = path.resolve(
					options.cwd,
					args[args.indexOf("--charts") + 1],
				);
				assert.equal(
					fs.readFileSync(path.join(chart, "values.yaml"), "utf8"),
					"replicaCount: 1\n",
				);
				assert.equal(
					fs.readFileSync(path.join(chart, "ci/scenario-values.yaml"), "utf8"),
					"replicaCount: 2\n",
				);
				const config = JSON.parse(
					fs.readFileSync(args[args.indexOf("--config") + 1], "utf8"),
				);
				assert.equal(config["release-label"], "instance");
				assert.equal(config["skip-helm-dependencies"], true);
				assert.equal(config["print-logs"], false);
				assert.equal(
					args[args.indexOf("--helm-extra-args") + 1],
					"--timeout 120s --debug=false",
				);
				const extra =
					args[args.indexOf("--helm-extra-set-args") + 1].split(" ");
				assert.equal(extra[0], "--set=existing=value");
				assert.deepEqual([extra[1], extra[3]], ["--values", "--values"]);
				assert.equal(
					fs.readFileSync(path.resolve(options.cwd, extra[2]), "utf8"),
					"replicaCount: 3\n",
				);
				assert.equal(
					fs.readFileSync(path.resolve(options.cwd, extra[4]), "utf8"),
					"replicaCount: 4\n",
				);
				assert.equal(
					extra[5],
					"--set=image.tag=candidate,list=one\\,two,imagePullSecrets[0].name=regcred",
				);
				return 0;
			},
		},
	});
	assert.deepEqual(calls, ["kubectl", "kubectl", "ct"]);
	assert.equal(sha(f.archive), f.expectedChecksum);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), before);
});

test("rejects invalid identity and namespace before producing cluster inputs", (t) => {
	const f = fixture(t);
	for (const options of [
		{ archive: "" },
		{ archive: "missing.tgz" },
		{ expectedChecksum: "" },
		{ expectedChecksum: "0".repeat(64) },
		{ namespace: "not valid" },
	]) {
		assert.throws(() => stageChart({ ...f, ...options }));
	}
	assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
});

test("rejects linked, duplicate and multi-root archive entries without touching caller files", (t) => {
	const f = fixture(t);
	fs.writeFileSync(path.join(f.workingDirectory, "keep.txt"), "caller-owned");
	fs.symlinkSync(f.workingDirectory, path.join(f.source, "link"));
	assert.throws(
		() => stageChart({ ...f, expectedChecksum: f.pack() }),
		/unsafe/,
	);
	fs.unlinkSync(path.join(f.source, "link"));
	create(
		{
			cwd: f.source,
			file: f.archive,
			sync: true,
			gzip: true,
			preservePaths: true,
		},
		["../caller with spaces/keep.txt"],
	);
	assert.throws(
		() => stageChart({ ...f, expectedChecksum: sha(f.archive) }),
		/unsafe|path/i,
	);
	assert.throws(
		() =>
			stageChart({
				...f,
				expectedChecksum: f.pack(["application", "application/values.yaml"]),
			}),
		/duplicate/,
	);
	fs.writeFileSync(path.join(f.root, "another.txt"), "extra root");
	assert.throws(
		() =>
			stageChart({
				...f,
				expectedChecksum: f.pack(["application", "another.txt"]),
			}),
		/one root/,
	);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), ["keep.txt"]);
	assert.equal(
		fs.readFileSync(path.join(f.workingDirectory, "keep.txt"), "utf8"),
		"caller-owned",
	);
});

test("removes partial staging when configuration or overlays are invalid", (t) => {
	const f = fixture(t);
	fs.writeFileSync(
		path.join(f.workingDirectory, "ct.yaml"),
		"- not a mapping\n",
	);
	assert.throws(() => stageChart(f), /mapping/);
	fs.writeFileSync(path.join(f.workingDirectory, "ct.yaml"), "{}\n");
	assert.throws(
		() => stageChart({ ...f, valuesFiles: "missing.yaml" }),
		/ENOENT/,
	);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), ["ct.yaml"]);
});

test("rejects changes between staging and installation before invoking Kubernetes", async (t) => {
	for (const target of ["archive", "extraction"]) {
		const f = fixture(t);
		const stage = stageChart(f);
		const file =
			target === "archive"
				? f.archive
				: path.join(stage.directory, "inputs/application/values.yaml");
		fs.appendFileSync(file, "modified");
		await assert.rejects(
			installChart({
				...stage,
				exec: { exec: () => assert.fail("must not invoke tools") },
			}),
			/must not modify/,
		);
		assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
	}
});

test("propagates installation failures and removes only owned staging", async (t) => {
	const f = fixture(t);
	fs.writeFileSync(path.join(f.workingDirectory, "keep.txt"), "caller-owned");
	const stage = stageChart(f);
	const calls = [];
	await assert.rejects(
		installChart({
			...stage,
			exec: {
				async exec(command, args) {
					calls.push(command);
					if (command === "kubectl") {
						if (args[0] === "get") return 1;
						assert.deepEqual(args, ["create", "namespace", stage.namespace]);
					} else throw new Error("chart readiness failed");
				},
			},
		}),
		/chart readiness failed/,
	);
	assert.deepEqual(calls, ["kubectl", "kubectl", "ct"]);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), ["keep.txt"]);
	assert.equal(sha(f.archive), f.expectedChecksum);
});

test("rejects mutation during installation and still cleans temporary inputs", async (t) => {
	const f = fixture(t);
	const stage = stageChart(f);
	await assert.rejects(
		installChart({
			...stage,
			exec: {
				async exec(command) {
					if (command === "ct")
						fs.appendFileSync(
							path.join(stage.directory, "inputs/application/values.yaml"),
							"changed",
						);
				},
			},
		}),
		/must not modify/,
	);
	assert.equal(sha(f.archive), f.expectedChecksum);
	assert.deepEqual(fs.readdirSync(f.workingDirectory), []);
});
