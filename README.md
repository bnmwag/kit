# Kit

Astro + Sanity starter. Locomotive Scroll, GSAP, Tailwind v4, Swup transitions. Built by creatives, for creatives — less yak-shaving, more actual work.

## Docs

- [docs/setup.md](docs/setup.md) — clone to running dev server
- [docs/architecture.md](docs/architecture.md) — project layout, principles, how the pieces fit
- [docs/blocks.md](docs/blocks.md) — add a new page-builder block
- [docs/scripts.md](docs/scripts.md) — services and behaviors deep dive
- [docs/stores.md](docs/stores.md) — nanostores: state, subscriptions, persistence
- [docs/consent.md](docs/consent.md) — cookie banner and consent-gated analytics

For LLM agents (Claude Code, Codex, Cursor): see [AGENTS.md](AGENTS.md) at the repo root.

## Setup

See [docs/setup.md](docs/setup.md) for the full walkthrough. Short version:

```sh
bunx degit bnmwag/kit my-app
cd my-app
bun install
cp .env.example .env
# fill PUBLIC_SANITY_PROJECT_ID from https://sanity.io/manage
bun run typegen
bun run dev
```

## Scripts

| Command   | What it does                              |
| :-------- | :---------------------------------------- |
| `dev`     | Start dev server at `localhost:4321`      |
| `build`   | Build to `./dist/`                        |
| `preview` | Preview the production build locally      |
| `check`   | Run `astro check` (type + content checks) |
| `typegen` | Extract Sanity schema and regenerate types |

The Sanity studio is mounted at `/admin`.

## Stack

- **Astro + Sanity** — static output, structured content
- **Vercel** — hosting, ISR, instant rollbacks
- **Locomotive Scroll + GSAP** — smooth scroll, scripted motion
- **Tailwind v4 + Swup** — styling and page transitions

## Environment

| Variable             | Required | Default      |
| :------------------- | :------- | :----------- |
| `SANITY_PROJECT_ID`  | yes      | —            |
| `SANITY_DATASET`     | no       | `production` |

## License

MIT.
