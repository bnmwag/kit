import { map } from 'nanostores';
import { debounce } from 'ts-debounce';

import { $screen } from '@/stores/screen';
import { normalize, roundToDecimals } from '@/scripts/utils/maths';

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

const STORAGE_KEY = 'kit:mouse';

type PersistedMouse = {
    normalizedX: number;
    normalizedY: number;
};

const readPersisted = (): PersistedMouse | null => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.normalizedX === 'number' &&
            typeof parsed?.normalizedY === 'number'
        ) {
            return {
                normalizedX: parsed.normalizedX,
                normalizedY: parsed.normalizedY,
            };
        }
        return null;
    } catch {
        return null;
    }
};

const persisted = readPersisted();
const initialNormalizedX = persisted?.normalizedX ?? 0.5;
const initialNormalizedY = persisted?.normalizedY ?? 0.5;
const initialX = initialNormalizedX * $screen.value!.width;
const initialY = initialNormalizedY * $screen.value!.height;

export const $mouse = map<MouseState>({
    x: initialX,
    y: initialY,
    normalizedX: initialNormalizedX,
    normalizedY: initialNormalizedY,
});

export const $smoothMouse = map<SmoothMouseState>({
    smoothX: initialX,
    smoothY: initialY,
    smoothNormalizedX: initialNormalizedX,
    smoothNormalizedY: initialNormalizedY,
    lerp: 0.08,
});

const persist = debounce(() => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                normalizedX: $mouse.value!.normalizedX,
                normalizedY: $mouse.value!.normalizedY,
            }),
        );
    } catch {
        // storage may be disabled or full; ignore
    }
}, 250);

let isPlaying = false;
let RAF: null | any = null;

const onMouseMove = (event: MouseEvent): void => {
    const { clientX, clientY } = event;

    $mouse.setKey('x', clientX);
    $mouse.setKey('y', clientY);
    $mouse.setKey('normalizedX', normalize(0, $screen.value!.width, clientX));
    $mouse.setKey('normalizedY', normalize(0, $screen.value!.height, clientY));

    persist();
    play();
};

const onUpdate = (): void => {
    const { x, y } = $mouse.value!;
    const { smoothX, smoothY, lerp } = $smoothMouse.value!;

    const updatedSmoothX = smoothX + (x - smoothX) * lerp;
    const updatedSmoothY = smoothY + (y - smoothY) * lerp;

    const roundedSmoothX = updatedSmoothX;
    const roundedSmoothY = updatedSmoothY;
    const roundedSmoothNormalizedX = normalize(0, $screen.value!.width, updatedSmoothX);
    const roundedSmoothNormalizedY = normalize(0, $screen.value!.height, updatedSmoothY);

    if (hasMouseStopped(roundedSmoothX, roundedSmoothY) && isPlaying) {
        return pause();
    }

    $smoothMouse.setKey('smoothX', roundToDecimals(roundedSmoothX, 3));
    $smoothMouse.setKey('smoothY', roundToDecimals(roundedSmoothY, 3));
    $smoothMouse.setKey('smoothNormalizedX', roundToDecimals(roundedSmoothNormalizedX, 6));
    $smoothMouse.setKey('smoothNormalizedY', roundToDecimals(roundedSmoothNormalizedY, 6));

    RAF = requestAnimationFrame(onUpdate);
};

const play = (): void => {
    if (isPlaying || RAF) return;
    onUpdate();
    isPlaying = true;
};

const pause = (): void => {
    if (!isPlaying || !RAF) return;
    cancelAnimationFrame(RAF);
    RAF = null;
    isPlaying = false;
};

const hasMouseStopped = (smoothX: number, smoothY: number): boolean => {
    return smoothX + smoothY === $smoothMouse.value!.smoothX + $smoothMouse.value!.smoothY;
};

window.addEventListener('mousemove', onMouseMove);
