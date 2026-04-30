import { defineField, defineType } from "sanity";

export interface IHeroBlockProps {
	_key: string;
	_type: "hero";
	title?: string;
	image?: string;
}

export const heroBlock_config = defineType({
	name: "hero",
	title: "Hero",
	type: "object",
	fields: [
		defineField({
			name: "title",
			type: "string",
		}),
		defineField({
			name: "image",
			type: "image",
		}),
	],
	preview: {
		select: { title: "title", media: "image" },
		prepare({ title, media }) {
			return {
				title,
				subtitle: "Hero Block",
				media,
			};
		},
	},
});
