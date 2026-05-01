import { defineField } from "sanity";

export const baseBlock = [
	defineField({
		name: "theme",
		type: "string",
		initialValue: "light",
		options: {
			list: [
				{ title: "Light", value: "light" },
				{ title: "Dark", value: "dark" },
				{ title: "Accent", value: "accent" },
			],
		},
	}),
];
