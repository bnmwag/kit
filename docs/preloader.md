# Preloader

A cold-load entry animation that plays once on first visit and never on internal Swup navigations. Drives an **entrance gate** that text/image reveals await before animating, so reveals never fire under the panel.

## The pieces

| File | Role |
|---|---|
| `src/components/layout/preloader.astro` | Full-bleed panel + wordmark, mounted in `base.astro` outside `<main id="swup">` |
| `src/scripts/services/preloader.ts` | `app`-scoped GSAP service. Animates the panel out, releases the entrance gate |
| `src/scripts/core/entrance.ts` | Promise-based gate: `awaitEntrance(delaySeconds)` / `releaseEntrance()` |

## Why it only plays on cold load

The preloader lives outside `<main id="swup">`. Swup only swaps the swup container, so the preloader markup is never re-injected on internal nav. The service calls `root.remove()` on `onComplete` — once removed, it's gone for the rest of the session.

`entrance.ts` checks for `[data-preloader]` at module load. If it's not in the DOM (i.e., already removed, or you deleted the component), the gate starts in a resolved state and `awaitEntrance(...)` returns immediately.

## The entrance gate

```ts
import { awaitEntrance, releaseEntrance } from "@/scripts/core";

await awaitEntrance(0.2);   // wait for preloader, then 200ms
releaseEntrance();           // resolves the gate (idempotent)
```

The delay argument **only applies when the gate was actually pending** (cold load with preloader present). On internal Swup nav the gate is already resolved, so `awaitEntrance(N)` returns synchronously regardless of N.

## How reveals integrate

`text-reveal` and `image-reveal` both read `data-entrance-delay` from their element and `await awaitEntrance(delay)` before animating.

```html
<h1  data-text-reveal="lines"  data-entrance-delay="0">Hero</h1>
<p   data-text-reveal="lines"  data-entrance-delay="0.15">Subline</p>
<img data-image-reveal         data-entrance-delay="0.3" />
```

- **Cold load** — element waits for the preloader's `releaseEntrance()` call, then waits the per-element delay, then runs its reveal.
- **Internal nav** — element ignores the delay and animates on its normal trigger (mount or `ScrollTrigger`).

For text-reveal, `data-entrance-delay` and the existing `data-delay` (gsap.from delay) are independent and stack: the entrance-delay gates the whole setup, the gsap delay further offsets the tween.

## Tuning when reveals start

The single knob is **when** `releaseEntrance()` fires inside the preloader timeline.

Default in `src/scripts/services/preloader.ts`:

```ts
tl.to(root, {
    clipPath: "inset(100% 0 0 0)",
    duration: 1.5,
    ease: "expo.inOut",
}).call(releaseEntrance, undefined, "-=1.25");
```

The `.call(...)` fires `releaseEntrance` 1.25s before the timeline ends — reveals begin animating *under* the closing curtain. Move it to taste:

| Goal | Where to fire |
|---|---|
| Reveals overlap with panel exit (current) | `tl.call(releaseEntrance, undefined, "-=1.25")` |
| Reveals start exactly when the panel begins exiting | `onStart: releaseEntrance` on the clip-path tween |
| Reveals start after panel is fully gone | drop the `.call(...)` — `finish()` (timeline `onComplete`) releases the gate |
| Reveals start during the words-out tween | attach `onStart: releaseEntrance` to the words-out tween |

`releaseEntrance()` is guarded by an `isPending` flag, so calling it more than once is safe.

## Reduced motion

The service short-circuits via `$mediaStatus.get().isReducedMotion` (from `@/stores/device-status`). Panel removes immediately, gate releases, reveals fire on their normal triggers without staging.

The same store also gates `image-reveal` and `hero-block`. **Never call `matchMedia("(prefers-reduced-motion: reduce)")` directly** — the store is the single source of truth and updates live if the OS preference flips during a session.

## Customizing the panel

`<Preloader />` takes a `label` prop, a `<slot>`, or both:

```astro
<Preloader label="My Studio" />

<Preloader>
    <YourLogo />
</Preloader>
```

Restyle via the scoped `<style>` block in `preloader.astro`. The structure is `[data-preloader] > [data-preloader-label]`.

## Removing the preloader

Three deletions:

1. Drop `<Preloader />` from `src/components/layout/base.astro`.
2. Remove the `Preloader` export from `src/components/layout/index.ts`.
3. Delete `src/components/layout/preloader.astro` and `src/scripts/services/preloader.ts`.

You don't need to update the reveal behaviors. With no `[data-preloader]` in the DOM, `awaitEntrance` resolves synchronously and reveals fire as if the gate didn't exist.

## Why the gate is needed at all

Behaviors mount on `page:enter`, **before** `app:ready` fires. The preloader service is `app`-scoped, so it runs after behaviors have already mounted. Without a gate, text/image reveals would start animating while the preloader still covers the screen — wasted choreography. The gate lets behaviors register and prepare synchronously, but defers the actual `gsap.from`/depixelation until the preloader hands off.

## Common pitfalls

- **Mounting the preloader inside `<main id="swup">`.** It would re-render on every nav. Keep it outside the swup container.
- **Calling `releaseEntrance()` from anywhere except the preloader service.** Defeats the gate.
- **Calling `matchMedia` directly in new code.** Use `$mediaStatus.get().isReducedMotion`. See [stores.md](stores.md).
- **Forgetting that `data-entrance-delay` only applies on cold load.** It's a staging delay relative to preloader release, not a generic animation delay. Use `data-delay` for that.
