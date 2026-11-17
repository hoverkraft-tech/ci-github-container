import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import stripJsonComments from "strip-json-comments";
import terminology, { getTerms } from "textlint-rule-terminology";

// Build-time injection embeds the package's dictionary without its dynamic file
// lookup. Source tests obtain the same data through the rule's public API.
const defaults = globalThis.HELM_DOCS_DEFAULT_TERMS ?? getTerms(true, [], []);

function bundledReporter(reporter) {
	return (context, options = {}) => {
		let terms = options.terms ?? [];
		if (typeof terms === "string") {
			const directory = context.getConfigBaseDir();
			const require = createRequire(path.join(directory, "package.json"));
			let file;
			try {
				file = require.resolve(terms);
			} catch {
				file = require.resolve(path.resolve(directory, terms));
			}
			terms = JSON.parse(stripJsonComments(readFileSync(file, "utf8")));
		}
		return reporter(context, {
			...options,
			defaultTerms: false,
			terms: [...terms, ...(options.defaultTerms === false ? [] : defaults)],
		});
	};
}

export default {
	linter: bundledReporter(terminology.linter),
	fixer: bundledReporter(terminology.fixer),
};
