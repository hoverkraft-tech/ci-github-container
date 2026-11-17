export { DocumentationChanges } from "./change-detection.js";

export async function formatDocumentation(options) {
	const { DocumentationFormatter } = await import("./formatter.js");
	await new DocumentationFormatter(options).format();
}
