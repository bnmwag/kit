import { defineField, defineType } from "sanity";
import { baseBlock } from "../base-block";

export const heroBlockConfig = defineType({
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
			options: { hotspot: true },
			fields: [defineField({ name: "alt", type: "string" })],
		}),
		...baseBlock,
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
