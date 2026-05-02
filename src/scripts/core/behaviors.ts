import type { Cleanup, IBehaviorConfig } from "./types";

const behaviors: IBehaviorConfig[] = [];
const mounted = new Map<HTMLElement, Map<string, Cleanup>>();

let pageActive = false;

const resolveMount = async (
    config: IBehaviorConfig,
): Promise<(el: HTMLElement) => Cleanup | void> => {
    if ("mount" in config) return config.mount;
    const mod = await config.lazy();
    return mod.mount;
};

const mountBehavior = async (config: IBehaviorConfig) => {
    const elements = document.querySelectorAll<HTMLElement>(config.selector);
    if (elements.length === 0) return;

    let mount: (el: HTMLElement) => Cleanup | void;
    try {
        mount = await resolveMount(config);
    } catch (error) {
        console.error(`[behavior:${config.name}] failed to load:`, error);
        return;
    }

    for (const el of elements) {
        let map = mounted.get(el);
        if (!map) {
            map = new Map();
            mounted.set(el, map);
        }
        if (map.has(config.name)) continue;

        try {
            const cleanup = mount(el);
            map.set(config.name, typeof cleanup === "function" ? cleanup : noop);
        } catch (error) {
            console.error(`[behavior:${config.name}] mount threw:`, error);
        }
    }
};

const noop = () => {};

export const defineBehavior = (config: IBehaviorConfig): void => {
    behaviors.push(config);
    if (pageActive) void mountBehavior(config);
};

export const mountAll = async () => {
    pageActive = true;
    for (const config of behaviors) await mountBehavior(config);
};

export const unmountAll = () => {
    pageActive = false;
    for (const map of mounted.values()) {
        for (const cleanup of map.values()) {
            try {
                cleanup();
            } catch (error) {
                console.error("[behavior] cleanup threw:", error);
            }
        }
    }
    mounted.clear();
};
