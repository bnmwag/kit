// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";
import sanity from "@sanity/astro";

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
	],

	vite: {
		plugins: [tailwindcss()],
		resolve: {
			noExternal: ["sanity"],
		},
	},

	integrations: [
		sanity({
			projectId: "aokf8xnz",
			dataset: "production",
			useCdn: false,
			studioBasePath: "/admin",
		}),
		react(),
	],
});
