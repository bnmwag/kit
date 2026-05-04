import { defineService, releaseEntrance } from "@/scripts/core";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const READY_CLASS = "is-preloaded";

gsap.registerPlugin(SplitText);

defineService({
	name: "preloader",
	scope: "app",
	setup() {
		const root = document.querySelector<HTMLElement>("[data-preloader]");
		if (!root) {
			releaseEntrance();
			return;
		}

		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			root.remove();
			document.documentElement.classList.add(READY_CLASS);
		};

		if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
			finish();
			return;
		}

		const label = root.querySelector<HTMLElement>("[data-preloader-label]");
		const tl = gsap.timeline({ onComplete: finish });

		const split = new SplitText(label, { type: "words" });

		gsap.set(label, { opacity: 1 });

		if (split.words) {
			tl.fromTo(
				split.words,
				{ x: 16, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 0.5,
					ease: "expo.out",
					stagger: 0.05,
					delay: 0.5,
				},
			);

			tl.to(split.words, {
				x: -16,
				opacity: 0,
				duration: 1,
				ease: "expo.out",
				stagger: 0.05,
				delay: 0.5,
			});
		}

		tl.to(
			root,
			{
				clipPath: "inset(100% 0 0 0)",
				duration: 1.5,
				ease: "expo.inOut",
			},
			"-=1.25",
		).call(releaseEntrance, undefined, "-=1.25");
	},
});
