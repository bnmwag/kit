import gsap from "gsap";

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

	const onMouseMove = (event: MouseEvent) => {
		const ratio = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
		xTo(ratio * maxTravel);
	};

	measure();
	window.addEventListener("resize", measure);
	window.addEventListener("mousemove", onMouseMove);

	return () => {
		window.removeEventListener("resize", measure);
		window.removeEventListener("mousemove", onMouseMove);
		gsap.killTweensOf(image);
		gsap.set(image, { clearProps: "transform" });
	};
};
