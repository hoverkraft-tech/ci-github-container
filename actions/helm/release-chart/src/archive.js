import fs from "node:fs";
import path from "node:path";

export function prepareArchiveInput({
	archive = "",
	artifactId = "",
	archiveName = "",
	expectedChecksum,
	runnerTemp,
}) {
	if (!/^[a-f0-9]{64}$/.test(expectedChecksum ?? "")) {
		throw new Error("A lowercase hexadecimal SHA-256 checksum is required.");
	}
	if (archive) {
		if (artifactId || archiveName) {
			throw new Error(
				"Supply either archive or artifact-id with archive-name, not both.",
			);
		}
		return { archive, directory: "" };
	}
	if (
		!/^[1-9][0-9]*$/.test(artifactId) ||
		!Number.isSafeInteger(Number(artifactId))
	) {
		throw new Error(
			"Supply a local archive or one positive integer artifact-id.",
		);
	}
	if (
		!archiveName.endsWith(".tgz") ||
		path.posix.basename(archiveName) !== archiveName ||
		[...archiveName].some((character) => character.charCodeAt(0) < 32) ||
		path.win32.basename(archiveName) !== archiveName
	) {
		throw new Error("Artifact input requires a .tgz archive-name basename.");
	}
	const directory = fs.mkdtempSync(path.join(runnerTemp, "helm-artifact-"));
	return { archive: path.join(directory, archiveName), directory };
}

export function cleanupArchiveInput(directory) {
	if (directory) fs.rmSync(directory, { recursive: true, force: true });
}
