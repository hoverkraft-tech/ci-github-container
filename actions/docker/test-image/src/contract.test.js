import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const entrypoint =
	process.env.ACTION_ENTRYPOINT || path.join(import.meta.dirname, "index.js");
const { Configuration, ContainerTest, Reports, Tooling } = await import(
	pathToFileURL(entrypoint)
);
const image = `sha256:${"a".repeat(64)}`;
const passing =
	'<testsuites><testsuite name="image"><testcase name="ready"/></testsuite></testsuites>';

function fixture(t, files = {}) {
	const root = mkdtempSync(path.join(tmpdir(), "test-image-contract-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const directory = path.join(root, "suite with spaces");
	mkdirSync(directory);
	for (const [file, content] of Object.entries(files))
		writeFileSync(path.join(directory, file), content);
	return { root, directory };
}

test("detects native suites and requires an explicit choice for mixed suites", (t) => {
	const { directory } = fixture(t, {
		"goss.yaml": "command: {}",
		"goss_wait.yaml": "command: {}",
	});
	assert.equal(Configuration.engine(directory).engine, "goss");
	writeFileSync(path.join(directory, "image.test.js"), "import 'node:test';");
	assert.throws(() => Configuration.engine(directory), /ambiguous/);
	assert.equal(
		Configuration.engine(directory, "testcontainers-node").engine,
		"testcontainers-node",
	);
	rmSync(path.join(directory, "goss.yaml"));
	assert.equal(Configuration.engine(directory).engine, "testcontainers-node");
	assert.throws(
		() => Configuration.engine(directory, "goss"),
		/Missing or empty/,
	);
});

test("rejects missing, empty and unsupported suites without considering dependencies", (t) => {
	const { directory } = fixture(t, {
		"package.json": '{"dependencies":{"testcontainers":"*"}}',
		"goss_wait.yaml": "command: {}",
	});
	assert.throws(() => Configuration.engine(directory), /no suite/);
	writeFileSync(path.join(directory, "goss.yaml"), " \n");
	assert.throws(() => Configuration.engine(directory), /empty/);
	assert.throws(
		() => Configuration.engine(directory, "shell"),
		/Unsupported engine/,
	);
});

test("distinguishes registry manifests from local configuration IDs and rejects moving tags", () => {
	assert.equal(Configuration.identity(image), "local");
	for (const reference of [
		`ghcr.io/hoverkraft-tech/app@${image}`,
		`ghcr.io:5000/hoverkraft-tech/app:release-1@${image}`,
		`localhost/app@${image}`,
		`registry:5000/app@${image}`,
	])
		assert.equal(Configuration.identity(reference), "registry");
	for (const value of [
		"alpine:latest",
		"ghcr.io/team/app:1",
		`app@${image}`,
		`team/app@${image}`,
		`ghcr.io:bad/team/app@${image}`,
		"sha256:abc",
		`--platform=${image}`,
	])
		assert.throws(
			() => Configuration.identity(value),
			/registry digest or a local/,
		);
	assert.equal(Configuration.platform("linux", "x86_64"), "linux/amd64");
	assert.throws(() => Configuration.platform("windows", "amd64"), /Linux/);
});

test("rejects a repetitive invalid registry without blocking", () => {
	const result = spawnSync(
		process.execPath,
		[
			"--input-type=module",
			"--eval",
			`
   import assert from 'node:assert/strict';
   import { pathToFileURL } from 'node:url';
   const { Configuration } = await import(pathToFileURL(process.argv[1]));
   assert.throws(() => Configuration.identity('-.'.repeat(50_000)), /registry digest or a local/);
  `,
			entrypoint,
		],
		{ encoding: "utf8", timeout: 5_000 },
	);
	assert.ifError(result.error);
	assert.equal(result.status, 0, result.stderr);
});

test("validates inputs before allocating state and assigns independent invocation identities", async (t) => {
	const { root, directory } = fixture(t, {
		"image.test.js": "import 'node:test';",
	});
	const inputs = { image, workingDirectory: directory };
	const environment = {
		RUNNER_TEMP: root,
		GITHUB_JOB: "outer-test",
		GITHUB_RUN_ID: "123",
		GITHUB_RUN_ATTEMPT: "2",
	};
	for (const overrides of [
		{ timeout: "0" },
		{ timeout: "1.5" },
		{ timeout: "3601" },
		{ platform: "windows/amd64" },
		{ reportGroup: "job/*" },
	])
		await assert.rejects(
			new Configuration({ ...inputs, ...overrides }, environment).prepare(),
		);
	const first = await ContainerTest.prepare(inputs, environment);
	const second = await ContainerTest.prepare(inputs, environment);
	assert.notEqual(first.state.id, second.state.id);
	assert.notEqual(first.state.directory, second.state.directory);
	assert.equal(first.state.group, "outer-test");
	assert.equal(first.state.attempt, "2");
	assert.equal(
		ContainerTest.load(path.join(first.state.directory, "state.json")).state
			.image,
		image,
	);
	await first.finish();
	assert.equal(
		readFileSync(path.join(directory, "image.test.js"), "utf8"),
		"import 'node:test';",
	);
});

test("requires fresh files for every explicit report selection and preserves originals", async (t) => {
	const { directory } = fixture(t, {
		"junit.xml": passing,
		"old.xml": passing,
	});
	const file = path.join(directory, "junit.xml");
	const baseline = { [file]: Reports.fingerprint(file) };
	assert.throws(() => Reports.validate([file], baseline), /Stale/);
	await assert.rejects(
		Reports.select(directory, "junit.xml;missing.xml"),
		/No current/,
	);
	assert.deepEqual(await Reports.select(directory, "*.xml\n!old.xml"), [file]);
	assert.equal(readFileSync(file, "utf8"), passing);
	writeFileSync(file, passing.replace("ready", "current run"));
	assert.deepEqual(Reports.validate([file], baseline), {
		executed: 1,
		skipped: 0,
		failed: 0,
	});
});

test("registers the resolved image and maps native paths into the checked-out suite", async (t) => {
	const { root, directory } = fixture(t, {
		"image.test.js": "import 'node:test';",
	});
	const suite = await ContainerTest.prepare(
		{ image, workingDirectory: directory },
		{ RUNNER_TEMP: root },
	);
	assert.throws(() => suite.reportDefinition(root), /Resolve the image/);
	Object.assign(suite.state, { imageId: image, platform: "linux/amd64" });
	const definition = suite.reportDefinition(root);
	assert.equal(definition.project, "suite with spaces");
	assert.deepEqual(definition.subject, {
		kind: "image",
		name: image,
		digest: image,
		engine: "testcontainers-node",
		platform: "linux/amd64",
	});
	assert.deepEqual(definition.reports, [
		{ kind: "test", pattern: "junit.xml" },
	]);
	assert.deepEqual(definition["path-mapping"], {
		"/workspace/image": "suite with spaces",
	});
	assert.deepEqual(
		suite.reportDefinition(root, '{"/custom":"src"}')["path-mapping"],
		{ "/custom": "src" },
	);
});

test("retains engine evidence when required extra reports are absent or stale, without duplicating it", async (t) => {
	const { root, directory } = fixture(t, {
		"goss.yaml": "command: {}",
		"extra.xml": passing,
	});
	const suite = await ContainerTest.prepare(
		{ image, workingDirectory: directory, reportFile: "extra.xml" },
		{ RUNNER_TEMP: root },
	);
	const staged = path.join(root, "staged");
	mkdirSync(staged);
	writeFileSync(suite.state.junit, passing);
	await assert.rejects(suite.stageReports(staged), /Stale/);
	assert.equal(readFileSync(path.join(staged, "junit.xml"), "utf8"), passing);
	rmSync(path.join(directory, "extra.xml"));
	await assert.rejects(suite.stageReports(staged), /No current/);
	const current = passing.replace("ready", "extra check");
	writeFileSync(path.join(directory, "extra.xml"), current);
	suite.state.reportFile += `;${suite.state.junit}`;
	await suite.stageReports(staged);
	assert.equal(
		readFileSync(path.join(staged, "additional", "0.xml"), "utf8"),
		current,
	);
	assert.throws(() => readFileSync(path.join(staged, "additional", "1.xml")), {
		code: "ENOENT",
	});
	rmSync(suite.state.junit);
	symlinkSync(path.join(directory, "extra.xml"), suite.state.junit);
	await assert.rejects(suite.stageReports(staged), /without symlinks/);
});

test("rejects malformed, non-JUnit, empty, skipped-only and failed validation results", (t) => {
	const { directory } = fixture(t);
	const file = path.join(directory, "junit.xml");
	const invalid = [
		"<testsuite>",
		"<coverage/>",
		'<!DOCTYPE testsuite [<!ENTITY x "bad">]><testsuite/>',
		"<testsuite/>",
		'<testsuite><testcase name="skip"><skipped/></testcase></testsuite>',
		'<testsuite><testcase name="fail"><failure>broken</failure></testcase></testsuite>',
		'<testsuite errors="1"><testcase name="ok"/></testsuite>',
	];
	for (const content of invalid) {
		writeFileSync(file, content);
		assert.throws(() => Reports.validate([file]));
	}
	writeFileSync(
		file,
		'<testsuites failures="1"><testsuite failures="1"><testcase><failure>broken</failure></testcase></testsuite></testsuites>',
	);
	assert.deepEqual(new Reports(file).inspect(), {
		executed: 1,
		skipped: 0,
		failed: 1,
	});
	writeFileSync(
		file,
		'<testsuites><testsuite><testsuite><testcase name="ok"/><testcase name="skip"><skipped/></testcase></testsuite></testsuite></testsuites>',
	);
	assert.deepEqual(Reports.validate([file]), {
		executed: 1,
		skipped: 1,
		failed: 0,
	});
});

test("diagnostic reports never turn a failed invocation into promotion evidence", async (t) => {
	const { root, directory } = fixture(t, { "goss.yaml": "command: {}" });
	const suite = await ContainerTest.prepare(
		{ image, workingDirectory: directory },
		{ RUNNER_TEMP: root },
	);
	const { state } = suite;
	writeFileSync(state.junit, passing);
	const files = await suite.reportFiles();
	assert.deepEqual(files, [state.junit]);
	assert.throws(() => suite.result(files), /did not succeed/);
	Object.assign(state, {
		succeeded: true,
		executed: true,
		imageId: image,
		platform: "linux/amd64",
		daemonPlatform: "linux/amd64",
	});
	const result = suite.result(files);
	assert.equal(result.image, image);
	assert.equal(result["identity-kind"], "local");
	assert.equal(result.engine, "goss");
	assert.equal(result.tests.executed, 1);
	assert.equal(result.platform, "linux/amd64");
});

test("rejects a tool whose bytes do not match the published checksum", () => {
	assert.throws(
		() =>
			Tooling.verify(Buffer.from("wrong"), `${"a".repeat(64)}  goss`, "goss"),
		/SHA-256 verification failed/,
	);
});
