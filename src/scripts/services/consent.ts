import {
    acceptedCategory,
    run,
    showPreferences,
} from "vanilla-cookieconsent";

import { defineService } from "@/scripts/core";
import { $consent } from "@/stores/consent";

declare global {
    interface Window {
        showCookiePreferences?: () => void;
    }
}

const REVISION = 1;

const sync = () => {
    $consent.set({
        ready: true,
        analytics: acceptedCategory("analytics"),
    });
};

defineService({
    name: "consent",
    scope: "app",
    async setup() {
        await run({
            revision: REVISION,
            guiOptions: {
                consentModal: {
                    layout: "box",
                    position: "bottom right",
                    flipButtons: false,
                    equalWeightButtons: true,
                },
                preferencesModal: {
                    layout: "box",
                    position: "right",
                    flipButtons: false,
                    equalWeightButtons: true,
                },
            },
            categories: {
                necessary: {
                    enabled: true,
                    readOnly: true,
                },
                analytics: {
                    enabled: false,
                    readOnly: false,
                    autoClear: {
                        cookies: [{ name: /^_vercel/ }],
                    },
                },
            },
            language: {
                default: "en",
                translations: {
                    en: {
                        consentModal: {
                            title: "We use cookies",
                            description:
                                'We use a strictly necessary cookie to remember your choice. With your consent we also load anonymous analytics. See our <a href="/privacy" target="_blank" rel="noopener">privacy policy</a> and <a href="/cookies" target="_blank" rel="noopener">cookie policy</a>. You can change your choice at any time.',
                            acceptAllBtn: "Accept all",
                            acceptNecessaryBtn: "Reject all",
                            showPreferencesBtn: "Manage preferences",
                        },
                        preferencesModal: {
                            title: "Cookie preferences",
                            acceptAllBtn: "Accept all",
                            acceptNecessaryBtn: "Reject all",
                            savePreferencesBtn: "Save preferences",
                            closeIconLabel: "Close",
                            sections: [
                                {
                                    title: "Strictly necessary",
                                    description:
                                        "Required for core functionality and to remember your cookie choice. Cannot be disabled.",
                                    linkedCategory: "necessary",
                                    cookieTable: {
                                        headers: {
                                            name: "Name",
                                            domain: "Domain",
                                            expiration: "Expiration",
                                            description: "Description",
                                        },
                                        body: [
                                            {
                                                name: "cc_cookie",
                                                domain: "this site",
                                                expiration: "182 days",
                                                description:
                                                    "Stores your cookie consent preferences.",
                                            },
                                        ],
                                    },
                                },
                                {
                                    title: "Analytics",
                                    description:
                                        'Vercel Web Analytics. Cookieless: no identifiers are stored on your device. Each request is anonymized via a daily-rotated hash. Aggregated data is processed by Vercel Inc. (US) — see our <a href="/privacy" target="_blank" rel="noopener">privacy policy</a> for the data transfer basis.',
                                    linkedCategory: "analytics",
                                },
                            ],
                        },
                    },
                },
            },
            onFirstConsent: sync,
            onConsent: sync,
            onChange: sync,
        });

        window.showCookiePreferences = () => showPreferences();

        return () => {
            delete window.showCookiePreferences;
        };
    },
});
