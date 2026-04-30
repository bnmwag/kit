import { heroBlock_config } from "@/blocks/hero-block/hero-block.config";
import type { SchemaTypeDefinition } from "sanity";
import { pageBuilderType } from "./page-builder.type";
import { pageType } from "./page.type";

export const schema: { types: SchemaTypeDefinition[] } = {
	types: [
		pageType,
		pageBuilderType,
		// Blocks
		heroBlock_config,
	],
};
