import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

async function pushChart({
	core,
	exec,
	archive,
	expectedChecksum,
	registry,
	username,
	password,
	repository,
	runnerTemp,
	sleep = (milliseconds) =>
		new Promise((resolve) => setTimeout(resolve, milliseconds)),
}) {
	const checksum = createHash("sha256")
		.update(fs.readFileSync(archive))
		.digest("hex");
	if (checksum !== expectedChecksum)
		throw new Error("Prepared chart checksum mismatch.");
	const destination = fs.mkdtempSync(path.join(runnerTemp, "helm-release-"));
	const registryConfig = path.join(destination, "registry.json");
	let loggedIn = false;
	try {
		await exec.exec(
			"helm",
			[
				"registry",
				"login",
				registry,
				"--username",
				username,
				"--password-stdin",
				"--registry-config",
				registryConfig,
			],
			{ input: Buffer.from(password) },
		);
		loggedIn = true;
		const pushArgs = [
			"push",
			archive,
			`oci://${registry}/${repository}`,
			"--registry-config",
			registryConfig,
		];
		const maxAttempts = 6;
		let delayMs = 5000;
		let result;
		for (let attempt = 1; attempt <= maxAttempts; attempt++) {
			result = await exec.getExecOutput("helm", pushArgs, {
				ignoreReturnCode: true,
			});
			if (result.exitCode === 0) {
				break;
			}

			const pushError = `${result.stderr}\n${result.stdout}`.trim();
			// Helm may upload a manifest before the registry can resolve it for tagging.
			const tagNotFound =
				/failed to perform "Tag" on destination: sha256:[a-f0-9]{64}: not found/i.test(
					pushError,
				);
			if (!tagNotFound || attempt === maxAttempts) {
				throw new Error(
					`Helm push failed (attempt ${attempt}/${maxAttempts}, exit code: ${result.exitCode}).\n${pushError}`,
				);
			}

			core.warning(
				`Chart manifest is not yet available for tagging (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`,
			);
			// Reuse the archive and its timestamp so retries publish the same manifest.
			await sleep(delayMs);
			delayMs *= 2;
		}
		// Helm reports the pushed reference and manifest digest on stderr.
		// Capture the push result so a concurrent tag update cannot change what we sign.
		const output = `${result.stdout}\n${result.stderr}`;
		const images = [...output.matchAll(/^Pushed:[ \t]+(\S+)[ \t]*\r?$/gm)];
		const digests = [
			...output.matchAll(/^Digest:[ \t]+(sha256:[a-f0-9]{64})[ \t]*\r?$/gm),
		];
		if (images.length !== 1 || digests.length !== 1) {
			throw new Error(
				"Helm push did not return a chart reference and SHA-256 manifest digest.",
			);
		}
		const image = images[0][1];
		const digest = digests[0][1];
		core.setOutput("image", image);
		core.setOutput("digest", digest);
		core.setOutput(
			"image-digest",
			`${image.slice(0, image.lastIndexOf(":"))}@${digest}`,
		);
	} finally {
		try {
			if (loggedIn) {
				await exec.exec("helm", [
					"registry",
					"logout",
					registry,
					"--registry-config",
					registryConfig,
				]);
			}
		} catch (error) {
			core.warning(`Helm registry logout failed: ${error.message}`);
		} finally {
			fs.rmSync(destination, { recursive: true, force: true });
		}
	}
}

export { pushChart };
