# Setup

From a fresh clone to a running dev server. Skip steps you've already done.

## 1. Clone

```sh
bunx degit bnmwag/kit my-app
cd my-app
```

## 2. Install

```sh
bun install
```

## 3. Get a Sanity project ID

You need a `projectId` to wire the studio + content client to Sanity. Pick whichever path is faster for you.

### Option A — Sanity CLI (fastest)

The `sanity` CLI ships with this template — no extra install. Use `bunx` to run it.

```sh
# one-time browser login
bunx sanity login

# create a new project (prints the project ID)
bunx sanity projects create "My Site"

# or list existing projects you already have access to
bunx sanity projects list
```

Copy the `id` from the output.

### Option B — Web dashboard

1. Open https://sanity.io/manage
2. Sign in (Google / GitHub / email)
3. **Create new project** (or open an existing one)
4. Copy the project ID from the project's dashboard

## 4. Configure `.env`

```sh
cp .env.example .env
```

Open `.env` and fill in:

```env
PUBLIC_SANITY_PROJECT_ID=<your project id>
PUBLIC_SANITY_DATASET=production
```

`production` is the default dataset Sanity creates with every new project. If you use a different dataset name, change it here.

## 5. Add a localhost CORS origin

The embedded studio (mounted at `/admin`) makes authenticated requests from the dev server. The Sanity API rejects those by default until you whitelist the origin.

### Option A — Sanity CLI

```sh
bunx sanity cors add http://localhost:4321 --credentials
```

Reads the project ID from `.env` (so do step 4 first). Re-run with any other origin you deploy to later.

### Option B — Web dashboard

1. Go to https://sanity.io/manage → your project → **API** → **CORS Origins**
2. **Add CORS origin**
3. Origin: `http://localhost:4321`
4. **Allow credentials**: yes
5. Save

## 6. Generate types

```sh
bun run typegen
```

This extracts the schema (`schema.json`) and regenerates `src/cms/sanity.types.ts`. Re-run any time the schema changes.

## 7. Run

```sh
bun run dev
```

- Site: http://localhost:4321
- Studio: http://localhost:4321/admin

## Troubleshooting

**`PUBLIC_SANITY_PROJECT_ID env var is required`** — `.env` isn't populated, or the file isn't at the project root. Verify `cat .env` shows the variable.

**Studio loads but content doesn't save / fetch** — CORS origin is missing. Re-check step 5.

**Schema types are stale** — `bun run typegen` after any change to `src/cms/schemas/`.
