# AGENTS.md

LLM-facing entry point. Read this before touching the repo.

This file is loaded by Claude Code, Codex, Cursor, and other agent tools. Keep it concise — link out to `docs/` for deep dives.

## What this is

Astro 6 + Sanity v5 page-builder template. Tailwind v4, GSAP, Locomotive Scroll v5, Swup transitions, nanostores, Bun runtime. Static output, content-driven.

## Hard rules

These are non-negotiable. Breaking any of them is a bug.

- **Filenames are kebab-case.** Components are PascalCase. Interfaces are `I`-prefixed.
- **Use the `@/` import alias** for `src/`. No `../../../` chains.
- **Conventional Commits**, max 3 bullets, no `Co-authored-by`, no AI-tool references. See `~/CLAUDE.md` for the user's exact format.
- **Every block registers in `src/blocks/index.ts`.** That file drives Sanity schema, types, and rendering. One source of truth.
- **Run `bun run typegen` after any change to `src/cms/schemas/`.** Otherwise types lag.
- **GROQ queries must be top-level `const`s** wrapped in `defineQuery(...)`. The Sanity codegen detector skips queries nested in object literals — see `docs/queries.md`.
- **Block client behavior must NOT be registered from `<script>` tags inside `src/blocks/<name>/*.astro`.** Inline scripts inside the swup container don't execute on transitions. Drop a `<block>.behavior.ts` file in the block folder — the kernel globs `src/blocks/**/*.behavior.ts` and auto-registers. The `.impl.ts` sibling stays lazy. See `docs/scripts.md`.
- **Every `mount()` returns a cleanup.** Every page-scoped service can return a cleanup. No leaks across transitions.
- **Don't ship analytics before consent.** `@vercel/analytics` is dynamically `import()`-ed only after the user accepts the analytics category. See `docs/consent.md`.
- **Reduced-motion checks go through `$mediaStatus.get().isReducedMotion`** from `@/stores/device-status`. Never call `matchMedia("(prefers-reduced-motion: reduce)")` directly — the store is the single source of truth and listens for live changes.
- **Reveal animations gate on the preloader.** `text-reveal` and `image-reveal` await an entrance promise that resolves when the cold-load preloader hands off. Use `data-entrance-delay="<seconds>"` to stagger reveals after the preloader. See `docs/preloader.md`.

## Project layout (cheat sheet)

```
src/
  blocks/           page-builder blocks. one folder per block; markup + schema + behavior colocated.
  cms/              sanity schemas, GROQ queries, generated types
  components/       astro components (core, layout, misc)
  pages/            astro routes; [...slug].astro fans out to sanity pages
  scripts/
    core/           the kernel. small, boring, yours to edit if needed.
    services/       global singletons (transitions, scroll, mouse, consent, analytics)
    behaviors/      cross-cutting DOM-selector behaviors (text-reveal, image-reveal)
    utils/          maths, string, viewport helpers
  stores/           nanostores ($mouse, $scroll, $screen, $consent, $mediaStatus)
  styles/           main.css + theme tokens + per-feature overrides
sanity.cli.ts       sanity CLI config (loads .env)
sanity.config.ts    studio config
astro.config.mjs    astro config
```

`schema.json` is gitignored. `bun run typegen` regenerates it.

## Where to look first

| Task | File |
|---|---|
| Add a new page-builder block | `docs/blocks.md` |
| Add a global service or behavior | `docs/scripts.md` |
| Wire client state | `docs/stores.md` |
| Touch the cookie banner or analytics | `docs/consent.md` |
| Tweak the entry preloader or reveal timing | `docs/preloader.md` |
| Understand the runtime kernel | `docs/architecture.md` |
| First-time setup, env, CORS | `docs/setup.md` |

## Two primitives, period

The whole client runtime API is:

```ts
import { defineService, defineBehavior } from "@/scripts/core";
```

- **Service** — singleton tied to a lifecycle. `scope: "app"` runs once on `app:ready`. `scope: "page"` runs on every `page:enter`, cleaned up on `page:leave`.
- **Behavior** — DOM-selector-driven, one instance per matching element. Mounted on `page:enter`, unmounted on `page:leave`.

Drop a file in `src/scripts/services/` or a folder in `src/scripts/behaviors/`. The kernel auto-imports via `import.meta.glob`. No registration step.

## Common commands

| Command | What it does |
|---|---|
| `bun run dev` | Astro dev server at `localhost:4321`, studio at `/admin` |
| `bun run check` | Astro + TS diagnostics. Should be zero errors. |
| `bun run typegen` | Extract Sanity schema + regenerate `src/cms/sanity.types.ts` |
| `bun run build` | Production build to `./dist/` |

## Verifying changes

- `bun run check` after every meaningful edit. Don't claim "done" until it returns 0 errors.
- For UI/CSS, **start the dev server and look at the page** — type checks don't catch visual regressions.
- For Sanity schema edits, run `bun run typegen` and confirm the generated types include your fields before consuming them.

## What NOT to do

- Don't add `<script>` tags inside block astro files for behavior registration. Use `src/scripts/behaviors/`.
- Don't put GROQ queries inside object literals or function bodies. Top-level `const x = defineQuery(...)` only.
- Don't load `@vercel/analytics` (or any analytics) before consent. Lazy-import only.
- Don't reach across blocks. Lift shared logic to `src/components/` or `src/scripts/behaviors/`.
- Don't bypass the kernel's lifecycle by binding `window.addEventListener` directly inside services without cleanup.
- Don't write decorative comments. JSDoc only on functions when the *why* is non-obvious.
- Don't add features the user didn't ask for. Don't pre-emptively refactor adjacent code.

## Coding conventions (short version)

The user's global preferences are in `~/CLAUDE.md`. Highlights that bite often:

- TypeScript: explicit types, prefer arrow functions, no implicit `any`.
- React FC pattern: `interface IFooProps extends ComponentProps<"div"> {}`, merge `className` via `cn()`.
- Sanity: `defineField` + `defineType` always; spread `baseBlock` into every block's fields.
- Server components by default in Astro. Use `"use client"` only when state/effects/browser APIs are needed.
- No `console.log` in shipped code.
- No premature abstractions. Three similar lines beats a factory.
