import { blocks } from "@/blocks";
import { defineArrayMember, defineType } from "sanity";

export const sectionsType = defineType({
	name: "sections",
	type: "array",
	of: blocks.map((block) => defineArrayMember({ type: block.name })),
});
