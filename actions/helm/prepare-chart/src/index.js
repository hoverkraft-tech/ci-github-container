import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";

function readYaml(file) {
	return yaml.parse(fs.readFileSync(file, "utf8"));
}

function sortMaps(value) {
	if (Array.isArray(value)) return value.map(sortMaps);
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((key) => [key, sortMaps(value[key])]),
		);
	}
	return value;
}

// Helm hashes dependencies in Go struct field order, not YAML property order.
function dependencyDigest(requirements, locked) {
	const fields = [
		"name",
		"version",
		"repository",
		"condition",
		"tags",
		"enabled",
		"import-values",
		"alias",
	];
	const ordered = (dependencies) =>
		dependencies.map((dependency) =>
			Object.fromEntries(
				fields
					.filter((field) => {
						if (field === "name" || field === "repository") return true;
						const value = dependency[field];
						return (
							value != null &&
							value !== "" &&
							value !== false &&
							(!Array.isArray(value) || value.length > 0)
						);
					})
					.map((field) => [field, sortMaps(dependency[field] ?? "")]),
			),
		);
	// encoding/json escapes these characters even inside JSON strings.
	const resolved = requirements.map((dependency, index) =>
		/^(?:@|alias:)/.test(dependency.repository ?? "")
			? { ...dependency, repository: locked[index]?.repository }
			: dependency,
	);
	const data = JSON.stringify([ordered(resolved), ordered(locked)]).replace(
		/[<>&\u2028\u2029]/g,
		(character) =>
			`\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
	);
	return `sha256:${crypto.createHash("sha256").update(data).digest("hex")}`;
}

function localPath(chartPath, dependency) {
	if (dependency.repository?.startsWith("file://")) {
		return path.resolve(chartPath, dependency.repository.slice(7));
	}
	if (!dependency.repository)
		return path.join(chartPath, "charts", dependency.name);
	return null;
}

function collectCharts(chartPath, charts = [], visiting = new Set()) {
	const directory = fs.realpathSync(chartPath);
	if (visiting.has(directory))
		throw new Error(`Local chart dependency cycle: ${directory}`);
	if (charts.some((chart) => chart.directory === directory)) return charts;
	visiting.add(directory);
	const chart = readYaml(path.join(directory, "Chart.yaml"));
	const dependencies = chart.dependencies ?? [];
	let lock = null;
	if (dependencies.length) {
		const lockPath = path.join(directory, "Chart.lock");
		if (!fs.existsSync(lockPath))
			throw new Error(`Chart.lock file not found: ${lockPath}`);
		lock = readYaml(lockPath);
		if (
			!Array.isArray(lock.dependencies) ||
			lock.digest !== dependencyDigest(dependencies, lock.dependencies)
		) {
			throw new Error(`Chart.lock is out of sync: ${lockPath}`);
		}
	}
	for (const dependency of dependencies) {
		const child = localPath(directory, dependency);
		if (child) collectCharts(child, charts, visiting);
	}
	visiting.delete(directory);
	charts.push({ directory, dependencies, lock });
	return charts;
}

function planPreparation({
	chartPath,
	name = "",
	tag = "",
	updateTagPaths = ".version,.appVersion",
	values = "",
}) {
	if (!chartPath) throw new Error('"path" input is missing');
	const charts = collectCharts(chartPath);
	const root = fs.realpathSync(chartPath);
	const updates = values ? JSON.parse(values) : [];
	if (!Array.isArray(updates))
		throw new Error('"values" input is not an array');
	const tagPaths = updateTagPaths
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	const generated = [];
	for (const chart of charts) {
		const file = path.relative(root, path.join(chart.directory, "Chart.yaml"));
		if (chart.directory === root && name)
			generated.push({ file, path: ".name", value: name });
		if (!tag) continue;
		for (const field of tagPaths)
			generated.push({ file, path: field, value: tag });
		if (tagPaths.includes(".version")) {
			chart.dependencies.forEach((dependency, index) => {
				if (localPath(chart.directory, dependency)) {
					generated.push({
						file,
						path: `.dependencies[${index}].version`,
						value: tag,
					});
				}
			});
		}
	}
	return { charts, values: [...generated, ...updates] };
}

function updateLock({ directory, dependencies, lock }) {
	const current =
		readYaml(path.join(directory, "Chart.yaml")).dependencies ?? [];
	const expected = dependencies.map((dependency, index) => {
		const child = localPath(directory, dependency);
		if (!child) return dependency;
		// Preserve a local version range when preparation did not change it.
		if (current[index]?.version === dependency.version) return dependency;
		return {
			...dependency,
			version: readYaml(path.join(child, "Chart.yaml")).version,
		};
	});
	if (JSON.stringify(current) !== JSON.stringify(expected)) {
		throw new Error(
			`Preparation may only change local dependency versions: ${directory}`,
		);
	}
	if (!lock || JSON.stringify(current) === JSON.stringify(dependencies)) return;
	const updated = structuredClone(lock);
	updated.dependencies.forEach((dependency) => {
		if (!localPath(directory, dependency)) return;
		const requirement = current.find(
			(item) =>
				item.name === dependency.name &&
				item.repository === dependency.repository,
		);
		dependency.version = requirement.version;
	});
	updated.digest = dependencyDigest(current, updated.dependencies);
	updated.generated = new Date().toISOString();
	fs.writeFileSync(path.join(directory, "Chart.lock"), yaml.stringify(updated));
}

async function addRepositories(exec, repositories = "") {
	for (const repository of repositories
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)) {
		await exec.exec("helm", ["repo", "add", ...repository.split(/\s+/)]);
	}
}

async function buildDependencies({ exec, charts, repositories = "" }) {
	// Reject changed requirements before downloading or packaging anything.
	for (const chart of charts) updateLock(chart);
	await addRepositories(exec, repositories);
	for (const { directory, dependencies } of charts) {
		if (dependencies.length)
			await exec.exec("helm", ["dependency", "build", directory]);
	}
}

async function packageChart({
	exec,
	charts,
	chartPath,
	runnerTemp,
	version = "",
	repositories = "",
}) {
	await buildDependencies({ exec, charts, repositories });
	const destination = fs.mkdtempSync(path.join(runnerTemp, "helm-prepare-"));
	try {
		await exec.exec("helm", [
			"package",
			path.resolve(chartPath),
			...(version ? ["--version", version] : []),
			"--destination",
			destination,
		]);
		const archives = fs
			.readdirSync(destination)
			.filter((file) => file.endsWith(".tgz"));
		if (archives.length !== 1)
			throw new Error("Expected exactly one packaged chart.");
		const archive = path.join(destination, archives[0]);
		const checksum = crypto
			.createHash("sha256")
			.update(fs.readFileSync(archive))
			.digest("hex");
		return { archive, checksum };
	} catch (error) {
		fs.rmSync(destination, { recursive: true, force: true });
		throw error;
	}
}

export { buildDependencies, packageChart, planPreparation };
