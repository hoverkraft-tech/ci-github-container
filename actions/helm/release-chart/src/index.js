import crypto from "node:crypto";
import fs from "node:fs";
import yaml from "yaml";

function run({ core, chartPath, tag }) {
	const rootChartFile = `${chartPath}/Chart.yaml`;
	const rootChartFileContent = yaml.parse(
		fs.readFileSync(rootChartFile, "utf8"),
	);

	if (
		!rootChartFileContent.dependencies ||
		rootChartFileContent.dependencies.length === 0
	) {
		core.debug(`No dependencies found in Chart.yaml file: ${rootChartFile}`);
		return;
	}

	const chartLockFile = `${chartPath}/Chart.lock`;
	if (!fs.existsSync(chartLockFile)) {
		core.debug(`Chart.lock file not found: ${chartLockFile}`);
		return core.setFailed(`Chart.lock file not found: ${chartLockFile}`);
	}

	const chartLockFileContent = yaml.parse(
		fs.readFileSync(chartLockFile, "utf8"),
	);

	let hasLocalDependencies = false;
	const dependencies = chartLockFileContent.dependencies;

	for (const dependency of dependencies) {
		const isLocalDependency =
			dependency.repository.startsWith("file://") &&
			dependency.version === "0.0.0";
		core.debug(`Dependency ${dependency.name} is local: ${isLocalDependency}`);

		if (isLocalDependency) {
			dependency.version = tag;
			hasLocalDependencies = true;
		}
	}

	if (!hasLocalDependencies) {
		core.debug(
			`No local dependencies found in Chart.lock file: ${chartLockFile}`,
		);
		return;
	}

	chartLockFileContent.generated = new Date().toISOString();

	function hashReq(req, lock) {
		req = req.map(sortDependencyFields);
		lock = lock.map(sortDependencyFields);

		const data = JSON.stringify([req, lock]);
		const hash = digest(data);
		return `sha256:${hash}`;
	}

	function digest(input) {
		const hash = crypto.createHash("sha256");
		hash.update(input);
		return hash.digest("hex");
	}

	function sortDependencyFields(dependency) {
		const fieldOrder = [
			"name",
			"version",
			"repository",
			"condition",
			"tags",
			"enabled",
			"import-values",
			"alias",
		];
		const sortedDependency = {};
		for (const field of fieldOrder) {
			if (Object.hasOwn(dependency, field)) {
				sortedDependency[field] = dependency[field];
			}
		}

		return sortedDependency;
	}

	const req = rootChartFileContent.dependencies;
	const lock = dependencies;

	chartLockFileContent.digest = hashReq(req, lock);

	const updatedChartLockFileContent = yaml.stringify(chartLockFileContent);
	core.debug(
		`Updated Chart.lock file content:\n${updatedChartLockFileContent}`,
	);

	fs.writeFileSync(chartLockFile, updatedChartLockFileContent, "utf8");
}

export { run };
