import { defineQuery } from "groq";

const pageAllSlugsQuery = defineQuery(
	`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`,
);

const pageBySlugQuery = defineQuery(
	`*[_type == "page" && slug.current == $slug][0]{
		_id,
		_type,
		title,
		"slug": slug.current,
		content
	}`,
);

export const groq = {
	page: {
		allSlugs: pageAllSlugsQuery,
		bySlug: pageBySlugQuery,
	},
};
