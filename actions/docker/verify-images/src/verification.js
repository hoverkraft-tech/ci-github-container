import assert from "node:assert/strict";

class ImageVerification {
	constructor({ images, identity = "", identityRegexp = "", issuer }) {
		assert.equal(typeof images, "string", '"images" must be a string');
		const input = images.trim();
		const references = input.startsWith("[")
			? JSON.parse(input)
			: input.split(/[\s,]+/).filter(Boolean);
		assert(
			Array.isArray(references) && references.length > 0,
			'"images" must contain at least one image',
		);
		// Require an explicit registry and immutable digest; a tag never selects content.
		const pattern =
			/^(?<registry>[a-z0-9]+(?:[.-][a-z0-9]+)*(?::[0-9]+)?)(?<path>(?:\/[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*)+)(?::[\w][\w.-]{0,127})?@(?<digest>sha256:[a-f0-9]{64})$/;
		this.images = [
			...new Set(
				references.map((reference) => {
					assert.equal(
						typeof reference,
						"string",
						"Image references must be strings",
					);
					const match = reference.match(pattern);
					assert(
						match,
						`Expected a digest-qualified OCI reference: ${reference}`,
					);
					const { registry, path, digest } = match.groups;
					assert(
						registry.includes(".") ||
							registry.includes(":") ||
							registry === "localhost",
						"Image references must include an explicit registry",
					);
					return `${registry}${path}@${digest}`;
				}),
			),
		];
		assert.equal(
			typeof identity,
			"string",
			'"certificate-identity" must be a string',
		);
		assert.equal(
			typeof identityRegexp,
			"string",
			'"certificate-identity-regexp" must be a string',
		);
		const exact = identity.trim();
		const regexp = identityRegexp.trim();
		assert(
			Boolean(exact) !== Boolean(regexp),
			"Specify exactly one certificate identity or identity regexp",
		);
		assert(
			typeof issuer === "string" && issuer.trim(),
			'"certificate-oidc-issuer" must not be empty',
		);
		this.policy = [
			"--certificate-oidc-issuer",
			issuer.trim(),
			exact ? "--certificate-identity" : "--certificate-identity-regexp",
			exact || regexp,
		];
	}

	async verify(exec) {
		for (const image of this.images) {
			const code = await exec.exec("cosign", ["verify", ...this.policy, image]);
			assert.equal(code, 0, `Signature verification failed for ${image}`);
		}
		return this.images;
	}
}

export { ImageVerification };
