import { map } from "nanostores";

export type MouseState = {
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
};

export type SmoothMouseState = {
    smoothX: number;
    smoothY: number;
    smoothNormalizedX: number;
    smoothNormalizedY: number;
    lerp: number;
};

const initialX = typeof window === "undefined" ? 0 : window.innerWidth / 2;
const initialY = typeof window === "undefined" ? 0 : window.innerHeight / 2;

export const $mouse = map<MouseState>({
    x: initialX,
    y: initialY,
    normalizedX: 0.5,
    normalizedY: 0.5,
});

export const $smoothMouse = map<SmoothMouseState>({
    smoothX: initialX,
    smoothY: initialY,
    smoothNormalizedX: 0.5,
    smoothNormalizedY: 0.5,
    lerp: 0.08,
});
