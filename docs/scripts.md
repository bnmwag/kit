# Scripts

Two primitives. That's the whole user-facing API:

```ts
import { defineService, defineBehavior } from "@/scripts/core";
```

Everything else (lifecycle, swup, locomotive, GSAP) is built on top of these.

## When to use which

| Need | Use |
|---|---|
| A singleton that lives once per app or once per page | **Service** |
| Something that attaches to every element matching a selector | **Behavior** |

Concretely:

- Locomotive scroll → **service** (`scope: "page"` — recreate per page so it picks up new DOM)
- Swup itself → **service** (`scope: "app"` — outlives all page transitions)
- Grid-helper overlay (dev only) → **service** (`scope: "app"`)
- `data-text-reveal` global animation → **behavior** (one instance per matching element)
- Hero block's mouse parallax → **behavior** (block-scoped, lazy-loaded)

If you find yourself writing `document.querySelectorAll(...)` in a service, you probably want a behavior. If you find yourself singleton-checking inside a behavior's `mount`, you probably want a service.

## Services

### Add a global service

Drop a file in `src/scripts/services/`. The kernel auto-imports everything in there via `import.meta.glob`.

```ts
// src/scripts/services/analytics.ts
import { defineService } from "@/scripts/core";

defineService({
    name: "analytics",
    scope: "app",
    setup() {
        const script = document.createElement("script");
        script.src = "https://example.com/analytics.js";
        script.async = true;
        document.head.appendChild(script);

        return () => {
            script.remove();
        };
    },
});
```

That's it. No registration step, no editing `app.ts`.

### Service config

```ts
interface IServiceConfig {
    name: string;                       // for error logging
    scope: "app" | "page";              // when to start
    setup: () => Cleanup | void | Promise<Cleanup | void>;
}

type Cleanup = () => void;
```

- **`scope: "app"`** — `setup` runs once on `app:ready`. Cleanup never runs (lives until page reload).
- **`scope: "page"`** — `setup` runs on every `page:enter` (initial load + after each swup transition). Cleanup runs on `page:leave`.

### Service order

Services start in registration order on `page:enter`, before behaviors mount. They tear down in reverse on `page:leave`, after behaviors unmount. So a behavior can safely call into a service during its own `mount` and `cleanup`.

## Behaviors

### Add a global behavior

Drop a folder in `src/scripts/behaviors/<name>/`. The folder convention separates the eager registration stub from the lazy implementation chunk.

```ts
// src/scripts/behaviors/cursor-magnet/index.ts
import { defineBehavior } from "@/scripts/core";

import "./cursor-magnet.css";

defineBehavior({
    name: "cursor-magnet",
    selector: "[data-cursor-magnet]",
    lazy: () => import("./cursor-magnet.impl"),
});
```

```ts
// src/scripts/behaviors/cursor-magnet/cursor-magnet.impl.ts
import gsap from "gsap";

export const mount = (el: HTMLElement) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3.out" });

    const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        xTo((event.clientX - cx) * 0.3);
        yTo((event.clientY - cy) * 0.3);
    };

    window.addEventListener("mousemove", onMove);

    return () => {
        window.removeEventListener("mousemove", onMove);
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "transform" });
    };
};
```

Use it from any markup:

```astro
<button data-cursor-magnet>Hover me</button>
```

### Behavior config — inline vs lazy

```ts
// inline — ships in whatever bundle imported the index file
defineBehavior({
    name: "...",
    selector: "...",
    mount(el) {
        return () => { /* cleanup */ };
    },
});

// lazy — registration stub ships eagerly; impl is a separate Vite chunk fetched on first match
defineBehavior({
    name: "...",
    selector: "...",
    lazy: () => import("./<name>.impl"),
});
```

Rule of thumb: behaviors with non-trivial dependencies (GSAP plugins, heavy libraries) should be lazy. Tiny pure-DOM behaviors can be inline.

CSS imports go in the **eager** index file (so styles ship with every page that might need them — no FOUC). The lazy impl handles JS only.

### Block-scoped behaviors

A behavior that only makes sense for one block keeps its **impl** colocated with the block, but **registration must happen from `src/scripts/behaviors/`** — the registration stub is loaded once via the eager glob in `app.ts`, which lives outside the swup container.

```ts
// src/scripts/behaviors/hero-block.ts          ← registration (eager)
import { defineBehavior } from "@/scripts/core";

defineBehavior({
    name: "hero-block",
    selector: "[data-hero-block]",
    lazy: () => import("@/blocks/hero-block/hero-block.impl"),
});
```

```ts
// src/blocks/hero-block/hero-block.impl.ts    ← implementation (lazy chunk)
import gsap from "gsap";

export const mount = (el: HTMLElement) => {
    // ...
    return () => { /* cleanup */ };
};
```

The block's `.astro` file should NOT contain a `<script>` tag for registration. Astro inlines those inside the swup container; when swup swaps body content via `innerHTML`, browsers do not execute script tags inserted that way, so the behavior never registers on cross-page transitions.

The lazy import still gives you per-route splitting: the impl chunk is only fetched when the kernel sees a matching `[data-hero-block]` element on a `page:enter`.

### Mount semantics

The kernel scans for each behavior's selector on `page:enter` and calls `mount(el)` per match. The returned cleanup is tracked per-element. On `page:leave`, every cleanup fires before services tear down.

If a behavior registers AFTER `page:enter` has fired (e.g., a lazy chunk loaded mid-session), the kernel mounts it immediately against current DOM. If it registers between `page:leave` and the next `page:enter`, the kernel queues it.

## The CSS contract

If your behavior needs hidden-state CSS (e.g., `visibility: hidden` until JS runs), import the CSS from the **eager** index file, not the lazy impl. Otherwise the styles arrive late and you get a flash of unstyled content.

```ts
// src/scripts/behaviors/text-reveal/index.ts
import "./text-reveal.css";   // ← eager — ships globally
defineBehavior({
    name: "text-reveal",
    selector: "[data-text-reveal]",
    lazy: () => import("./text-reveal.impl"),  // ← only the JS is lazy
});
```

## Lifecycle events

Three events. The runner orchestrates them; user code rarely listens directly.

| Event | When |
|---|---|
| `app:ready` | Once, after the first `page:enter` and the `is-ready` class is set |
| `page:enter` | Initial load, then after every swup `content:replace` (with new scripts already loaded) |
| `page:leave` | Before swup replaces the page content |

If you genuinely need to react to one of these from user code, `on()` is exported from the kernel:

```ts
import { on } from "@/scripts/core";

on("app:ready", () => {
    /* runs once */
});
```

But 95% of the time, just write a service or behavior and let the kernel call you.

## Custom transition emitters

The kernel doesn't know swup exists. `services/transitions.ts` is the only file that imports swup and emits lifecycle events via `emit("page:enter")` / `emit("page:leave")`. You can swap swup for any other library (barba, plain history API, your own thing) by replacing that single file. As long as it emits the lifecycle events at the right times, every service and behavior keeps working.

## Common pitfalls

- **Forgetting to return cleanup.** A behavior that adds a `window.addEventListener` and never removes it leaks across page transitions. Always return cleanup; if there's nothing to clean, return `undefined` explicitly so future-you remembers to add cleanup when they add side effects.
- **Mutating shared state in a behavior `mount`.** If two elements match the same selector, `mount` runs twice. Stash any per-element state on the element itself (or in a `WeakMap` keyed by `el`).
- **CSS in the lazy impl.** Causes FOUC. Move it to the eager index.
- **Heavy work at module top-level.** The eager index runs on every page. Don't `gsap.registerPlugin(SplitText)` there — put it in the lazy impl. Same for any side-effectful initialization.
- **Block behaviors that don't lazy-load GSAP.** Defeats the per-route splitting story. Always `lazy: () => import("./<block>.impl")` for non-trivial block scripts.

## Where to go next

- [blocks.md](blocks.md) — page-builder blocks
- [architecture.md](architecture.md) — how the pieces fit together
