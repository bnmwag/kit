// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import sanity from "@sanity/astro";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

if (!env.SANITY_PROJECT_ID) {
	throw new Error("SANITY_PROJECT_ID env var is required");
}

export default defineConfig({
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
	},

	integrations: [
		sanity({
			projectId: env.SANITY_PROJECT_ID,
			dataset: env.SANITY_DATASET ?? "production",
			useCdn: false,
			studioBasePath: "/admin",
		}),
		react(),
	],
});
