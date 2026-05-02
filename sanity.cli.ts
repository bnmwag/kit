import { defineCliConfig } from "sanity/cli";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET ?? "production";

if (!projectId) {
	throw new Error("PUBLIC_SANITY_PROJECT_ID env var is required");
}

export default defineCliConfig({
	api: {
		projectId,
		dataset,
	},
	autoUpdates: true,
	typegen: {
		path: "./src/**/*.{ts,tsx,js,jsx,astro}",
		schema: "./schema.json",
		generates: "./src/cms/sanity.types.ts",
	},
	vite: (config) => ({
		...config,
		plugins: [
			...(config.plugins ?? []),
			{
				name: "stub-astro-imports",
				enforce: "pre",
				resolveId(source) {
					if (source.endsWith(".astro")) return `\0stub-astro:${source}`;
				},
				load(id) {
					if (id.startsWith("\0stub-astro:")) return "export default {};";
				},
			},
		],
	}),
});
