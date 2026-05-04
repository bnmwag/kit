import { defineBehavior } from "@/scripts/core";

defineBehavior({
    name: "hero-block",
    selector: "[data-hero-block]",
    lazy: () => import("./hero-block.impl"),
});
