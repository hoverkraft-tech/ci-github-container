import { createHash } from "node:crypto";
import { globSync, lstatSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";

export class Reports {
	static fingerprint(file) {
		const stat = statSync(file, { bigint: true });
		if (!stat.isFile() || stat.size > 20_000_000n)
			throw new Error(`Expected a report file of at most 20 MB: ${file}`);
		return `${stat.ino}:${stat.mtimeNs}:${createHash("sha256").update(readFileSync(file)).digest("hex")}`;
	}

	static async select(directory, patterns, { required = true } = {}) {
		const entries = patterns
			.split(/[\n,;]+/)
			.map((entry) => entry.trim())
			.filter(Boolean);
		if (!entries.length || entries.some((entry) => entry.startsWith("auto:")))
			throw new Error("report-file must contain explicit paths or globs.");
		const exclusions = entries
			.filter((entry) => entry.startsWith("!"))
			.map((entry) => path.resolve(directory, entry.slice(1)));
		const files = new Set();
		for (const entry of entries.filter((entry) => !entry.startsWith("!"))) {
			const matches = globSync(path.resolve(directory, entry), {
				exclude: exclusions,
			}).filter((file) => lstatSync(file).isFile());
			if (required && matches.length === 0)
				throw new Error(`No current test report matches: ${entry}`);
			for (const file of matches) files.add(file);
		}
		if (required && !files.size)
			throw new Error("No native test reports were produced.");
		return [...files].sort();
	}

	constructor(file) {
		if (statSync(file).size > 20_000_000)
			throw new Error(`JUnit report exceeds 20 MB: ${file}`);
		const source = readFileSync(file, "utf8");
		if (
			source.length > 20_000_000 ||
			/<!DOCTYPE|<!ENTITY/i.test(source) ||
			XMLValidator.validate(source) !== true
		)
			throw new Error(`Invalid JUnit report: ${file}`);
		this.xml = new XMLParser({
			ignoreAttributes: false,
			processEntities: false,
		}).parse(source);
		if (!this.xml.testsuites && !this.xml.testsuite)
			throw new Error(`Expected JUnit test suites: ${file}`);
	}

	inspect() {
		let reportedFailure = false;
		const counts = { executed: 0, skipped: 0, failed: 0 };
		const visit = (node) => {
			if (!node || typeof node !== "object") return;
			if (Number(node["@_failures"]) > 0 || Number(node["@_errors"]) > 0)
				reportedFailure = true;
			for (const [key, value] of Object.entries(node)) {
				if (key === "testcase") {
					for (const test of Array.isArray(value) ? value : [value]) {
						if (test && Object.hasOwn(test, "skipped")) counts.skipped++;
						else {
							counts.executed++;
							if (
								test &&
								(Object.hasOwn(test, "failure") || Object.hasOwn(test, "error"))
							)
								counts.failed++;
						}
					}
				} else if (
					key === "testsuite" ||
					key === "testsuites" ||
					Array.isArray(node)
				) {
					if (Array.isArray(value)) value.forEach(visit);
					else visit(value);
				}
			}
		};
		visit(this.xml);
		if (reportedFailure && !counts.failed)
			throw new Error(
				"JUnit suites report failures without failed test cases.",
			);
		return counts;
	}

	static validate(files, baseline = {}) {
		const total = { executed: 0, skipped: 0, failed: 0 };
		for (const file of files) {
			if (baseline[file] === Reports.fingerprint(file))
				throw new Error(`Stale report from before this invocation: ${file}`);
			const counts = new Reports(file).inspect();
			for (const key of Object.keys(total)) total[key] += counts[key];
		}
		if (!total.executed)
			throw new Error(
				"The suite executed no test cases (missing, empty or all skipped).",
			);
		if (total.failed) throw new Error(`${total.failed} test case(s) failed.`);
		return total;
	}
}
