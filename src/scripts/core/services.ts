import type { Cleanup, IServiceConfig } from "./types";

const services: IServiceConfig[] = [];
const pageCleanups: Cleanup[] = [];
const appCleanups: Cleanup[] = [];

let appReady = false;
let pageActive = false;

const startService = async (svc: IServiceConfig, bucket: Cleanup[]) => {
    try {
        const cleanup = await svc.setup();
        if (typeof cleanup === "function") bucket.push(cleanup);
    } catch (error) {
        console.error(`[service:${svc.name}] setup threw:`, error);
    }
};

export const defineService = (config: IServiceConfig): void => {
    services.push(config);
    if (config.scope === "app" && appReady) {
        void startService(config, appCleanups);
    } else if (config.scope === "page" && pageActive) {
        void startService(config, pageCleanups);
    }
};

export const startPageServices = async () => {
    pageActive = true;
    for (const svc of services) {
        if (svc.scope === "page") await startService(svc, pageCleanups);
    }
};

export const stopPageServices = () => {
    pageActive = false;
    for (const cleanup of pageCleanups) {
        try {
            cleanup();
        } catch (error) {
            console.error("[service] cleanup threw:", error);
        }
    }
    pageCleanups.length = 0;
};

export const startAppServices = async () => {
    appReady = true;
    for (const svc of services) {
        if (svc.scope === "app") await startService(svc, appCleanups);
    }
};
