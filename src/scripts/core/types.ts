export type Cleanup = () => void;

export type LifecycleEvent = "app:ready" | "page:enter" | "page:leave";

export type LifecycleHandler = () => void | Promise<void>;

export interface IServiceConfig {
    name: string;
    scope: "app" | "page";
    setup: () => Cleanup | void | Promise<Cleanup | void>;
}

interface IBehaviorConfigBase {
    name: string;
    selector: string;
}

export interface IBehaviorConfigInline extends IBehaviorConfigBase {
    mount: (el: HTMLElement) => Cleanup | void;
}

export interface IBehaviorConfigLazy extends IBehaviorConfigBase {
    lazy: () => Promise<{
        mount: (el: HTMLElement) => Cleanup | void;
    }>;
}

export type IBehaviorConfig = IBehaviorConfigInline | IBehaviorConfigLazy;
