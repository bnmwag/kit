import SwupHeadPlugin from "@swup/head-plugin";
import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupScriptsPlugin from "@swup/scripts-plugin";
import Swup from "swup";

import { Scroll } from "@/scripts/scroll";
import { toDash } from "@/scripts/utils/string";

export class Transitions {
	static readonly READY_CLASS = "is-ready";
	static readonly TRANSITION_CLASS = "is-transitioning";

	private onVisitStartBind: any;
	private beforeContentReplaceBind: any;
	private onContentReplaceBind: any;
	private onAnimationInEndBind: any;
	private onAnimationOutStartBind: any;

	private swup: Swup | undefined;

	constructor() {
		this.onVisitStartBind = this.onVisitStart.bind(this);
		this.beforeContentReplaceBind = this.beforeContentReplace.bind(this);
		this.onContentReplaceBind = this.onContentReplace.bind(this);
		this.onAnimationInEndBind = this.onAnimationInEnd.bind(this);
		this.onAnimationOutStartBind = this.onAnimationOutStart.bind(this);
	}

	init() {
		this.initSwup();

		requestAnimationFrame(() => {
			document.documentElement.classList.add(Transitions.READY_CLASS);
		});
	}

	destroy() {
		this.swup?.destroy();
	}

	initSwup() {
		this.swup = new Swup({
			animateHistoryBrowsing: true,
			plugins: [
				new SwupHeadPlugin({
					persistAssets: true,
					awaitAssets: true,
				}),
				new SwupPreloadPlugin({
					preloadHoveredLinks: true,
					preloadInitialPage: !import.meta.env.DEV,
				}),
				new SwupScriptsPlugin(),
			],
		});

		this.swup.hooks.on("visit:start", this.onVisitStartBind);
		this.swup.hooks.before("content:replace", this.beforeContentReplaceBind);
		this.swup.hooks.on("content:replace", this.onContentReplaceBind);
		this.swup.hooks.on("animation:in:end", this.onAnimationInEndBind);
		this.swup.hooks.on("animation:out:start", this.onAnimationOutStartBind);

		this.swup.hooks.on("fetch:error", (e) => {
			console.log("fetch:error:", e);
		});
		this.swup.hooks.on("fetch:timeout", (e) => {
			console.log("fetch:timeout:", e);
		});
	}

	updateDocumentAttributes(visit: VisitType) {
		if (visit.fragmentVisit) return;

		const parser = new DOMParser();
		const nextDOM = parser.parseFromString(visit.to.html, "text/html");
		const newDataset = {
			...nextDOM.querySelector("html")?.dataset,
		};

		for (const [key, val] of Object.entries(newDataset)) {
			document.documentElement.setAttribute(`data-${toDash(key)}`, val ?? "");
		}
	}

	onVisitStart() {
		document.documentElement.classList.add(Transitions.TRANSITION_CLASS);
		document.documentElement.classList.remove(Transitions.READY_CLASS);
	}

	beforeContentReplace() {
		Scroll?.destroy();
	}

	onContentReplace(visit: VisitType) {
		Scroll?.init();
		this.updateDocumentAttributes(visit);
	}

	onAnimationOutStart() {}

	onAnimationInEnd() {
		document.documentElement.classList.remove(Transitions.TRANSITION_CLASS);
		document.documentElement.classList.add(Transitions.READY_CLASS);
	}
}
