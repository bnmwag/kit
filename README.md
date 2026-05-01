# Kit

Astro + Sanity starter. Locomotive Scroll, GSAP, Tailwind v4, Swup transitions. Built by creatives, for creatives — less yak-shaving, more actual work.

## Setup

```sh
# 1. clone
bunx degit bnmwag/kit my-app
cd my-app

# 2. configure
cp .env.example .env
# fill in SANITY_PROJECT_ID (find it at https://sanity.io/manage)

# 3. install + run
bun install
bun run dev
```

## Scripts

| Command         | What it does                              |
| :-------------- | :---------------------------------------- |
| `dev`           | Start dev server at `localhost:4321`      |
| `build`         | Build to `./dist/`                        |
| `preview`       | Preview the production build locally      |
| `check`         | Run `astro check` (type + content checks) |
| `typegen`       | Extract Sanity schema and regenerate types |

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
