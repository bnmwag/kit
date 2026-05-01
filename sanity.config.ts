import { schema } from "@/cms/schemas";
import { structure } from "@/cms/structure";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";

if (!projectId) {
	throw new Error("SANITY_PROJECT_ID env var is required");
}

export default defineConfig({
	name: "kit",
	title: "Kit",
	projectId,
	dataset,
	plugins: [structureTool({ structure })],
	schema,
});
