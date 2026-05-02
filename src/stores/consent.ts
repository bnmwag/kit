import { atom } from "nanostores";

export interface IConsentState {
    ready: boolean;
    analytics: boolean;
}

export const $consent = atom<IConsentState>({
    ready: false,
    analytics: false,
});

export const hasAnalyticsConsent = (): boolean => $consent.get().analytics;
