import {
	appendFileSync,
	copyFileSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	realpathSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import path from "node:path";
import { Command } from "./command.js";
import { Configuration } from "./configuration.js";
import { Reports } from "./reports.js";
import { Tooling } from "./tooling.js";

export { Configuration, Reports, Tooling };

const ownerLabel = "io.hoverkraft.container-test";
const sessionLabel = "org.testcontainers.session-id";

export class ContainerTest {
	constructor(state) {
		this.state = state;
	}

	static async prepare(inputs, environment) {
		const test = new ContainerTest(
			await new Configuration(inputs, environment).prepare(),
		);
		test.save();
		return test;
	}

	static load(file) {
		const state = JSON.parse(readFileSync(file, "utf8"));
		if (
			!/^[a-f0-9-]{36}$/.test(state.id) ||
			path.join(state.directory, "state.json") !== path.resolve(file)
		)
			throw new Error("Invalid container test state.");
		return new ContainerTest(state);
	}

	save() {
		const { state } = this;
		writeFileSync(
			path.join(state.directory, "state.json"),
			JSON.stringify(state),
			{ mode: 0o600 },
		);
	}

	async docker(command, args, options = {}) {
		const { state } = this;
		return command.run(
			"docker",
			[...(state.socket ? ["--host", `unix://${state.socket}`] : []), ...args],
			{ log: state.log, ...options },
		);
	}

	async resolve(command = new Command({ timeout: 180_000 })) {
		const { state } = this;
		let endpoint = process.env.DOCKER_HOST;
		if (!endpoint || process.env.DOCKER_CONTEXT) {
			const context = await this.docker(command, ["context", "inspect"]);
			endpoint = JSON.parse(context.stdout)[0]?.Endpoints?.docker?.Host;
		}
		if (!endpoint?.startsWith("unix://"))
			throw new Error("A local Unix Docker socket is required.");
		state.socket = endpoint.slice("unix://".length);
		if (!statSync(state.socket).isSocket())
			throw new Error("Docker endpoint is not a Unix socket.");
		const info = JSON.parse(
			(
				await this.docker(command, ["info", "--format", "{{json .}}"], {
					log: undefined,
				})
			).stdout,
		);
		state.daemonPlatform = Configuration.platform(
			info.OSType,
			info.Architecture,
		);
		const expected = state.requestedPlatform || state.daemonPlatform;
		if (state.identityKind === "registry")
			await this.docker(command, ["pull", "--platform", expected, state.image]);
		const image = JSON.parse(
			(
				await this.docker(command, ["image", "inspect", state.image], {
					log: undefined,
				})
			).stdout,
		)[0];
		state.imageId = image.Id;
		state.platform = Configuration.platform(
			image.Os,
			image.Architecture,
			image.Variant || "",
		);
		if (
			state.platform !== expected &&
			!state.platform.startsWith(`${expected}/`)
		)
			throw new Error(
				`Image platform ${state.platform} does not match requested ${expected}.`,
			);
		if (state.identityKind === "local" && state.image !== state.imageId)
			throw new Error("Local image identity changed.");
		this.save();
	}

	reportDefinition(workspace, mapping) {
		const { state } = this;
		if (!state.imageId || !state.platform)
			throw new Error("Resolve the image before registering its test reports.");
		const project =
			path
				.relative(realpathSync(workspace), state.workingDirectory)
				.split(path.sep)
				.join("/") || ".";
		return {
			name: "Container image tests",
			project,
			variant: {
				engine: state.engine,
				platform: state.platform,
			},
			subject: {
				kind: "image",
				name: state.image,
				digest: state.imageId,
				engine: state.engine,
				platform: state.platform,
			},
			reports: [
				{ kind: "test", pattern: "junit.xml" },
				...(state.reportFile
					? [{ kind: "test", pattern: "additional/*.xml", optional: true }]
					: []),
			],
			"path-mapping": mapping
				? JSON.parse(mapping)
				: state.engine === "testcontainers-node"
					? { "/workspace/image": project }
					: {},
		};
	}

	async stageReports(directory) {
		const copy = (source, destination) => {
			if (!lstatSync(source).isFile())
				throw new Error(
					"Native reports must be regular files without symlinks.",
				);
			Reports.fingerprint(source);
			copyFileSync(source, destination);
		};
		// Keep the engine's evidence even if an additional required report is missing.
		if (existsSync(this.state.junit))
			copy(this.state.junit, path.join(directory, "junit.xml"));
		const files = await this.reportFiles();
		const additional = files.filter(
			(file) => path.resolve(file) !== path.resolve(this.state.junit),
		);
		if (additional.length) mkdirSync(path.join(directory, "additional"));
		for (const [index, file] of additional.entries())
			copy(file, path.join(directory, "additional", `${index}.xml`));
		return files;
	}

	async node(tooling, command) {
		const { state } = this;
		const bootstrap = path.join(state.directory, "tools", "session.mjs");
		// Use the runner's public Testcontainers API. Each worker gets an exclusive
		// resource session, even when upstream reuses another invocation's Ryuk.
		writeFileSync(
			bootstrap,
			`import { createRequire } from 'node:module';
const require = createRequire('/workspace/package.json');
const { getContainerRuntimeClient, getReaper } = require('testcontainers');
const reaper = await getReaper(await getContainerRuntimeClient());
reaper.addSession(process.env.CI_CONTAINER_TEST_SESSION);
reaper.sessionId = process.env.CI_CONTAINER_TEST_SESSION;
`,
			{ mode: 0o600 },
		);
		const args = [
			"run",
			"--name",
			state.runnerName,
			"--label",
			`${ownerLabel}=${state.id}`,
			"--network",
			"host",
			"--user",
			"0:0",
			"--volume",
			`${state.socket}:/var/run/docker.sock`,
			"--volume",
			`${state.workingDirectory}:/workspace/image`,
			"--volume",
			`${path.join(state.directory, "reports")}:/reports`,
			"--volume",
			`${bootstrap}:/ci/session.mjs:ro`,
		];
		const environment = {
			CI: "true",
			NODE_OPTIONS: "--import=/ci/session.mjs",
			CI_CONTAINER_TEST_SESSION: state.id,
			TESTED_IMAGE_REF: state.imageId,
			TESTED_IMAGE_SOURCE: state.image,
			TESTED_IMAGE_PLATFORM: state.platform,
			TEST_JUNIT_REPORT_PATH: "/reports/junit.xml",
			HOST_UID: String(process.getuid()),
			HOST_GID: String(process.getgid()),
			RYUK_CONTAINER_IMAGE: tooling.reaper,
			DOCKER_HOST: "unix:///var/run/docker.sock",
			TESTCONTAINERS_HOST_OVERRIDE: "127.0.0.1",
			TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: "/var/run/docker.sock",
		};
		for (const [name, value] of Object.entries(environment))
			args.push("--env", `${name}=${value}`);
		args.push(
			tooling.nodeRunner,
			`--test-timeout=${state.timeout * 1000}`,
			...state.tests.map((file) => `/workspace/image/${file}`),
		);
		await this.docker(command, args, { quiet: false });
	}

	async goss(command) {
		const { state } = this;
		const directory = path.join(state.directory, "tools");
		await this.docker(
			command,
			[
				"run",
				...state.dockerArgs,
				"--name",
				state.runnerName,
				"--label",
				`${ownerLabel}=${state.id}`,
				"--platform",
				state.platform,
				"--volume",
				`${path.join(directory, "goss")}:/goss-bin:ro`,
				"--volume",
				`${state.workingDirectory}:/goss:ro`,
				"--entrypoint",
				"/goss-bin",
				state.imageId,
				"-g",
				"/goss/goss.yaml",
				"validate",
				"--format",
				"junit",
			],
			{ stdoutFile: state.junit, quiet: false },
		);
	}

	async run(tooling) {
		const { state } = this;
		const abort = new AbortController();
		const cancel = () => abort.abort();
		process.once("SIGTERM", cancel);
		process.once("SIGINT", cancel);
		let failure;
		try {
			const setup = new Command({ signal: abort.signal, timeout: 180_000 });
			if (!state.imageId) await this.resolve(setup);
			if (state.engine === "testcontainers-node") {
				for (const image of [tooling.nodeRunner, tooling.reaper])
					await this.docker(setup, [
						"pull",
						"--platform",
						state.daemonPlatform,
						image,
					]);
			} else await new Tooling(tooling).goss(state, setup);
			const execute = new Command({
				signal: abort.signal,
				timeout: state.timeout * 1000,
			});
			if (state.engine === "testcontainers-node")
				await this.node(tooling, execute);
			else await this.goss(execute);
			state.executed = true;
		} catch (error) {
			failure = error;
			appendFileSync(state.log, `\n${error.message}\n`);
		} finally {
			try {
				await this.cleanup();
			} catch (error) {
				failure = failure
					? new AggregateError(
							[failure, error],
							`${failure.message} Cleanup also failed: ${error.message}`,
						)
					: error;
			}
			process.removeListener("SIGTERM", cancel);
			process.removeListener("SIGINT", cancel);
			state.succeeded = !failure;
			this.save();
		}
		if (failure) throw failure;
		return state;
	}

	async cleanup() {
		const { state } = this;
		if (!state.socket) return;
		const command = new Command({ timeout: 45_000 });
		for (const label of [
			`${ownerLabel}=${state.id}`,
			`${sessionLabel}=${state.id}`,
		]) {
			const found = async (kind) =>
				(
					await this.docker(command, [
						kind,
						"ls",
						...(kind === "container" ? ["--all"] : []),
						"--quiet",
						"--filter",
						`label=${label}`,
					])
				).stdout
					.trim()
					.split("\n")
					.filter(Boolean);
			for (const id of await found("container")) {
				await this.docker(command, ["logs", id], {
					log: path.join(state.directory, "diagnostics", `${id}.log`),
					allowFailure: true,
				});
				const removed = await this.docker(
					command,
					["container", "rm", "--force", "--volumes", id],
					{ allowFailure: true },
				);
				if (removed.code !== 0 && (await found("container")).includes(id))
					throw new Error(`Could not remove owned container ${id}`);
			}
			for (const kind of ["network", "volume"]) {
				const ids = await found(kind);
				if (ids.length) {
					await this.docker(command, [kind, "rm", ...ids], {
						allowFailure: true,
					});
					if ((await found(kind)).length)
						throw new Error(`Could not remove owned ${kind} resources.`);
				}
			}
		}
	}

	async reportFiles() {
		const { state } = this;
		const files = state.reportFile
			? await Reports.select(state.workingDirectory, state.reportFile)
			: [state.junit];
		for (const file of files) {
			if (!existsSync(file))
				throw new Error(`Missing native test report: ${file}`);
			if (state.baseline[file] === Reports.fingerprint(file))
				throw new Error(`Stale report from before this invocation: ${file}`);
			new Reports(file).inspect();
		}
		return files;
	}

	result(files) {
		const { state } = this;
		if (!state.succeeded || !state.executed)
			throw new Error("Container tests did not succeed.");
		Reports.validate([state.junit]);
		const counts = Reports.validate(files, state.baseline);
		return {
			image: state.image,
			"identity-kind": state.identityKind,
			"image-id": state.imageId,
			engine: state.engine,
			suite: state.workingDirectory,
			platform: state.platform,
			"daemon-platform": state.daemonPlatform,
			run: state.run,
			attempt: state.attempt,
			tests: counts,
			reports: files,
			logs: path.join(state.directory, "diagnostics"),
		};
	}

	async finish() {
		const { state } = this;
		await this.cleanup();
		rmSync(path.join(state.directory, "tools"), {
			recursive: true,
			force: true,
		});
	}
}
