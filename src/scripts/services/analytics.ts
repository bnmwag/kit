import { defineService } from "@/scripts/core";
import { $consent, hasAnalyticsConsent } from "@/stores/consent";

interface IAnalyticsProvider {
    load: () => Promise<void> | void;
}

const vercelAnalytics: IAnalyticsProvider = {
    async load() {
        const { inject } = await import("@vercel/analytics");
        inject({
            beforeSend: (event) => (hasAnalyticsConsent() ? event : null),
        });
    },
};

const provider: IAnalyticsProvider = vercelAnalytics;

let loaded = false;

defineService({
    name: "analytics",
    scope: "app",
    setup() {
        return $consent.subscribe((state) => {
            if (!state.ready || !state.analytics || loaded) return;
            loaded = true;
            void provider.load();
        });
    },
});
