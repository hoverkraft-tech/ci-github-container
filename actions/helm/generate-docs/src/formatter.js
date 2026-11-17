import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { TextlintKernel } from "@textlint/kernel";
import { globSync } from "glob";
import { main as markdownlint } from "markdownlint-cli2";
import { format, getFileInfo, resolveConfig } from "prettier";
import { TextlintConfiguration } from "./textlint-configuration.js";

const textlintConfiguration = new TextlintConfiguration();

export class DocumentationFormatter {
	constructor({
		workingDirectory,
		valuesFile = "",
		textlintConfig,
		markdownlintConfig,
		core,
	}) {
		this.directory = workingDirectory;
		this.valuesFile = valuesFile;
		this.textlintConfig = textlintConfig;
		this.markdownlintConfig = markdownlintConfig;
		this.core = core;
		this.pattern = path.join(workingDirectory, "**/*.md");
	}

	async format() {
		await this.fixText();
		await this.fixMarkdown();
		await this.prettify();
	}

	async fixText() {
		const descriptor = await textlintConfiguration.load(
			this.textlintConfig,
			this.directory,
		);
		const ignore = path.join(this.directory, ".textlintignore");
		const ignored = ["**/.git/**", "**/node_modules/**"];
		if (existsSync(ignore)) {
			ignored.push(
				...(await readFile(ignore, "utf8"))
					.split(/\r?\n/)
					.filter((line) => !/^\s*(#|$)/.test(line)),
			);
		}
		const options = { cwd: this.directory, nodir: true, dot: true };
		const files = globSync("**/*.md", { ...options, ignore: ignored });
		if (!files.length && !globSync("**/*.md", options).length)
			throw new Error("No Markdown documentation files found.");
		const kernel = new TextlintKernel();
		const results = [];
		for (const file of files) {
			const filePath = path.join(this.directory, file);
			results.push(
				await kernel.fixText(await readFile(filePath, "utf8"), {
					...descriptor.toKernelOptions(),
					ext: path.extname(file),
					filePath,
				}),
			);
		}
		let errors = 0;
		for (const result of results) {
			await writeFile(result.filePath, result.output);
			for (const message of result.remainingMessages) {
				const level = message.severity === 2 ? "error" : "warning";
				if (level === "error") errors++;
				this.core[level](message.message, {
					file: result.filePath,
					startLine: message.line,
					startColumn: message.column,
				});
			}
		}
		if (errors)
			throw new Error(`Textlint reported ${errors} unfixable errors.`);
	}

	async fixMarkdown() {
		await markdownlint({
			directory: this.directory,
			argv: ["--fix", "--config", this.markdownlintConfig, this.pattern],
			optionsDefault: {
				outputFormatters: [
					[
						({ results }) => {
							for (const result of results) {
								this.core.warning(
									`${result.ruleNames[0]}: ${result.ruleDescription}`,
									{
										file: path.resolve(this.directory, result.fileName),
										startLine: result.lineNumber,
									},
								);
							}
						},
					],
				],
			},
			logMessage: (message) => this.core.info(message),
			logError: (message) => this.core.warning(message),
		});
	}

	async prettify() {
		const files = globSync("**/*.md", {
			cwd: this.directory,
			nodir: true,
			dot: true,
			ignore: ["**/.git/**", "**/node_modules/**"],
		}).map((file) => path.join(this.directory, file));
		if (this.valuesFile) files.push(this.valuesFile);
		const ignorePath = [".gitignore", ".prettierignore"].map((file) =>
			path.join(this.directory, file),
		);
		for (const file of new Set(files)) {
			const options = await resolveConfig(file, { editorconfig: true });
			const info = await getFileInfo(file, {
				ignorePath,
				plugins: options?.plugins,
			});
			if (info.ignored) continue;
			const input = await readFile(file, "utf8");
			const output = await format(input, { ...options, filepath: file });
			if (input !== output) await writeFile(file, output);
		}
	}
}
