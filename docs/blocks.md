# Blocks

Page-builder blocks are the unit of layout. A block is one Sanity object type rendered by one Astro component. Editors compose pages by stacking blocks; the renderer fans out the array.

## The registry pattern

Everything blocks-related flows from one file:

```ts
// src/blocks/index.ts
export const blocks = [
    { name: "hero", config: heroBlockConfig, markup: HeroBlock },
] as const satisfies ReadonlyArray<{
    name: string;
    config: SchemaTypeDefinition;
    markup: unknown;
}>;
```

That single array is consumed by:

- **Sanity schema** (`src/cms/schemas/sections.type.ts`) — generates the array of allowed block types in the page builder.
- **Sanity schema root** (`src/cms/schemas/index.ts`) — registers each block's object type so Studio knows about them.
- **Renderer** (`src/blocks/render-blocks.astro`) — looks up `_type` and renders the matching astro component.

Add an entry, get all three for free. No other wiring.

## Anatomy of a block

```
src/blocks/hero-block/
  hero-block.astro          ← the markup. receives `data` prop typed against the schema.
  hero-block.config.ts      ← Sanity object type (defineType). owns fields and preview.
  hero-block.css            ← (optional) block-scoped styles. imported by impl or astro.
  hero-block.behavior.ts    ← (optional) eager registration via defineBehavior. picked up by the kernel glob.
  hero-block.impl.ts        ← (optional) lazy behavior implementation. exports `mount(el)`.
  index.ts                  ← barrel: re-exports the astro default + the config.
```

The astro file owns markup. The config owns schema. The impl (if any) owns runtime behavior. Each piece changes independently.

## Recipe — add a new block

Let's add an `intro` block with a heading, body text, and theme support.

### 1. Create the folder

```sh
mkdir -p src/blocks/intro-block
cd src/blocks/intro-block
```

### 2. Write the schema (`intro-block.config.ts`)

```ts
import { defineField, defineType } from "sanity";

import { baseBlock } from "../base-block";

export const introBlockConfig = defineType({
    name: "intro",
    title: "Intro",
    type: "object",
    fields: [
        defineField({
            name: "heading",
            type: "string",
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: "body",
            type: "text",
            rows: 3,
        }),
        ...baseBlock,
    ],
    preview: {
        select: { title: "heading" },
        prepare({ title }) {
            return { title, subtitle: "Intro Block" };
        },
    },
});
```

`baseBlock` adds the shared `theme` field (`light` / `dark` / `accent`). Spread it into every block's `fields`.

### 3. Write the markup (`intro-block.astro`)

```astro
---
import type { Intro } from "@/cms/sanity.types";
import { Container, Section } from "@/components/core";

interface Props {
    data: Intro;
}

const { data } = Astro.props;
const { _type, theme, heading, body } = data;
---

<Section class='py-32' {_type} {theme}>
    <Container>
        <h2 class='text-h2'>{heading}</h2>
        {body && <p class='mt-6 text-body max-w-prose'>{body}</p>}
    </Container>
</Section>
```

The `Intro` type is auto-generated — see step 5.

### 4. Barrel export (`index.ts`)

```ts
export { default as IntroBlock } from "./intro-block.astro";
export * from "./intro-block.config";
```

### 5. Register in `src/blocks/index.ts`

```ts
import { HeroBlock, heroBlockConfig } from "@/blocks/hero-block";
import { IntroBlock, introBlockConfig } from "@/blocks/intro-block";
import type { SchemaTypeDefinition } from "sanity";
export { default as RenderBlocks } from "./render-blocks.astro";

export const blocks = [
    { name: "hero", config: heroBlockConfig, markup: HeroBlock },
    { name: "intro", config: introBlockConfig, markup: IntroBlock },
] as const satisfies ReadonlyArray<{
    name: string;
    config: SchemaTypeDefinition;
    markup: unknown;
}>;

export type BlockName = (typeof blocks)[number]["name"];
```

### 6. Regenerate types

```sh
bun run typegen
```

This extracts the schema and writes `src/cms/sanity.types.ts`. Now `import type { Intro } from "@/cms/sanity.types"` resolves.

### 7. Use it in Studio

`bun run dev` → http://localhost:4321/admin → create a page → **Add item** in the content array → **Intro**. Fill it in, **Publish**, view the page at its slug.

## Adding a behavior to a block

Block-scoped runtime logic (animations, interactivity) lives in two files inside the block folder:

- `<block>.behavior.ts` — eager registration via `defineBehavior`. Auto-discovered by the kernel.
- `<block>.impl.ts` — the lazy `mount(el)` implementation. Loaded as a separate Vite chunk on first match.

See [scripts.md](scripts.md#block-scoped-behaviors) for the full recipe and an example with GSAP.

## Conventions

- **Folder + file names** are kebab-case: `intro-block/intro-block.astro`.
- **Config name** matches the schema name, with `-config` suffix in the constant: `introBlockConfig`.
- **Astro export** is PascalCase with `Block` suffix: `IntroBlock`.
- **Schema `name`** in the config matches the entry's `name` in the registry: `"intro"`.
- **`baseBlock` is mandatory** — every block gets a `theme` field for consistency.
- **Don't reach across blocks.** A block doesn't import from another block's folder. If two blocks share something, lift it to `src/components/` or `src/scripts/behaviors/`.

## Querying block data

`src/cms/queries.ts` defines GROQ queries with `defineQuery` (typed via Sanity's typegen). The default `bySlug` returns the full `content` array — every block's data flows through automatically.

```ts
// src/cms/queries.ts
export const groq = {
    page: {
        bySlug: defineQuery(
            `*[_type == "page" && slug.current == $slug][0]{
                _id,
                _type,
                title,
                "slug": slug.current,
                content
            }`,
        ),
    },
};
```

If a block needs derived data (e.g., a referenced doc), expand the projection inside `content[]{...}` rather than introducing a per-block query.

## Theme field

Every block ships with `theme` (`light` / `dark` / `accent`) via `baseBlock`. Read it inside the block's astro file and pass it to the wrapping `<Section>` — that's how block-level theming gets applied without per-block CSS hacks.

```astro
const { theme } = data;
<Section {theme}>...</Section>
```

The `Section` component (in `src/components/core/`) handles the actual color token application.

## Removing a block

Reverse of adding: remove the entry from `src/blocks/index.ts`, delete the folder, run `bun run typegen`. Existing CMS documents of that type become orphaned in Studio — clean them up before removing schema if data matters.
