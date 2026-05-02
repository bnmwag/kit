import { schema } from "@/cms/schemas";
import { structure } from "@/cms/structure";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

const nodeEnv =
	typeof process !== "undefined" && process.env ? process.env : undefined;

const projectId =
	import.meta.env.PUBLIC_SANITY_PROJECT_ID ??
	nodeEnv?.PUBLIC_SANITY_PROJECT_ID;
const dataset =
	import.meta.env.PUBLIC_SANITY_DATASET ??
	nodeEnv?.PUBLIC_SANITY_DATASET ??
	"production";

if (!projectId) {
	throw new Error("PUBLIC_SANITY_PROJECT_ID env var is required");
}

export default defineConfig({
	name: "kit",
	title: "Kit",
	projectId,
	dataset,
	plugins: [structureTool({ structure })],
	schema,
});
