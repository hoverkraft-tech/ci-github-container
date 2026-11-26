import { createHash } from "node:crypto";
import { chmodSync, writeFileSync } from "node:fs";
import path from "node:path";

export class Tooling {
	constructor(manifest) {
		this.manifest = manifest;
	}

	static async download(url) {
		const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
		if (!response.ok)
			throw new Error(`Tool download failed (${response.status}): ${url}`);
		const bytes = Buffer.from(await response.arrayBuffer());
		if (bytes.length > 40_000_000)
			throw new Error("Unexpectedly large tool download.");
		return bytes;
	}

	static verify(bytes, checksums, filename) {
		const line = checksums
			.trim()
			.split("\n")
			.find((entry) => entry.trim().endsWith(filename));
		const expected = line?.trim().split(/\s+/)[0];
		if (
			!/^[a-f0-9]{64}$/.test(expected || "") ||
			createHash("sha256").update(bytes).digest("hex") !== expected
		)
			throw new Error(`SHA-256 verification failed for ${filename}`);
	}

	async goss(state, command) {
		const version = this.manifest.gossVersion;
		if (!/^v\d+\.\d+\.\d+$/.test(version))
			throw new Error("Invalid pinned Goss version.");
		const architecture =
			state.platform.split("/")[1] === "amd64" ? "x86_64" : "arm64";
		const archive = `goss_${version.slice(1)}_linux_${architecture}.tar.gz`;
		const base = `https://github.com/goss-org/goss/releases/download/${version}`;
		const [binary, sums, script, scriptSum] = await Promise.all([
			Tooling.download(`${base}/${archive}`),
			Tooling.download(`${base}/goss_${version.slice(1)}_SHA256SUMS`),
			Tooling.download(`${base}/dgoss`),
			Tooling.download(`${base}/dgoss.sha256`),
		]);
		Tooling.verify(binary, sums.toString(), archive);
		Tooling.verify(script, scriptSum.toString(), "dgoss");
		const directory = path.join(state.directory, "tools");
		const tarball = path.join(directory, archive);
		writeFileSync(tarball, binary, { mode: 0o600 });
		writeFileSync(path.join(directory, "dgoss"), script, { mode: 0o700 });
		await command.run("tar", [
			"--extract",
			"--gzip",
			"--file",
			tarball,
			"--directory",
			directory,
			"--no-same-owner",
			"--no-same-permissions",
			"goss",
		]);
		chmodSync(path.join(directory, "goss"), 0o700);
		return directory;
	}
}
