import { map } from "nanostores";

export type Breakpoints = {
    sm: string;
};

const isBrowser = typeof window !== "undefined";

const readBreakpoint = (name: string): string => {
    if (!isBrowser) return "";
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
};

export const $breakpoints = map<Breakpoints>({
    sm: readBreakpoint("--breakpoint-sm"),
});

export type MediaQueries = {
    reducedMotion: string;
    touchScreen: string;
    touchOrSmall: string;
};

export const $mediaQueries = map<MediaQueries>({
    reducedMotion: "(prefers-reduced-motion: reduce)",
    touchScreen: "(hover: none)",
    touchOrSmall: `(max-width: ${$breakpoints.get().sm}), (hover: none)`,
});

export type MediaStatus = {
    isReducedMotion: boolean;
    isTouchScreen: boolean;
    isTouchOrSmall: boolean;
};

const toStatusKey = (key: keyof MediaQueries): keyof MediaStatus =>
    `is${key[0].toUpperCase()}${key.slice(1)}` as keyof MediaStatus;

export const $mediaStatus = map<MediaStatus>({
    isReducedMotion: false,
    isTouchScreen: false,
    isTouchOrSmall: false,
});

if (isBrowser) {
    const entries = Object.entries($mediaQueries.get()) as Array<
        [keyof MediaQueries, string]
    >;

    for (const [key, query] of entries) {
        const list = window.matchMedia(query);
        const statusKey = toStatusKey(key);
        $mediaStatus.setKey(statusKey, list.matches);
        list.addEventListener("change", () => {
            $mediaStatus.setKey(statusKey, list.matches);
        });
    }
}
