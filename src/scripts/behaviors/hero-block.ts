import { defineBehavior } from "@/scripts/core";

defineBehavior({
    name: "hero-block",
    selector: "[data-hero-block]",
    lazy: () => import("@/blocks/hero-block/hero-block.impl"),
});
