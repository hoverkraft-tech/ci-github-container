import { randomUUID } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	realpathSync,
	statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Reports } from "./reports.js";

export class Configuration {
	constructor(inputs, environment = process.env) {
		this.inputs = inputs;
		this.environment = environment;
	}

	static identity(image) {
		if (/^sha256:[a-f0-9]{64}$/.test(image)) return "local";
		// Match the registry once; overlapping dot-separated alternatives can backtrack.
		const match =
			/^(?<registry>[a-z0-9.-]+(?::[0-9]+)?)\/[a-z0-9._/-]+(?::[a-zA-Z0-9._-]+)?@sha256:[a-f0-9]{64}$/.exec(
				image,
			);
		const registry = match?.groups.registry;
		if (
			registry &&
			(registry === "localhost" ||
				registry.includes(".") ||
				registry.includes(":"))
		)
			return "registry";
		throw new Error(
			"image must be a fully qualified registry digest or a local sha256 image ID; tags alone are not accepted.",
		);
	}

	static engine(directory, requested = "auto") {
		if (!["auto", "goss", "testcontainers-node"].includes(requested))
			throw new Error(`Unsupported engine: ${requested}`);
		const files = readdirSync(directory, { withFileTypes: true })
			.filter((entry) => entry.isFile())
			.map((entry) => entry.name);
		const matches = {
			goss: files.filter((file) => file === "goss.yaml"),
			"testcontainers-node": files.filter((file) => file.endsWith(".test.js")),
		};
		const detected = Object.keys(matches).filter(
			(engine) => matches[engine].length,
		);
		if (requested === "auto" && detected.length !== 1)
			throw new Error(
				`Engine detection in ${directory} found ${detected.length ? "ambiguous suites" : "no suite"}. Expected goss.yaml or *.test.js; select engine explicitly for mixed suites.`,
			);
		const engine = requested === "auto" ? detected[0] : requested;
		if (
			!matches[engine].length ||
			matches[engine].some(
				(file) => !readFileSync(path.join(directory, file), "utf8").trim(),
			)
		)
			throw new Error(`Missing or empty ${engine} suite in ${directory}`);
		return { engine, tests: matches[engine].sort() };
	}

	static platform(os, architecture, variant = "") {
		const normalized =
			{ x86_64: "amd64", aarch64: "arm64" }[architecture] || architecture;
		if (os !== "linux" || !["amd64", "arm64"].includes(normalized))
			throw new Error(
				"Container tests currently support Linux amd64 and arm64.",
			);
		return [os, normalized, variant].filter(Boolean).join("/");
	}

	static dockerArgs(directory) {
		const file = path.join(directory, "docker-args");
		if (!existsSync(file)) return [];
		const args = readFileSync(file, "utf8")
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#"));
		for (const arg of args) {
			if (
				arg === "--read-only" ||
				/^--cap-drop=[A-Z_]+$/.test(arg) ||
				/^--security-opt=no-new-privileges(?:=true)?$/.test(arg)
			)
				continue;
			const tmpfs = /^--tmpfs=(\/[a-zA-Z0-9_./-]+):([a-zA-Z0-9_,=.-]+)$/.exec(
				arg,
			);
			if (tmpfs) {
				const target = tmpfs[1];
				if (
					target === path.posix.normalize(target) &&
					target !== "/" &&
					target !== "/goss-bin" &&
					!target.startsWith("/goss-bin/") &&
					target !== "/goss" &&
					!target.startsWith("/goss/")
				)
					continue;
			}
			throw new Error(
				`Unsupported docker-args entry: ${arg}. Use --read-only, --cap-drop=..., --security-opt=no-new-privileges or --tmpfs=/path:options; /goss and /goss-bin are reserved.`,
			);
		}
		return args;
	}

	async prepare() {
		const { inputs, environment } = this;
		const workingDirectory = realpathSync(inputs.workingDirectory || ".");
		if (
			!statSync(workingDirectory).isDirectory() ||
			/[:\n]/.test(workingDirectory)
		)
			throw new Error(
				"working-directory must be a directory usable as a Docker bind mount (no colons or newlines).",
			);
		const identityKind = Configuration.identity(inputs.image);
		const selection = Configuration.engine(
			workingDirectory,
			inputs.engine || "auto",
		);
		const gossMode = inputs.gossMode || "image";
		if (!["image", "service"].includes(gossMode))
			throw new Error("goss-mode must be image or service.");
		const dockerArgs = Configuration.dockerArgs(workingDirectory);
		if (
			selection.engine !== "goss" &&
			(gossMode !== "image" ||
				existsSync(path.join(workingDirectory, "docker-args")))
		)
			throw new Error(
				"goss-mode and docker-args apply only to Goss suites; configure Testcontainers in the native suite.",
			);
		if (
			selection.engine === "goss" &&
			gossMode === "image" &&
			existsSync(path.join(workingDirectory, "goss_wait.yaml"))
		)
			throw new Error(
				"goss_wait.yaml requires goss-mode: service. Image mode runs Goss without starting the application.",
			);
		const timeout = String(inputs.timeout || "300");
		if (!/^[1-9][0-9]*$/.test(timeout) || Number(timeout) > 3600)
			throw new Error("timeout must be an integer from 1 to 3600 seconds.");
		if (
			inputs.platform &&
			!/^linux\/(amd64|arm64)(\/v[0-9]+)?$/.test(inputs.platform)
		)
			throw new Error(
				"platform must be linux/amd64 or linux/arm64, optionally with a variant.",
			);
		const group = inputs.reportGroup || environment.GITHUB_JOB || "local";
		if (!/^[\w-]+$/.test(group))
			throw new Error(
				"report-group must be a job ID containing letters, numbers, underscores or hyphens.",
			);
		const baseline = {};
		if (inputs.reportFile)
			for (const file of await Reports.select(
				workingDirectory,
				inputs.reportFile,
				{ required: false },
			))
				baseline[file] = Reports.fingerprint(file);
		const temporary = environment.RUNNER_TEMP || tmpdir();
		mkdirSync(temporary, { recursive: true });
		const directory = mkdtempSync(path.join(temporary, "ci-container-test-"));
		const id = randomUUID();
		for (const child of ["reports", "diagnostics", "tools"])
			mkdirSync(path.join(directory, child));
		return {
			...selection,
			gossMode,
			dockerArgs,
			image: inputs.image,
			identityKind,
			workingDirectory,
			directory,
			id,
			timeout: Number(timeout),
			requestedPlatform: inputs.platform || "",
			group,
			attempt: environment.GITHUB_RUN_ATTEMPT || "1",
			run: environment.GITHUB_RUN_ID || "local",
			reportFile: inputs.reportFile || "",
			baseline,
			runnerName: `ci-image-test-${id}`,
			junit: path.join(directory, "reports", "junit.xml"),
			log: path.join(directory, "diagnostics", "engine.log"),
		};
	}
}
