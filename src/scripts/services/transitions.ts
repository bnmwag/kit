import SwupHeadPlugin from "@swup/head-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import Swup from "swup";

import { defineService, emit } from "@/scripts/core";
import { toDash } from "@/scripts/utils/string";

const READY_CLASS = "is-ready";
const TRANSITIONING_CLASS = "is-transitioning";

type Visit = {
    fragmentVisit?: unknown;
    to: { html?: string };
};

const updateDocumentAttributes = (visit: Visit) => {
    if (visit.fragmentVisit || !visit.to.html) return;
    const parser = new DOMParser();
    const nextDOM = parser.parseFromString(visit.to.html, "text/html");
    const nextDataset = { ...nextDOM.querySelector("html")?.dataset };
    for (const [key, val] of Object.entries(nextDataset)) {
        document.documentElement.setAttribute(`data-${toDash(key)}`, val ?? "");
    }
};

defineService({
    name: "transitions",
    scope: "app",
    setup() {
        const swup = new Swup({
            animateHistoryBrowsing: true,
            animationSelector: "[data-swup-transition]",
            plugins: [
                new SwupHeadPlugin({
                    persistAssets: true,
                    awaitAssets: true,
                }),
                new SwupPreloadPlugin({
                    preloadHoveredLinks: true,
                    preloadInitialPage: !import.meta.env.DEV,
                }),
            ],
        });

        swup.hooks.on("visit:start", () => {
            document.documentElement.classList.add(TRANSITIONING_CLASS);
            document.documentElement.classList.remove(READY_CLASS);
        });

        swup.hooks.on("animation:out:start", () => {
            document.documentElement.classList.add("is-animating");
        });

        swup.hooks.on("animation:in:start", () => {
            document.documentElement.classList.remove("is-animating");
        });

        swup.hooks.before("content:replace", async () => {
            await emit("page:leave");
        });

        swup.hooks.on("content:replace", async (visit) => {
            updateDocumentAttributes(visit);
            await emit("page:enter");
        });

        swup.hooks.on("animation:in:end", () => {
            document.documentElement.classList.remove(TRANSITIONING_CLASS);
            document.documentElement.classList.add(READY_CLASS);
        });

        swup.hooks.on("fetch:error", (event) => {
            console.error("[transitions] fetch:error", event);
        });

        swup.hooks.on("fetch:timeout", (event) => {
            console.error("[transitions] fetch:timeout", event);
        });

        return () => swup.destroy();
    },
});
