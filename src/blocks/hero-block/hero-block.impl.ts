import gsap from "gsap";

import { $mouse } from "@/stores/mouse";

export const mount = (el: HTMLElement) => {
	const image = el.querySelector<HTMLElement>("[data-hero-block-image]");
	if (!image) return;

	const wrapper = image.parentElement;
	if (!wrapper) return;

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	let maxTravel = 0;

	const measure = () => {
		maxTravel = Math.max(0, wrapper.clientWidth - image.offsetWidth);
	};

	const xTo = gsap.quickTo(image, "x", {
		duration: 0.6,
		ease: "power4.out",
	});

	measure();

	let initialized = false;
	const unsubscribe = $mouse.subscribe((value) => {
		const x = value.normalizedX * maxTravel;
		if (!initialized) {
			gsap.set(image, { x });
			initialized = true;
			return;
		}
		xTo(x);
	});

	window.addEventListener("resize", measure);

	return () => {
		window.removeEventListener("resize", measure);
		unsubscribe();
		gsap.killTweensOf(image);
		gsap.set(image, { clearProps: "transform" });
	};
};
