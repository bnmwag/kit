import { HeroBlock, heroBlockConfig } from "@/blocks/hero-block";
import { LegalBlock, legalBlockConfig } from "@/blocks/legal-block";
import type { SchemaTypeDefinition } from "sanity";
export { default as RenderBlocks } from "./render-blocks.astro";

export const blocks = [
	{ name: "hero", config: heroBlockConfig, markup: HeroBlock },
	{ name: "legal", config: legalBlockConfig, markup: LegalBlock },
] as const satisfies ReadonlyArray<{
	name: string;
	config: SchemaTypeDefinition;
	markup: unknown;
}>;

export type BlockName = (typeof blocks)[number]["name"];
