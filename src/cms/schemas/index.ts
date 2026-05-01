import { blocks } from "@/blocks";
import type { SchemaTypeDefinition } from "sanity";
import { pageType } from "./page.type";
import { sectionsType } from "./sections.type";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [pageType, sectionsType, ...blocks.map((b) => b.config)],
};
