import { schema } from "@/cms/schemas";
import { structure } from "@/cms/structure";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

export default defineConfig({
	name: "kit",
	title: "Kit",
	projectId: "aokf8xnz",
	dataset: "production",
	plugins: [structureTool({ structure })],
	schema,
});
