const assert = require("node:assert/strict");

const object = (value, name) => {
	assert(
		value && typeof value === "object" && !Array.isArray(value),
		`${name} must be an object`,
	);
	return value;
};
const parse = (value, name) => object(JSON.parse(value), name);
const pathPattern =
	/^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*$/;

const promotionContract = {
	collect(rawResults) {
		const results = parse(rawResults, "job-results");
		assert(Object.keys(results).length, "job-results must not be empty");
		const built = new Map();
		const validated = new Map();
		for (const [job, result] of Object.entries(results)) {
			assert.equal(
				result?.result,
				"success",
				`Required job ${job} did not succeed`,
			);
			const outputs = object(result.outputs, `${job}.outputs`);
			assert(
				!(outputs["built-images"] && outputs["validated-images"]),
				"Build and validation must be separate jobs",
			);
			for (const [key, target] of [
				["built-images", built],
				["validated-images", validated],
			]) {
				if (!outputs[key]) continue;
				const images = parse(outputs[key], `${job}.${key}`);
				assert(Object.keys(images).length, `${job}.${key} must not be empty`);
				for (const [name, image] of Object.entries(images)) {
					if (target.has(name))
						assert.deepEqual(
							target.get(name),
							image,
							`Conflicting ${key} for ${name}`,
						);
					target.set(name, image);
				}
			}
		}
		assert(built.size > 0, "Missing built-images from candidate producers");
		assert.deepEqual(
			validated,
			built,
			"Validated images must exactly match all candidates",
		);
		return Object.fromEntries(built);
	},

	validate(
		images,
		{ registry, repository, context, runId, attempt, repositoryId },
	) {
		assert(
			/^[a-z0-9]+(?:[.-][a-z0-9]+)*(?::[0-9]+)?$/.test(registry),
			"Invalid registry hostname",
		);
		assert(pathPattern.test(repository), "Invalid repository prefix");
		const destinations = new Set();
		for (const [name, image] of Object.entries(images)) {
			assert(
				pathPattern.test(name) && image.name === name,
				"Invalid image name",
			);
			assert.equal(image.registry, registry, "Unauthorized registry");
			assert.equal(
				image.repository,
				`${repository}/${name}`,
				"Unauthorized image repository",
			);
			assert(
				/^sha256:[a-f0-9]{64}$/.test(image.digest),
				"Invalid image digest",
			);
			const candidate = object(image.candidate, "candidate");
			assert.deepEqual(
				candidate.source,
				{
					repository: `${context.repo.owner}/${context.repo.repo}`,
					revision: context.sha,
				},
				"Stale candidate source",
			);
			assert.deepEqual(
				candidate.run,
				{ id: runId, attempt },
				"Stale candidate run or attempt",
			);
			const base = `${registry}/${image.repository}`;
			assert(
				Array.isArray(image.tags) && image.tags.length === 1,
				"Expected one candidate tag",
			);
			const prefix = `candidate-${repositoryId}-${runId}-${attempt}-`;
			assert(
				image.tags[0].startsWith(prefix) &&
					/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(
						image.tags[0].slice(prefix.length),
					),
				"Invalid candidate tag identity",
			);
			assert.deepEqual(
				image.images,
				[`${base}:${image.tags[0]}@${image.digest}`],
				"Candidate reference does not match its digest",
			);
			assert(
				Array.isArray(candidate.destinations) &&
					candidate.destinations.length > 0,
				"Missing destinations",
			);
			for (const destination of candidate.destinations) {
				assert(
					typeof destination === "string" && destination.startsWith(`${base}:`),
					"Destination must stay in the image repository",
				);
				const tag = destination.slice(base.length + 1);
				assert(
					/^[\w][\w.-]{0,127}$/.test(tag) && !tag.startsWith("candidate-"),
					"Invalid consumer tag",
				);
				assert(!destinations.has(destination), "Duplicate destination");
				destinations.add(destination);
			}
		}
		return images;
	},

	destinations(images) {
		return Object.fromEntries(
			Object.values(images).flatMap((image) =>
				image.candidate.destinations.map((destination) => [
					destination,
					image.digest,
				]),
			),
		);
	},

	rejectSuperseded(claim, records) {
		const currentDestinations = Object.keys(claim.destinations);
		for (const record of records) {
			const previous = object(record.payload, "Publication journal payload");
			assert.equal(
				previous.schema,
				1,
				"Unsupported publication journal schema",
			);
			object(previous.destinations, "Publication journal destinations");
			assert(
				/^\d+$/.test(previous.runId) &&
					/^\d+$/.test(previous.attempt) &&
					Number.isFinite(Date.parse(previous.createdAt)),
				"Invalid publication journal identity",
			);
			const overlap = currentDestinations.filter((destination) =>
				Object.hasOwn(previous.destinations, destination),
			);
			if (!overlap.length) continue;
			if (previous.runId === claim.runId) {
				assert(
					BigInt(previous.attempt) <= BigInt(claim.attempt),
					"A newer attempt claimed this destination",
				);
				if (previous.attempt === claim.attempt) {
					for (const destination of overlap)
						assert.equal(
							previous.destinations[destination],
							claim.destinations[destination],
							"Conflicting publication in the same attempt",
						);
				}
			} else {
				const newer =
					Date.parse(previous.createdAt) > Date.parse(claim.createdAt) ||
					(previous.createdAt === claim.createdAt &&
						BigInt(previous.runId) > BigInt(claim.runId));
				assert(!newer, "A newer run claimed this destination");
			}
		}
	},
};

module.exports = { promotionContract };
