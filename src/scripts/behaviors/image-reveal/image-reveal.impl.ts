import { awaitEntrance } from "@/scripts/core";

const STEPS = [4, 8, 16, 32, 64, 128, 256];
const STEP_MS = 60;

const readNumber = (value: string | undefined, fallback: number) => {
	if (value === undefined) return fallback;
	const parsed = Number.parseFloat(value);
	return Number.isNaN(parsed) ? fallback : parsed;
};

const wait = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, ms));

const imageReady = (img: HTMLImageElement) =>
	new Promise<void>((resolve, reject) => {
		if (img.complete && img.naturalWidth > 0) {
			resolve();
			return;
		}
		img.addEventListener("load", () => resolve(), { once: true });
		img.addEventListener("error", () => reject(new Error("image failed")), {
			once: true,
		});
	});

const drawPixelated = (
	ctx: CanvasRenderingContext2D,
	src: CanvasImageSource,
	width: number,
	height: number,
	step: number,
	naturalWidth: number,
	naturalHeight: number,
) => {
	const aspect = naturalWidth / naturalHeight;
	const smallW =
		aspect >= 1 ? step : Math.max(1, Math.round(step * aspect));
	const smallH =
		aspect >= 1 ? Math.max(1, Math.round(step / aspect)) : step;

	const tmp = document.createElement("canvas");
	tmp.width = smallW;
	tmp.height = smallH;
	const tmpCtx = tmp.getContext("2d");
	if (!tmpCtx) return;
	tmpCtx.imageSmoothingEnabled = true;
	tmpCtx.drawImage(src, 0, 0, smallW, smallH);

	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, width, height);
	ctx.drawImage(tmp, 0, 0, width, height);
};

export const mount = (el: HTMLElement) => {
	if (!(el instanceof HTMLImageElement)) return;
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

	const img = el;
	const parent = img.parentElement;
	if (!parent) return;

	let cancelled = false;

	const originalOpacity = img.style.opacity;
	const parentNeedsPosition =
		window.getComputedStyle(parent).position === "static";
	if (parentNeedsPosition) parent.style.position = "relative";

	img.style.opacity = "0";

	const canvas = document.createElement("canvas");
	canvas.style.position = "absolute";
	canvas.style.inset = "0";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.pointerEvents = "none";
	canvas.style.imageRendering = "pixelated";
	parent.appendChild(canvas);

	const cleanupOverlay = () => {
		canvas.remove();
		img.style.removeProperty("transition");
		if (parentNeedsPosition) parent.style.removeProperty("position");
	};

	const finish = (immediate = false) => {
		img.style.transition = "none";
		img.style.opacity = originalOpacity || "1";

		if (immediate) {
			cleanupOverlay();
			return;
		}

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (!cancelled) cleanupOverlay();
			});
		});
	};

	let inViewport = false;
	let resolveViewport: (() => void) | null = null;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && !inViewport) {
					inViewport = true;
					resolveViewport?.();
				}
			}
		},
		{ threshold: 0.1 },
	);
	observer.observe(img);

	const reveal = async () => {
		try {
			const source = new Image();
			source.crossOrigin = "anonymous";
			source.src = img.currentSrc || img.src;
			await imageReady(source);
			if (cancelled) return;

			await imageReady(img);
			if (cancelled) return;

			const w = img.clientWidth;
			const h = img.clientHeight;
			if (w === 0 || h === 0) {
				finish(true);
				return;
			}

			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				finish(true);
				return;
			}

			drawPixelated(
				ctx,
				source,
				w,
				h,
				STEPS[0],
				source.naturalWidth,
				source.naturalHeight,
			);

			if (!inViewport) {
				await new Promise<void>((resolve) => {
					resolveViewport = resolve;
				});
				if (cancelled) return;
			}

			const entranceDelay = readNumber(el.dataset.entranceDelay, 0);
			await awaitEntrance(entranceDelay);
			if (cancelled) return;

			for (let i = 1; i < STEPS.length; i++) {
				await wait(STEP_MS);
				if (cancelled) return;
				drawPixelated(
					ctx,
					source,
					w,
					h,
					STEPS[i],
					source.naturalWidth,
					source.naturalHeight,
				);
			}

			await wait(STEP_MS);
			if (cancelled) return;
			finish();
		} catch {
			finish(true);
		}
	};

	void reveal();

	return () => {
		cancelled = true;
		observer.disconnect();
		finish(true);
	};
};
