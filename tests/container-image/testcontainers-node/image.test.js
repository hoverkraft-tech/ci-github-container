import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { GenericContainer, Network, Wait } from "testcontainers";

test("the packaged service keeps its runtime user and serves its health endpoint", async (t) => {
	assert.ok(process.env.TESTED_IMAGE_REF, "TESTED_IMAGE_REF is required");
	const network = await new Network().start();
	let container;
	t.after(async () => {
		await container?.stop();
		await network.stop();
	});
	container = await new GenericContainer(process.env.TESTED_IMAGE_REF)
		.withNetwork(network)
		.withExposedPorts(8080)
		.withWaitStrategy(Wait.forHttp("/health/check/", 8080))
		.start();
	if (existsSync("timeout")) await new Promise(() => {});
	const response = await fetch(
		`http://${container.getHost()}:${container.getMappedPort(8080)}/health/check/`,
	);
	assert.equal(response.status, existsSync("failure") ? 503 : 200);
	assert.match(await response.text(), /OK/);
	assert.equal((await container.exec(["id", "-u"])).output.trim(), "0");
});
