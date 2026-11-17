import { AsyncLocalStorage } from "node:async_hooks";
import { createRequire } from "node:module";
import path from "node:path";
import { loadConfig } from "@textlint/config-loader";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { registerImportHook, registerResolveHook } from "@textlint/resolver";
import markdownModule from "@textlint/textlint-plugin-markdown";
import comments from "textlint-filter-rule-comments";
import terminology from "./terminology.js";

const markdown = markdownModule.default ?? markdownModule;
const bundled = {
	"@textlint/textlint-plugin-markdown": markdown,
	"textlint-filter-rule-comments": comments,
	"textlint-rule-terminology": terminology,
};

export class TextlintConfiguration {
	constructor() {
		this.directory = new AsyncLocalStorage();
		// These public hooks only participate in this formatter's configuration load.
		registerResolveHook((name) => {
			const directory = this.directory.getStore();
			if (!directory) return;
			if (Object.hasOwn(bundled, name)) return { url: `bundled:${name}` };
			const require = createRequire(path.join(directory, "package.json"));
			try {
				return { url: require.resolve(name) };
			} catch {
				try {
					return { url: require.resolve(path.resolve(directory, name)) };
				} catch {
					return undefined;
				}
			}
		});
		registerImportHook((name) => {
			if (!this.directory.getStore() || !name.startsWith("bundled:")) return;
			const module = bundled[name.slice("bundled:".length)];
			if (module) return { exports: { default: module } };
		});
	}

	async load(configFilePath, workingDirectory) {
		return this.directory.run(workingDirectory, async () => {
			const result = await loadConfig({
				configFilePath,
				cwd: workingDirectory,
			});
			if (!result.ok) {
				throw new AggregateError(result.error.errors, result.error.message);
			}
			return new TextlintKernelDescriptor({
				...result.config,
				plugins: [
					{ pluginId: "@textlint/textlint-plugin-markdown", plugin: markdown },
					...result.config.plugins,
				],
				configBaseDir: path.dirname(result.configFilePath),
			});
		});
	}
}
