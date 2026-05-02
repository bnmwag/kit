import { defineBehavior } from "@/scripts/core";

defineBehavior({
	name: "image-reveal",
	selector: "img[data-image-reveal]",
	lazy: () => import("./image-reveal.impl"),
});
