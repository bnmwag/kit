import { defineLocations } from "sanity/presentation";
import type { PresentationPluginOptions } from "sanity/presentation";

export const resolve: PresentationPluginOptions["resolve"] = {
	locations: {
		page: defineLocations({
			select: {
				title: "title",
				slug: "slug.current",
			},
			resolve: (doc) => {
				const slug = doc?.slug ?? "";
				const href = slug === "home" || slug === "" ? "/" : `/${slug}`;
				return {
					locations: [
						{
							title: doc?.title || "Untitled",
							href,
						},
					],
				};
			},
		}),
	},
};
