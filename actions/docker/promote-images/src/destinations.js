import assert from "node:assert/strict";
import { promotionContract } from "./contract.js";

function parseObject(raw, name) {
	let value;
	try {
		value = JSON.parse(raw);
	} catch {
		throw new Error(`${name} must be a JSON object`);
	}
	assert(
		value && typeof value === "object" && !Array.isArray(value),
		`${name} must be a JSON object`,
	);
	return value;
}

class PromotionDestinations {
	constructor(images, raw = "{}") {
		this.images = images;
		this.additional = parseObject(raw, "additional-destinations");
		this.claim = promotionContract.destinations(images);
		this.registries = new Set();
		this.requiresCopy = false;
		const pattern =
			/^(?<registry>[a-z0-9]+(?:[.-][a-z0-9]+)*(?::[0-9]+)?)\/(?<repository>[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*(?:\/[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*)*):(?<tag>[\w][\w.-]{0,127})$/;
		for (const [name, destinations] of Object.entries(this.additional)) {
			assert(
				Object.hasOwn(images, name),
				"Additional destinations must identify a validated image",
			);
			assert(
				Array.isArray(destinations) && destinations.length > 0,
				"Each additional image destination list must be nonempty",
			);
			const image = images[name];
			for (const destination of destinations) {
				assert(
					typeof destination === "string" && destination === destination.trim(),
					"Destination references must be strings without surrounding whitespace",
				);
				const match = destination.match(pattern);
				assert(
					match,
					"Additional destinations require a fully qualified tagged image",
				);
				const { registry, repository, tag } = match.groups;
				assert(
					registry.includes(".") ||
						registry.includes(":") ||
						registry === "localhost",
					"Additional destinations require an explicit registry",
				);
				assert(
					!tag.startsWith("candidate-"),
					"Additional destinations cannot overwrite candidate tags",
				);
				assert(
					!Object.hasOwn(this.claim, destination),
					"Duplicate publication destination",
				);
				this.claim[destination] = image.digest;
				if (registry !== image.registry) this.registries.add(registry);
				if (
					`${registry}/${repository}` !==
					`${image.registry}/${image.repository}`
				)
					this.requiresCopy = true;
			}
		}
	}

	authentication({ registry, username, password, credentials = "{}" }) {
		const extra = parseObject(credentials, "destination-credentials");
		for (const name of Object.keys(extra))
			assert(
				this.registries.has(name),
				"Credentials must identify a configured destination registry",
			);
		const registries = { push: registry };
		const usernames = { push: username };
		const passwords = { push: password };
		for (const name of this.registries) {
			const credential = extra[name];
			assert(
				credential &&
					typeof credential === "object" &&
					!Array.isArray(credential),
				"Explicit credentials are required for every additional registry",
			);
			assert(
				Object.keys(credential).every((key) =>
					["username", "password"].includes(key),
				),
				"Unknown destination credential field",
			);
			assert(
				typeof credential.username === "string" &&
					credential.username.trim() &&
					typeof credential.password === "string" &&
					credential.password.trim(),
				"Destination credentials require a username and password",
			);
			// Docker setup accepts named registry roles. Each destination gets its own
			// credentials; the source token must never become a fallback for another host.
			const role = `pull:${name}`;
			registries[role] = name;
			usernames[role] = credential.username;
			passwords[role] = credential.password;
		}
		return { registries, usernames, passwords };
	}

	references() {
		return Object.fromEntries(
			Object.entries(this.additional).map(([name, destinations]) => [
				name,
				destinations.map(
					(destination) => `${destination}@${this.images[name].digest}`,
				),
			]),
		);
	}
}

export { PromotionDestinations };
