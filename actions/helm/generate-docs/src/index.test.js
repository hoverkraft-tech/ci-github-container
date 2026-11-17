import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const { formatDocumentation } = await import(
	process.env.ACTION_ENTRYPOINT
		? pathToFileURL(process.env.ACTION_ENTRYPOINT)
		: new URL("./index.js", import.meta.url)
);

function fixture(t) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "helm-docs-"));
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	const workingDirectory = path.join(directory, "chart with spaces");
	fs.mkdirSync(workingDirectory);
	const write = (file, data) => {
		const target = path.join(workingDirectory, file);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(
			target,
			typeof data === "string" ? data : JSON.stringify(data),
		);
		return target;
	};
	const warnings = [];
	const errors = [];
	const options = {
		workingDirectory,
		textlintConfig: write(".textlintrc", {
			rules: { terminology: true },
			filters: { comments: true },
			plugins: { "@textlint/markdown": true },
		}),
		markdownlintConfig: write(".markdownlint.json", {
			default: true,
			"line-length": false,
		}),
		core: {
			info: () => {},
			warning: (text) => warnings.push(text),
			error: (text) => errors.push(text),
		},
	};
	write("README.md", "# Chart\n\nThis uses javascript.\n");
	return {
		options,
		write,
		warnings,
		errors,
		read: (file) => fs.readFileSync(path.join(workingDirectory, file), "utf8"),
	};
}

test("formats default Markdown, nested docs, embedded JSON and supplied YAML without package installation", async (t) => {
	const f = fixture(t);
	f.write("child/README.md", '# Child\n\n```json\n{"count":1}\n```\n');
	f.options.valuesFile = f.write("values.yaml", "replicas:   2\n");
	await formatDocumentation(f.options);
	assert.match(f.read("README.md"), /JavaScript/);
	assert.match(f.read("child/README.md"), /"count": 1/);
	assert.equal(f.read("values.yaml"), "replicas: 2\n");
	assert.deepEqual(f.errors, []);
	assert.equal(
		fs.existsSync(path.join(f.options.workingDirectory, "node_modules")),
		false,
	);
});

test("retains terminology options, relative dictionaries and inline comment filters", async (t) => {
	const f = fixture(t);
	f.write("terms.jsonc", '// Caller dictionary\n["Acme"]');
	f.write(".textlintrc", {
		rules: {
			"textlint-rule-terminology": {
				defaultTerms: false,
				terms: "./terms.jsonc",
			},
		},
		filters: { "textlint-filter-rule-comments": true },
		plugins: ["@textlint/markdown"],
	});
	f.write(
		"README.md",
		"# Chart\n\nUse acme and javascript.\n\n<!-- textlint-disable -->\nUse acme here.\n<!-- textlint-enable -->\n",
	);
	await formatDocumentation(f.options);
	assert.match(f.read("README.md"), /Use Acme and javascript/);
	assert.match(f.read("README.md"), /Use acme here/);
});

test("honors disabled rules, ignore files and per-file Prettier configuration", async (t) => {
	const f = fixture(t);
	f.write(".textlintrc", { rules: { terminology: false } });
	f.write(".prettierignore", "ignored.md\n");
	f.write(".textlintignore", "ignored.md\n");
	f.write(".markdownlint-cli2.jsonc", { ignores: ["ignored.md"] });
	f.write("ignored.md", "#ignored\n");
	f.write("node_modules/caller-package/README.md", "Use javascript.\n");
	f.write(".git/README.md", "Use javascript.\n");
	f.write(".prettierrc.json", { tabWidth: 4 });
	f.options.valuesFile = f.write("values.yaml", "parent:\n  child:  1\n");
	await formatDocumentation(f.options);
	assert.match(f.read("README.md"), /javascript/);
	assert.equal(f.read("ignored.md"), "#ignored\n");
	assert.equal(
		f.read("node_modules/caller-package/README.md"),
		"Use javascript.\n",
	);
	assert.equal(f.read(".git/README.md"), "Use javascript.\n");
	assert.equal(f.read("values.yaml"), "parent:\n    child: 1\n");
});

test("formats hidden Markdown files and skips directories with a Markdown suffix", async (t) => {
	const f = fixture(t);
	f.write(".hidden/guide.md", "# Guide\n\nUse javascript.\n");
	f.write("assets.md/image.txt", "not Markdown");
	await formatDocumentation(f.options);
	assert.match(f.read(".hidden/guide.md"), /JavaScript/);
	assert.equal(f.read("assets.md/image.txt"), "not Markdown");
});

test("loads caller-owned Textlint rules and preserves unfixable errors", async (t) => {
	const f = fixture(t);
	f.write(
		"custom-rule.cjs",
		`const report = context => ({
		[context.Syntax.Str](node) { context.report(node, new context.RuleError('custom caller policy')); }
	}); module.exports = { linter: report, fixer: report };`,
	);
	f.write(".textlintrc", { rules: { "./custom-rule.cjs": true } });
	await assert.rejects(formatDocumentation(f.options), /unfixable errors/);
	assert.ok(
		f.errors.some((message) => message.includes("custom caller policy")),
	);
});

test("loads caller-owned Prettier plugins", async (t) => {
	const f = fixture(t);
	f.write(
		"custom-prettier.cjs",
		`module.exports = {
		parsers: { custom: { parse: text => ({ text }), astFormat: 'custom', locStart: () => 0, locEnd: node => node.text.length } },
		printers: { custom: { print: () => 'custom formatting\\n' } }
	};`,
	);
	f.write(
		".prettierrc.cjs",
		"module.exports = { plugins: ['./custom-prettier.cjs'], parser: 'custom' };\n",
	);
	await formatDocumentation(f.options);
	assert.equal(f.read("README.md"), "custom formatting\n");
});

test("keeps unfixable Markdown style findings advisory", async (t) => {
	const f = fixture(t);
	f.write("README.md", "# Chart\n\n```\nexample\n```\n");
	await formatDocumentation(f.options);
	assert.ok(f.warnings.some((message) => message.includes("MD040")));
});

for (const [label, config] of [
	["invalid config", "{broken"],
	["missing rule", { rules: { "missing-caller-rule": true } }],
]) {
	test(`fails on ${label} before editing documentation`, async (t) => {
		const f = fixture(t);
		f.write(".textlintrc", config);
		const before = f.read("README.md");
		await assert.rejects(formatDocumentation(f.options));
		assert.equal(f.read("README.md"), before);
	});
}

test("fails for invalid values-file YAML", async (t) => {
	const f = fixture(t);
	f.options.valuesFile = f.write("values.yaml", "broken: [\n");
	await assert.rejects(formatDocumentation(f.options));
});

test("loads caller-owned Markdownlint configuration and custom rules", async (t) => {
	const f = fixture(t);
	f.write(
		".markdownlint-cli2.cjs",
		`module.exports = {
        customRules: [{ names: ['custom-rule'], description: 'caller markdown policy', tags: ['test'],
            function: (params, onError) => onError({lineNumber: 1}) }]
    };`,
	);
	await formatDocumentation(f.options);
	assert.ok(
		f.warnings.some((message) => message.includes("caller markdown policy")),
	);
});
