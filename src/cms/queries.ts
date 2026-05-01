import { defineQuery } from "groq";

export const groq = {
	page: {
		allSlugs: defineQuery(
			`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`,
		),
		bySlug: defineQuery(
			`*[_type == "page" && slug.current == $slug][0]{
				_id,
				_type,
				title,
				"slug": slug.current,
				content
			}`,
		),
	},
};
