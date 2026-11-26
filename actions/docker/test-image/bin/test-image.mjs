#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { ContainerTest } from "../dist/index.js";

const { values } = parseArgs({
	options: {
		image: { type: "string" },
		engine: { type: "string", default: "auto" },
		"working-directory": { type: "string", default: "." },
		platform: { type: "string" },
		timeout: { type: "string", default: "300" },
		"report-file": { type: "string" },
		"output-directory": { type: "string" },
	},
});
let test;
try {
	test = await ContainerTest.prepare(
		{
			image: values.image,
			engine: values.engine,
			workingDirectory: values["working-directory"],
			platform: values.platform,
			timeout: values.timeout,
			reportFile: values["report-file"],
		},
		{
			...process.env,
			...(values["output-directory"]
				? { RUNNER_TEMP: values["output-directory"] }
				: {}),
		},
	);
	const tooling = JSON.parse(
		readFileSync(new URL("../tooling.json", import.meta.url)),
	);
	await test.run(tooling);
	console.log(JSON.stringify(test.result(await test.reportFiles()), null, 2));
} catch (error) {
	console.error(error.message);
	process.exitCode = 1;
} finally {
	if (test) {
		try {
			await test.finish();
		} catch (error) {
			console.error(error.message);
			process.exitCode = 1;
		}
		console.log(`Reports and diagnostics: ${test.state.directory}`);
	}
}
