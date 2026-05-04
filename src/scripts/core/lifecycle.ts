import type { LifecycleEvent, LifecycleHandler } from "./types";

const handlers = new Map<LifecycleEvent, Set<LifecycleHandler>>();

export const on = (event: LifecycleEvent, handler: LifecycleHandler) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => {
        handlers.get(event)?.delete(handler);
    };
};

export const emit = async (event: LifecycleEvent) => {
    const set = handlers.get(event);
    if (!set) return;
    for (const handler of set) {
        try {
            await handler();
        } catch (error) {
            console.error(`[core] handler for "${event}" threw:`, error);
        }
    }
};
