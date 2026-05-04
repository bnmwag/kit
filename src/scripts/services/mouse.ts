import { defineService } from "@/scripts/core";
import { normalize, roundToDecimals } from "@/scripts/utils/maths";
import { $mediaStatus } from "@/stores/device-status";
import { $mouse, $smoothMouse } from "@/stores/mouse";
import { $screen } from "@/stores/screen";

const STOP_EPSILON = 0.01;

defineService({
    name: "mouse",
    scope: "app",
    setup() {
        if ($mediaStatus.get().isTouchScreen) return;

        let raf: number | null = null;

        const onMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const { width, height } = $screen.get();

            $mouse.set({
                x: clientX,
                y: clientY,
                normalizedX: normalize(0, width, clientX),
                normalizedY: normalize(0, height, clientY),
            });

            if (raf === null) raf = requestAnimationFrame(tick);
        };

        const tick = () => {
            const { x, y } = $mouse.get();
            const current = $smoothMouse.get();
            const { smoothX, smoothY, lerp } = current;

            const nextX = smoothX + (x - smoothX) * lerp;
            const nextY = smoothY + (y - smoothY) * lerp;

            const settled =
                Math.abs(nextX - x) < STOP_EPSILON &&
                Math.abs(nextY - y) < STOP_EPSILON;

            const { width, height } = $screen.get();

            $smoothMouse.set({
                ...current,
                smoothX: roundToDecimals(nextX, 3),
                smoothY: roundToDecimals(nextY, 3),
                smoothNormalizedX: roundToDecimals(normalize(0, width, nextX), 6),
                smoothNormalizedY: roundToDecimals(normalize(0, height, nextY), 6),
            });

            if (settled) {
                raf = null;
                return;
            }

            raf = requestAnimationFrame(tick);
        };

        window.addEventListener("mousemove", onMouseMove, { passive: true });

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            if (raf !== null) cancelAnimationFrame(raf);
            raf = null;
        };
    },
});
