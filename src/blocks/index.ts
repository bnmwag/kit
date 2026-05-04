import { HeroBlock, heroBlockConfig } from "@/blocks/hero-block";
import { LegalBlock, legalBlockConfig } from "@/blocks/legal-block";
import type { SchemaTypeDefinition } from "sanity";
export { default as RenderBlocks } from "./render-blocks.astro";

// biome-ignore lint/suppressions: dispatch is dynamic; each block's .astro narrows its own data prop.
export type BlockMarkup = (props: { data: any }) => unknown;

export interface IBlockEntry {
    name: string;
    config: SchemaTypeDefinition;
    markup: BlockMarkup;
}

export const blocks = [
    { name: "hero", config: heroBlockConfig, markup: HeroBlock },
    { name: "legal", config: legalBlockConfig, markup: LegalBlock },
] as const satisfies ReadonlyArray<IBlockEntry>;

export type BlockName = (typeof blocks)[number]["name"];
