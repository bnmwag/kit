import { DocumentIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const pageType = defineType({
	name: "page",
	title: "Page",
	type: "document",
	icon: DocumentIcon,
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
		defineField({
			name: "slug",
			type: "slug",
			options: {
				source: "title",
			},
		}),
		defineField({
			name: "content",
			type: "page_builder",
		}),
	],
	preview: {
		select: {
			title: "title",
			subtitle: "slug.current",
		},
	},
});
