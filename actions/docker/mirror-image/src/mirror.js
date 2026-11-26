import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

class ImageMirror {
	constructor(source, destination) {
		const pattern =
			/^(?<registry>[a-z0-9]+(?:[.-][a-z0-9]+)*(?::[0-9]+)?)(?<repository>(?:\/[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*)+)(?::(?<tag>[\w][\w.-]{0,127}))?(?:@(?<digest>sha256:[a-f0-9]{64}))?$/;
		const parse = (value) => {
			assert.equal(typeof value, "string", "Image references must be strings");
			assert.equal(
				value,
				value.trim(),
				"Image references must not contain surrounding whitespace",
			);
			const match = value.match(pattern);
			assert(match, "Expected an explicit OCI image reference");
			const { registry } = match.groups;
			assert(
				registry.includes(".") ||
					registry.includes(":") ||
					registry === "localhost",
				"Image references require an explicit registry",
			);
			return match.groups;
		};
		const from = parse(source);
		const to = parse(destination);
		assert(from.digest, "The source image must be pinned by digest");
		assert(
			to.tag && !to.digest,
			"The destination image must have an explicit tag and no digest",
		);
		this.source = `${from.registry}${from.repository}@${from.digest}`;
		this.destination = destination;
		this.sourceRegistry = from.registry;
		this.destinationRegistry = to.registry;
		this.digest = from.digest;
	}

	async copy(exec, temporaryRoot) {
		const directory = await fs.mkdtemp(
			path.join(temporaryRoot, "mirror-image-"),
		);
		const metadata = path.join(directory, "result.json");
		try {
			await exec.exec("docker", [
				"buildx",
				"imagetools",
				"create",
				"--prefer-index=false",
				"--metadata-file",
				metadata,
				"--tag",
				this.destination,
				this.source,
			]);
			const result = JSON.parse(await fs.readFile(metadata, "utf8"));
			assert.equal(
				result["containerimage.descriptor"]?.digest,
				this.digest,
				"Mirrored digest differs from the source digest",
			);
			return `${this.destination}@${this.digest}`;
		} finally {
			await fs.rm(directory, { recursive: true, force: true });
		}
	}
}

export { ImageMirror };
