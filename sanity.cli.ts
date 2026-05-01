import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
	api: {
		projectId: "aokf8xnz",
		dataset: "production",
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
