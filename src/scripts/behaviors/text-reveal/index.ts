import { defineBehavior } from "@/scripts/core";

import "./text-reveal.css";

defineBehavior({
    name: "text-reveal",
    selector: "[data-text-reveal]",
    lazy: () => import("./text-reveal.impl"),
});
