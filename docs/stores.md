# Stores

Client-side state lives in `src/stores/` as nanostores atoms or maps. Always import from the store module — never duplicate the listeners.

## What's there

| Store | Type | Source | Notes |
|---|---|---|---|
| `$mouse` | `map<MouseState>` | `stores/mouse.ts` | Raw cursor position. Hydrated from localStorage. |
| `$smoothMouse` | `map<SmoothMouseState>` | `stores/mouse.ts` | Lerped follow of `$mouse`. RAF loop pauses when idle. |
| `$screen` | `map<ScreenValues>` | `stores/screen.ts` | `innerWidth`/`innerHeight` updated on `resize`. |
| `$screenDebounce` | `map<ScreenValues>` | `stores/screen.ts` | Same, debounced 200ms. |
| `$scroll` | varies | `stores/scroll.ts` | Locomotive scroll position bridge. |
| `$breakpoints` | `map<Breakpoints>` | `stores/device-status.ts` | CSS custom-property breakpoints, read once. |
| `$mediaQueries` | `map<MediaQueries>` | `stores/device-status.ts` | Reduced-motion, touch, touch-or-small. |
| `$consent` | `atom<IConsentState>` | `stores/consent.ts` | `{ ready, analytics }`. Updated by `services/consent.ts`. |

## Module-load side effects

Several store files attach `window` listeners at module load (`mousemove`, `resize`, etc.). They are **browser-only** — never imported in SSR contexts. The chain that keeps them client-side is:

```
base.astro <script> → app.ts → import.meta.glob("./services/...") → store imports
```

Astro pages render with `window` undefined, but the script tag executes in the browser. If you need a store value during SSR, you can't — model it as a prop or do the work client-side.

## The persistence pattern

`$mouse` is the reference example for persistent stores.

- On import, `readPersisted()` pulls `{normalizedX, normalizedY}` from `localStorage["kit:mouse"]`.
- Initial values fall back to `0.5, 0.5` (screen center) when nothing is stored.
- Absolute `x`, `y` are derived from current `$screen.value.width/height` — surviving across browser resizes.
- On every `mousemove`, a `ts-debounce`-throttled `persist()` writes the latest normalized coords back. 250ms throttle so we never hammer storage.
- All `localStorage` access is `try/catch`-guarded — disabled storage / quota errors are non-fatal.

When you add a new persistent store:

1. Persist **dimensionless / normalized** values, not pixels — they survive screen-size changes.
2. Throttle writes via `ts-debounce`. Never write per-event.
3. Wrap reads + writes in `try/catch`. Treat storage as best-effort.
4. Hydrate at module top-level, fall back to a sensible default. The atom should never start in an "unknown" state.

## Subscribing from a behavior

Behaviors should subscribe to a store inside `mount()` and unsubscribe in cleanup:

```ts
import { $mouse } from "@/stores/mouse";

export const mount = (el: HTMLElement) => {
    const unsubscribe = $mouse.subscribe((value) => {
        // value.normalizedX is 0..1
    });
    return () => {
        unsubscribe();
    };
};
```

Nanostores `subscribe` fires immediately with the current value, then on each update. Use that for initial render — no separate "initial set" call needed.

If the first emit must be instant and subsequent ones tweened (typical for cursor-driven motion), gate with a flag:

```ts
let initialized = false;
const unsubscribe = $mouse.subscribe((value) => {
    if (!initialized) {
        gsap.set(el, { x: value.normalizedX * range });
        initialized = true;
        return;
    }
    xTo(value.normalizedX * range);
});
```

## When to add a new store vs. local state

- **Use a store** when 2+ unrelated parts of the app care about the same state, or when the value should outlive a page transition.
- **Use local state** (closures inside `mount`) when only one element needs it.

If you find yourself passing a value through three layers of components, that's a store.

## Don't

- Don't mutate store values directly — `setKey` / `set` only.
- Don't subscribe outside `mount()` / `setup()`. You'll leak listeners across page transitions.
- Don't persist absolute pixel positions. Future-you will resize the window and stare at a broken cursor.
- Don't write a custom event-bus. The kernel's `emit` / `on` exists for lifecycle events; user state goes in stores.
