import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { extract, list } from "tar";
import yaml from "yaml";

const checksum = (bytes) => createHash("sha256").update(bytes).digest("hex");

function extractChart(archive, destination) {
	const roots = new Set();
	const files = new Set();
	list({
		file: archive,
		sync: true,
		strict: true,
		onReadEntry(entry) {
			const name = entry.path.replace(/\/$/, "");
			const parts = name.split("/");
			if (
				!["File", "Directory"].includes(entry.type) ||
				parts.some((part) => !part || part === "." || part === "..") ||
				/[\\:]/.test(name) ||
				files.has(name)
			) {
				throw new Error(
					"Prepared chart contains an unsafe or duplicate archive entry.",
				);
			}
			roots.add(parts[0]);
			files.add(name);
		},
	});
	if (roots.size !== 1 || !files.has(`${[...roots][0]}/Chart.yaml`)) {
		throw new Error("Expected one root chart containing Chart.yaml.");
	}
	fs.mkdirSync(destination);
	extract({
		file: archive,
		cwd: destination,
		strip: 1,
		sync: true,
		strict: true,
	});
}

function fingerprint(directory) {
	const hash = createHash("sha256");
	function visit(relative) {
		for (const entry of fs
			.readdirSync(path.join(directory, relative), { withFileTypes: true })
			.sort((a, b) => a.name.localeCompare(b.name))) {
			const name = path.join(relative, entry.name);
			if (entry.isDirectory()) {
				hash.update(JSON.stringify([name, "directory"]));
				visit(name);
			} else if (entry.isFile()) {
				const bytes = fs.readFileSync(path.join(directory, name));
				hash.update(JSON.stringify([name, "file", bytes.length]));
				hash.update(bytes);
			} else
				throw new Error(
					"Validation inputs must contain only regular files and directories.",
				);
		}
	}
	visit("");
	return hash.digest("hex");
}

async function lintChart({
	exec,
	archive,
	expectedChecksum,
	workingDirectory,
	config = "",
	valuesFiles = "",
}) {
	if (!/^[a-f0-9]{64}$/.test(expectedChecksum ?? "")) {
		throw new Error("Expected a lowercase hexadecimal SHA-256 checksum.");
	}
	const cwd = path.resolve(workingDirectory);
	const archivePath = path.resolve(cwd, archive);
	const bytes = fs.readFileSync(archivePath);
	if (checksum(bytes) !== expectedChecksum)
		throw new Error("Prepared chart checksum mismatch.");
	const configPath = path.resolve(cwd, config || "ct.yaml");
	const settings =
		config || fs.existsSync(configPath)
			? (yaml.parse(fs.readFileSync(configPath, "utf8")) ?? {})
			: {};
	if (typeof settings !== "object" || Array.isArray(settings))
		throw new Error("Chart-testing configuration must be a mapping.");
	// ct splits extra Helm arguments on whitespace. Relative staging paths keep
	// caller paths with spaces usable without altering the original chart or values.
	const directory = fs.mkdtempSync(path.join(cwd, ".helm-lint-"));
	try {
		const snapshot = path.join(directory, "archive.tgz");
		fs.writeFileSync(snapshot, bytes);
		const inputs = path.join(directory, "inputs");
		fs.mkdirSync(inputs);
		const chart = path.join(inputs, "chart");
		extractChart(snapshot, chart);
		const values = path.join(inputs, "values");
		fs.mkdirSync(values);
		const overlays = valuesFiles
			.split(/\r?\n/)
			.map((file) => file.trim())
			.filter(Boolean);
		const extraArgs = [
			process.env.CT_HELM_LINT_EXTRA_ARGS ??
				settings["helm-lint-extra-args"] ??
				"",
		];
		for (const [index, file] of overlays.entries()) {
			const target = path.join(values, `${index}.yaml`);
			fs.copyFileSync(path.resolve(cwd, file), target);
			extraArgs.push("--values", path.relative(cwd, target));
		}
		const stagedConfig = path.join(directory, "ct.json");
		fs.writeFileSync(
			stagedConfig,
			JSON.stringify({ ...settings, upgrade: false }),
		);
		const before = fingerprint(inputs);
		const verifyUnchanged = () => {
			if (
				fingerprint(inputs) !== before ||
				checksum(fs.readFileSync(archivePath)) !== expectedChecksum
			) {
				throw new Error(
					"Lint must not modify the prepared chart or validation inputs.",
				);
			}
		};
		await exec.exec(
			"ct",
			[
				"lint",
				"--config",
				stagedConfig,
				"--charts",
				path.relative(cwd, chart),
				"--all=false",
				"--exclude-deprecated=false",
				"--skip-helm-dependencies",
				"--chart-repos=",
				"--print-config=false",
				"--debug=false",
				"--helm-lint-extra-args",
				extraArgs.join(" ").trim(),
			],
			{ cwd, env: { ...process.env, CT_UPGRADE: "false" } },
		);
		verifyUnchanged();
		const ci = path.join(chart, "ci");
		const scenarios = fs.existsSync(ci)
			? fs
					.readdirSync(ci)
					.filter((file) => file.endsWith("-values.yaml"))
					.sort()
					.map((file) => path.join(ci, file))
			: [];
		if (!scenarios.length) scenarios.push("");
		// Match ct's argument splitting and values precedence. Only these three
		// flags belong exclusively to lint; its other Helm options also apply here.
		const renderArgs = extraArgs
			.join(" ")
			.trim()
			.split(/\s+/)
			.filter(
				(arg) => arg && !/^--(strict|quiet|with-subcharts)(=.*)?$/.test(arg),
			);
		for (const valuesFile of scenarios) {
			const result = await exec.getExecOutput(
				"helm",
				[
					"template",
					process.env.CT_RELEASE_NAME ||
						settings["release-name"] ||
						"chart-lint",
					chart,
					"--namespace",
					process.env.CT_NAMESPACE || settings.namespace || "default",
					...(valuesFile ? ["--values", valuesFile] : []),
					...renderArgs,
					"--debug=false",
				],
				{ cwd, silent: true, ignoreReturnCode: true },
			);
			if (result.exitCode !== 0) {
				throw new Error(`Prepared chart rendering failed.\n${result.stderr}`);
			}
		}
		verifyUnchanged();
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

export { lintChart };
