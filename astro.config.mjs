// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

if (!env.PUBLIC_SANITY_PROJECT_ID) {
	throw new Error("PUBLIC_SANITY_PROJECT_ID env var is required");
}

const SITE_URL = env.PUBLIC_SITE_URL ?? "http://localhost:4321";
const STUDIO_URL = `${SITE_URL}/admin`;

export default defineConfig({
	output: "server",
	adapter: vercel(),

	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Zalando Sans",
			cssVariable: "--font-zalando-sans",
			weights: ["100", "300", "400", "500", "600", "700"],
			styles: ["normal"],
			subsets: ["latin"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			weights: ["100", "300", "400", "500", "600", "700"],
			styles: ["normal"],
			subsets: ["latin"],
		},
	],

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			noExternal: ["sanity"],
		},
		optimizeDeps: {
			include: [
				"react/compiler-runtime",
				"lodash/isObject.js",
				"lodash/groupBy.js",
				"lodash/keyBy.js",
				"lodash/partition.js",
				"lodash/sortedIndex.js",
			],
		},
	},

	integrations: [
		sanity({
			projectId: env.PUBLIC_SANITY_PROJECT_ID,
			dataset: env.PUBLIC_SANITY_DATASET ?? "production",
			useCdn: false,
			apiVersion: "2026-03-01",
			studioBasePath: "/admin",
			stega: {
				studioUrl: STUDIO_URL,
			},
		}),
		react(),
	],
});
