import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import ncc from "@vercel/ncc";
import { build } from "esbuild";
import { getTerms } from "textlint-rule-terminology";

await rm("dist", { recursive: true, force: true });
await mkdir("dist");
// Reuse the repository's dependency-license generation. ncc's runtime bundle
// rewrites dynamic imports of caller config/plugins, so esbuild emits the code.
const { assets } = await ncc(path.resolve("src/index.js"), {
	cache: false,
	target: "es2022",
	license: "licenses.txt",
	quiet: true,
});
await writeFile("dist/licenses.txt", assets["licenses.txt"].source);
await build({
	entryPoints: ["src/index.js"],
	outdir: "dist",
	bundle: true,
	platform: "node",
	mainFields: ["module", "main"],
	format: "esm",
	target: "node24",
	banner: {
		js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
	},
	define: {
		"globalThis.HELM_DOCS_DEFAULT_TERMS": JSON.stringify(
			getTerms(true, [], []),
		),
	},
	legalComments: "eof",
});
await writeFile("dist/package.json", '{"type":"module"}\n');
