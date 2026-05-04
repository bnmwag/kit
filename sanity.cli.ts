import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineCliConfig } from "sanity/cli";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
	for (const line of readFileSync(envPath, "utf-8").split("\n")) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const eq = trimmed.indexOf("=");
		if (eq < 0) continue;
		const key = trimmed.slice(0, eq).trim();
		if (process.env[key] !== undefined) continue;
		process.env[key] = trimmed.slice(eq + 1).trim();
	}
}

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
		path: "./src/**/*.{ts,tsx,js,jsx}",
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
