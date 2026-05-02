import SwupHeadPlugin from "@swup/head-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import Swup from "swup";

import { defineService, emit } from "@/scripts/core";
import { toDash } from "@/scripts/utils/string";

const READY_CLASS = "is-ready";
const TRANSITIONING_CLASS = "is-transitioning";

const parseMs = (value: string) => {
    const first = value.split(",")[0]?.trim() ?? "0";
    if (first.endsWith("ms")) return Number.parseFloat(first);
    if (first.endsWith("s")) return Number.parseFloat(first) * 1000;
    return Number.parseFloat(first);
};

const awaitTransition = async () => {
    const el = document.querySelector<HTMLElement>("[data-swup-transition]");
    if (!el) return;

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const styles = getComputedStyle(el);
    const total =
        parseMs(styles.transitionDuration) + parseMs(styles.transitionDelay);
    if (total <= 0) return;

    await new Promise<void>((resolve) => {
        let resolved = false;
        const finish = () => {
            if (resolved) return;
            resolved = true;
            el.removeEventListener("transitionend", onEnd);
            resolve();
        };
        const onEnd = (event: TransitionEvent) => {
            if (event.target === el && event.propertyName === "opacity") {
                finish();
            }
        };
        el.addEventListener("transitionend", onEnd);
        window.setTimeout(finish, total + 50);
    });
};

interface IVisit {
    fragmentVisit?: unknown;
    to: { html?: string };
}

const updateDocumentAttributes = (visit: IVisit) => {
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
            animationSelector: false,
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

        swup.hooks.replace("animation:out:start", async () => {
            document.documentElement.classList.add("is-animating");
            await awaitTransition();
        });

        swup.hooks.replace("animation:in:start", async () => {
            document.documentElement.classList.remove("is-animating");
            await awaitTransition();
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
    },
});
