import LocomotiveScroll, {
    type ILenisScrollToOptions,
    type lenisTargetScrollTo,
} from "locomotive-scroll";

import { defineService } from "@/scripts/core";
import { $scroll } from "@/stores/scroll";

let instance: LocomotiveScroll | undefined;

defineService({
    name: "scroll",
    scope: "page",
    setup() {
        instance = new LocomotiveScroll({
            scrollCallback({ scroll, limit, velocity, direction, progress }) {
                $scroll.set({ scroll, limit, velocity, direction, progress });
            },
        });
        return () => {
            instance?.destroy();
            instance = undefined;
        };
    },
});

export const Scroll = {
    start: () => instance?.start(),
    stop: () => instance?.stop(),
    scrollTo: (target: lenisTargetScrollTo, options?: ILenisScrollToOptions) =>
        instance?.scrollTo(target, options),
    addElements: (container: HTMLElement) =>
        instance?.addScrollElements(container),
    removeElements: (container: HTMLElement) =>
        instance?.removeScrollElements(container),
};
