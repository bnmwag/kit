import { defineArrayMember, defineType } from "sanity";

export const pageBuilderType = defineType({
	name: "page_builder",
	type: "array",
	of: [defineArrayMember({ type: "hero" })],
});
