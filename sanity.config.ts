import { schema } from "@/cms/schemas";
import { structure } from "@/cms/structure";
import { resolve } from "@/cms/presentation/resolve";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
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

const previewOrigin =
	import.meta.env.PUBLIC_SITE_URL ??
	nodeEnv?.PUBLIC_SITE_URL ??
	"http://localhost:4321";

if (!projectId) {
	throw new Error("PUBLIC_SANITY_PROJECT_ID env var is required");
}

export default defineConfig({
	name: "kit",
	title: "Kit",
	projectId,
	dataset,
	plugins: [
		presentationTool({
			resolve,
			previewUrl: {
				initial: previewOrigin,
				previewMode: {
					enable: "/api/draft-mode/enable",
				},
			},
		}),
		structureTool({ structure }),
	],
	schema,
});
