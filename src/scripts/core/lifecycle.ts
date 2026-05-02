import type { ILifecycleEvent, ILifecycleHandler } from "./types";

const handlers = new Map<ILifecycleEvent, Set<ILifecycleHandler>>();

export const on = (event: ILifecycleEvent, handler: ILifecycleHandler) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler);
    return () => {
        handlers.get(event)?.delete(handler);
    };
};

export const emit = async (event: ILifecycleEvent) => {
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
