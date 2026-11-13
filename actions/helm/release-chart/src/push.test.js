import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import yaml from "yaml";

const action = yaml.parse(
	fs.readFileSync(new URL("../action.yml", import.meta.url), "utf8"),
);
const script = action.runs.steps.find((step) => step.id === "chart-releaser")
	.with.script;
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const execute = new AsyncFunction(
	"require",
	"process",
	"core",
	"exec",
	"setTimeout",
	script,
);
const digest = `sha256:${"a".repeat(64)}`;
const image = "registry.example.com/charts/application:1.2.3";
const tagNotFound = `Error: failed to perform "Tag" on destination: ${digest}: not found`;
const pushOutput = `Pushed: ${image}\nDigest: ${digest}\n`;

function fixture(
	t,
	{
		visibleAfter = 0,
		pushError = tagNotFound,
		errorStream = "stderr",
		output = pushOutput,
		logoutFails = false,
		validationValues = "",
		validationFailure,
	} = {},
) {
	const runnerTemp = fs.mkdtempSync(path.join(os.tmpdir(), "helm-push-test-"));
	t.after(() => fs.rmSync(runnerTemp, { recursive: true, force: true }));
	const state = {
		commands: [],
		pushes: [],
		outputs: {},
		warnings: [],
		delays: [],
		elapsed: 0,
		validations: [],
	};
	const core = {
		setOutput: (name, value) => {
			state.outputs[name] = value;
		},
		warning: (message) => state.warnings.push(message),
	};
	const exec = {
		exec: async (command, args, options) => {
			assert.equal(command, "helm");
			state.commands.push(args);
			if (args[0] === "package") {
				const destination = args[args.indexOf("--destination") + 1];
				fs.writeFileSync(
					path.join(destination, "application-1.2.3.tgz"),
					"packaged chart",
				);
			} else if (["lint", "template"].includes(args[0])) {
				const archive = args.find((arg) => arg.endsWith(".tgz"));
				state.validations.push({
					args,
					options,
					archive: fs.readFileSync(archive, "utf8"),
				});
				assert.equal(state.pushes.length, 0);
				if (args[0] === validationFailure)
					throw new Error(`${validationFailure} failed`);
			} else if (args[1] === "login") {
				const config = args[args.indexOf("--registry-config") + 1];
				fs.writeFileSync(config, "test credentials");
			} else {
				assert.equal(args[1], "logout");
				if (logoutFails) throw new Error("logout unavailable");
			}
		},
		getExecOutput: async (command, args, options) => {
			assert.equal(command, "helm");
			assert.equal(args[0], "push");
			state.pushes.push({
				args,
				archive: fs.readFileSync(args[1], "utf8"),
				mtime: fs.statSync(args[1]).mtimeMs,
			});
			if (state.elapsed >= visibleAfter) {
				return { exitCode: 0, stdout: "", stderr: output };
			}
			if (!options?.ignoreReturnCode) throw new Error(pushError);
			return { exitCode: 1, stdout: "", stderr: "", [errorStream]: pushError };
		},
	};
	const run = () =>
		execute(
			createRequire(import.meta.url),
			{
				env: {
					RUNNER_TEMP: runnerTemp,
					INPUT_PATH: runnerTemp,
					INPUT_TAG: "1.2.3",
					INPUT_REGISTRY: "registry.example.com",
					INPUT_USERNAME: "test-user",
					INPUT_PASSWORD: "test-password",
					CHART_REPOSITORY: "charts",
					INPUT_VALIDATION_VALUES: validationValues,
				},
			},
			core,
			exec,
			(callback, delay) => {
				state.delays.push(delay);
				state.elapsed += delay;
				callback();
			},
		);
	return { state, run, runnerTemp };
}

function assertCleanup({ state, runnerTemp }) {
	assert.equal(state.commands.filter((args) => args[1] === "logout").length, 1);
	assert.deepEqual(fs.readdirSync(runnerTemp), []);
}

function assertOutputs(state) {
	assert.deepEqual(state.outputs, {
		image,
		digest,
		"image-digest": `registry.example.com/charts/application@${digest}`,
	});
}

test("successful chart pushes return the immutable digest without waiting", async (t) => {
	const f = fixture(t);
	await f.run();
	assertOutputs(f.state);
	assert.equal(f.state.pushes.length, 1);
	assert.deepEqual(f.state.delays, []);
	assertCleanup(f);
});

test("validation checks the published archive with ordered values and hides rendered manifests", async (t) => {
	const f = fixture(t, {
		validationValues: " first values.yaml\r\n\nsecond.yaml ",
	});
	await f.run();
	const archive = f.state.pushes[0].args[1];
	const values = [
		"--values",
		path.resolve("first values.yaml"),
		"--values",
		path.resolve("second.yaml"),
	];
	assert.deepEqual(f.state.validations, [
		{
			args: ["lint", "--strict", archive, ...values],
			options: undefined,
			archive: f.state.pushes[0].archive,
		},
		{
			args: ["template", "release-validation", archive, ...values],
			options: { silent: true },
			archive: f.state.pushes[0].archive,
		},
	]);
	assertOutputs(f.state);
	assertCleanup(f);
});

for (const validationFailure of ["lint", "template"]) {
	test(`${validationFailure} failure blocks publication and cleans temporary files`, async (t) => {
		const f = fixture(t, {
			validationValues: "values.yaml",
			validationFailure,
		});
		await assert.rejects(f.run, new RegExp(`${validationFailure} failed`));
		assert.equal(f.state.pushes.length, 0);
		assert.deepEqual(f.state.outputs, {});
		assert.deepEqual(f.state.delays, []);
		assertCleanup(f);
	});
}

for (const errorStream of ["stderr", "stdout"]) {
	test(`chart tag visibility failures on ${errorStream} retry the unchanged archive`, async (t) => {
		const f = fixture(t, { visibleAfter: 90000, errorStream });
		await f.run();
		assertOutputs(f.state);
		assert(f.state.elapsed >= 90000 && f.state.elapsed <= 180000);
		assert.equal(
			f.state.commands.filter((args) => args[0] === "package").length,
			1,
		);
		assert.equal(
			f.state.commands.filter((args) => args[1] === "login").length,
			1,
		);
		for (const push of f.state.pushes)
			assert.deepEqual(push, f.state.pushes[0]);
		assertCleanup(f);
	});
}

test("persistent chart tag failures stop after bounded retries and clean credentials", async (t) => {
	const f = fixture(t, { visibleAfter: Infinity });
	await assert.rejects(f.run, /failed to perform "Tag" on destination/);
	assert(f.state.pushes.length > 1 && f.state.pushes.length <= 6);
	assert(f.state.elapsed <= 180000);
	assert.equal(f.state.delays.length, f.state.pushes.length - 1);
	assert.deepEqual(f.state.outputs, {});
	assertCleanup(f);
});

for (const pushError of [
	"unauthorized",
	"403 Forbidden",
	"chart archive not found",
]) {
	test(`chart pushes fail immediately for ${pushError}`, async (t) => {
		const f = fixture(t, { visibleAfter: Infinity, pushError });
		await assert.rejects(f.run, (error) => error.message.includes(pushError));
		assert.equal(f.state.pushes.length, 1);
		assert.deepEqual(f.state.delays, []);
		assert.deepEqual(f.state.outputs, {});
		assertCleanup(f);
	});
}

test("a push without an immutable digest fails without publishing outputs", async (t) => {
	const f = fixture(t, { output: `Pushed: ${image}\n` });
	await assert.rejects(
		f.run,
		/did not return a chart reference and SHA-256 manifest digest/,
	);
	assert.equal(f.state.pushes.length, 1);
	assert.deepEqual(f.state.outputs, {});
	assertCleanup(f);
});

test("logout errors still remove temporary credentials after a successful push", async (t) => {
	const f = fixture(t, { logoutFails: true });
	await f.run();
	assertOutputs(f.state);
	assert(
		f.state.warnings.some((message) => message.includes("logout unavailable")),
	);
	assertCleanup(f);
});
