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
                                "Necessary cookies keep this site working. Analytics cookies help us understand how it is used. You can change your choice at any time.",
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
                                        "These cookies are required for core site functionality and cannot be disabled.",
                                    linkedCategory: "necessary",
                                },
                                {
                                    title: "Analytics",
                                    description:
                                        "Anonymous traffic insights. Used to improve the site. No data is shared until you accept.",
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
