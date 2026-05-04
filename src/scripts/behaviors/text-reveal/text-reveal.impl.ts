import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { awaitEntrance } from "@/scripts/core";

gsap.registerPlugin(SplitText, ScrollTrigger);

type SplitMode = "lines" | "words" | "chars";

interface IModeDefaults {
    duration: number;
    stagger: number;
    ease: string;
}

const CONFIG: Record<SplitMode, IModeDefaults> & {
    scrollStart: string;
    scrubStart: string;
    scrubEnd: string;
    once: boolean;
} = {
    lines: { duration: 1, stagger: 0.06, ease: "expo.out" },
    words: { duration: 1, stagger: 0.03, ease: "expo.out" },
    chars: { duration: 0.6, stagger: 0.01, ease: "expo.out" },
    scrollStart: "top 72%",
    scrubStart: "top 80%",
    scrubEnd: "top 20%",
    once: true,
};

const isSplitMode = (value: string | null): value is SplitMode =>
    value === "lines" || value === "words" || value === "chars";

const splitOptions = (mode: SplitMode) => {
    switch (mode) {
        case "lines":
            return {
                type: "lines",
                mask: "lines" as const,
                linesClass: "line",
            };
        case "words":
            return {
                type: "words, lines",
                mask: "words" as const,
                wordsClass: "word",
                linesClass: "line",
            };
        case "chars":
            return {
                type: "chars, words, lines",
                mask: "chars" as const,
                charsClass: "char",
                wordsClass: "word",
                linesClass: "line",
            };
    }
};

const readNumber = (value: string | undefined, fallback: number) => {
    if (value === undefined) return fallback;
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
};

export const mount = (el: HTMLElement) => {
    const mode = el.getAttribute("data-text-reveal");
    if (!isSplitMode(mode)) return;

    const defaults = CONFIG[mode];
    const options = splitOptions(mode);
    const isManual = el.hasAttribute("data-manual");

    if (isManual) {
        const split = SplitText.create(el, { ...options, autoSplit: true });
        return () => {
            split.revert();
        };
    }

    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";
    const once = el.hasAttribute("data-once")
        ? el.getAttribute("data-once") !== "false"
        : CONFIG.once;
    const entranceDelay = readNumber(el.dataset.entranceDelay, 0);

    let cancelled = false;
    let split: SplitText | null = null;

    void awaitEntrance(entranceDelay).then(() => {
        if (cancelled) return;

        el.style.visibility = "visible";

        split = SplitText.create(el, {
            ...options,
            autoSplit: true,
            onSplit(instance) {
                const duration = readNumber(
                    el.dataset.duration,
                    defaults.duration,
                );
                const stagger = readNumber(
                    el.dataset.stagger,
                    defaults.stagger,
                );
                const delay = readNumber(el.dataset.delay, 0);
                const ease = el.dataset.ease || defaults.ease;

                const targets = instance[mode];
                const yPercent = el.dataset.from === "top" ? -110 : 110;

                const vars: gsap.TweenVars = {
                    yPercent,
                    duration,
                    stagger,
                    delay,
                    immediateRender: true,
                    ease,
                };

                if (useScrub) {
                    vars.scrollTrigger = {
                        trigger: el,
                        start: CONFIG.scrubStart,
                        end: CONFIG.scrubEnd,
                        scrub: true,
                        ...(once && {
                            onLeave: (self: ScrollTrigger) => self.kill(false),
                        }),
                    };
                } else if (useScroll) {
                    const start = scrollMode || CONFIG.scrollStart;
                    vars.scrollTrigger = {
                        trigger: el,
                        start: `clamp(${start})`,
                        ...(once
                            ? { once: true }
                            : { toggleActions: "play none none reverse" }),
                    };
                }

                return gsap.from(targets, vars);
            },
        });
    });

    return () => {
        cancelled = true;
        split?.revert();
    };
};
