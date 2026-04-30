import { schema } from "@/cms/schemas";
import { structure } from "@/cms/structure";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

export default defineConfig({
	name: "vault",
	title: "Vault",
	projectId: "aokf8xnz",
	dataset: "production",
	plugins: [structureTool({ structure })],
	schema,
});
