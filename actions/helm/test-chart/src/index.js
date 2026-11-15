import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { extract } from "tar";
import yaml from "yaml";

const digest = (file) =>
	createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const lines = (value) =>
	value
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

function fingerprint(directory) {
	return JSON.stringify(
		fs
			.readdirSync(directory, { recursive: true })
			.sort()
			.map((name) => {
				const file = path.join(directory, name);
				const stat = fs.lstatSync(file);
				if (stat.isDirectory()) return [name, "directory"];
				if (stat.isFile()) return [name, digest(file)];
				throw new Error(
					"Test inputs must contain only regular files and directories.",
				);
			}),
	);
}

function unpack(archive, destination) {
	const entries = new Set();
	const roots = new Set();
	extract({
		file: archive,
		cwd: destination,
		sync: true,
		strict: true,
		filter(name, entry) {
			const normalized = name.replace(/\/$/, "");
			const components = normalized.split("/");
			if (
				!components.every((part) => part && part !== "." && part !== "..") ||
				/[\\:]/.test(normalized) ||
				entries.has(normalized) ||
				!["File", "Directory"].includes(entry.type)
			) {
				throw new Error(
					"Prepared chart contains an unsafe or duplicate archive entry.",
				);
			}
			entries.add(normalized);
			roots.add(components[0]);
			return true;
		},
	});
	const [root] = roots;
	if (
		roots.size !== 1 ||
		!entries.has(`${root}/Chart.yaml`) ||
		!fs.statSync(path.join(destination, root, "Chart.yaml")).isFile()
	) {
		throw new Error("Expected one root chart containing Chart.yaml.");
	}
	if (root.includes(","))
		throw new Error("Chart root must not contain chart-selection delimiters.");
	return path.join(destination, root);
}

function stageChart({
	archive,
	expectedChecksum,
	workingDirectory,
	config = "",
	valuesFiles = "",
	namespace = "",
}) {
	if (!archive || !/^[a-f0-9]{64}$/.test(expectedChecksum ?? "")) {
		throw new Error(
			"A prepared archive and lowercase hexadecimal SHA-256 checksum are required.",
		);
	}
	const cwd = path.resolve(workingDirectory);
	const archivePath = path.resolve(cwd, archive);
	const bytes = fs.readFileSync(archivePath);
	if (createHash("sha256").update(bytes).digest("hex") !== expectedChecksum) {
		throw new Error("Prepared chart checksum mismatch.");
	}
	const clusterName = `chart-test-${randomUUID()}`;
	const testNamespace = namespace.trim() || clusterName;
	if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(testNamespace)) {
		throw new Error(
			"Test namespace must be a Kubernetes DNS label of at most 63 characters.",
		);
	}
	const configPath = path.resolve(cwd, config || "ct.yaml");
	const settings =
		config || fs.existsSync(configPath)
			? (yaml.parse(fs.readFileSync(configPath, "utf8")) ?? {})
			: {};
	if (typeof settings !== "object" || Array.isArray(settings)) {
		throw new Error("Chart-testing configuration must be a mapping.");
	}
	const directory = fs.mkdtempSync(path.join(cwd, ".helm-test-"));
	try {
		const snapshot = path.join(directory, "archive.tgz");
		fs.writeFileSync(snapshot, bytes);
		const inputs = path.join(directory, "inputs");
		fs.mkdirSync(inputs);
		const chart = unpack(snapshot, inputs);
		const overlays = lines(valuesFiles).map((file, index) => {
			const target = path.join(inputs, `overlay-${index}.yaml`);
			fs.copyFileSync(path.resolve(cwd, file), target);
			return path.relative(cwd, target);
		});
		// Only installation receives values files; ct also passes helm-extra-args
		// to helm test and uninstall, which do not accept --values.
		const extraSetArgs = [
			process.env.CT_HELM_EXTRA_SET_ARGS ??
				settings["helm-extra-set-args"] ??
				"",
		];
		for (const overlay of overlays) extraSetArgs.push("--values", overlay);
		const stagedConfig = path.join(directory, "ct.json");
		fs.writeFileSync(
			stagedConfig,
			JSON.stringify({
				...settings,
				"skip-helm-dependencies": true,
				"helm-extra-set-args": extraSetArgs.join(" ").trim(),
			}),
		);
		const state = {
			cwd,
			archive: archivePath,
			expectedChecksum,
			inputs,
			chart,
			stagedConfig,
			fingerprint: fingerprint(inputs),
			namespace: testNamespace,
			clusterName,
			kubeconfig: path.join(directory, "kubeconfig"),
			extraSetArgs: extraSetArgs.join(" ").trim(),
			extraArgs:
				process.env.CT_HELM_EXTRA_ARGS ?? settings["helm-extra-args"] ?? "",
		};
		fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify(state));
		return {
			directory,
			namespace: testNamespace,
			clusterName,
			kubeconfig: state.kubeconfig,
		};
	} catch (error) {
		fs.rmSync(directory, { recursive: true, force: true });
		throw error;
	}
}

function verifyInputs(state) {
	if (
		digest(state.archive) !== state.expectedChecksum ||
		fingerprint(state.inputs) !== state.fingerprint
	) {
		throw new Error(
			"Test must not modify the prepared chart or validation inputs.",
		);
	}
}

async function installChart({
	exec,
	directory,
	helmSet = "",
	registry = "",
	username = "",
	password = "",
}) {
	try {
		const state = JSON.parse(
			fs.readFileSync(path.join(directory, "state.json"), "utf8"),
		);
		verifyInputs(state);
		const options = {
			cwd: state.cwd,
			// ct install reads this setting but exposes the CLI flag only for lint.
			env: {
				...process.env,
				KUBECONFIG: state.kubeconfig,
				CT_SKIP_HELM_DEPENDENCIES: "true",
			},
		};
		const exists = await exec.exec(
			"kubectl",
			["get", "namespace", state.namespace],
			{
				...options,
				silent: true,
				ignoreReturnCode: true,
			},
		);
		if (exists !== 0)
			await exec.exec(
				"kubectl",
				["create", "namespace", state.namespace],
				options,
			);
		const overrides = lines(helmSet).map((line) => line.replaceAll(",", "\\,"));
		if (registry && username && password) {
			await exec.exec(
				"kubectl",
				[
					"create",
					"secret",
					"docker-registry",
					"regcred",
					`--namespace=${state.namespace}`,
					`--docker-server=${registry}`,
					`--docker-username=${username}`,
					`--docker-password=${password}`,
				],
				{ ...options, silent: true },
			);
			overrides.push("imagePullSecrets[0].name=regcred");
		}
		const extraSetArgs = [state.extraSetArgs];
		if (overrides.length) extraSetArgs.push(`--set=${overrides.join(",")}`);
		await exec.exec(
			"ct",
			[
				"install",
				"--config",
				state.stagedConfig,
				"--charts",
				path.relative(state.cwd, state.chart),
				"--all=false",
				"--exclude-deprecated=false",
				"--chart-repos=",
				"--upgrade=false",
				"--skip-clean-up=false",
				"--print-config=false",
				"--debug=false",
				"--namespace",
				state.namespace,
				"--helm-extra-args",
				`${state.extraArgs} --debug=false`.trim(),
				"--helm-extra-set-args",
				extraSetArgs.join(" ").trim(),
			],
			options,
		);
		verifyInputs(state);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

export { installChart, stageChart };
