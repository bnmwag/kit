# Cookie Consent & Analytics

GDPR-compliant cookie banner via `vanilla-cookieconsent` v3. Analytics are **lazy-loaded only after consent**.

## How it's wired

```
src/scripts/services/
  consent.ts         boots vanilla-cookieconsent, syncs $consent store
  analytics.ts       subscribes to $consent, lazy-loads provider on grant

src/stores/consent.ts   { ready, analytics } atom

src/styles/cookie-consent.css
                     imports lib CSS + maps lib vars to theme tokens
```

The library renders its own DOM into `<body>` outside `<main id="swup">`, so the banner persists across page transitions naturally. The service is `app`-scope — it boots once on `app:ready` and stays.

## The blocking guarantee

Analytics scripts must not enter the page before consent. Two layers:

1. **Lazy import.** `analytics.ts` only calls `import("@vercel/analytics")` after `$consent.subscribe` reports `analytics: true`. Until then, no Vercel script tag exists in the DOM.
2. **`beforeSend` guard.** When `inject()` finally runs, it's wired with `beforeSend: (event) => hasAnalyticsConsent() ? event : null`. If consent is revoked mid-session, in-flight events get dropped at send time.

If you add another provider or move analytics elsewhere, **both layers must hold**. Returning the event regardless of consent in `beforeSend` re-introduces the bug.

## Adding or swapping the analytics provider

`analytics.ts` exports an `IAnalyticsProvider` interface:

```ts
interface IAnalyticsProvider {
    load: () => Promise<void> | void;
}
```

Default: `vercelAnalytics`. To swap to another provider (Plausible, Fathom, Umami, GA4, …):

1. Implement a new const matching the interface.
2. Lazy-import the provider package inside `load()` so it ships only post-consent.
3. Wire any `beforeSend`-equivalent guard that can be invalidated on revoke.
4. Replace `const provider: IAnalyticsProvider = vercelAnalytics;` with your new const.

For GA4 specifically: implement Google Consent Mode v2 (`gtag("consent", "default", { analytics_storage: "denied", ... })`) before injecting `gtag.js`. Do not load `gtag.js` until consent.

## Adding new categories

Default categories are `necessary` (read-only) and `analytics`. To add a third (e.g. `marketing`):

1. Add to the `categories` config in `consent.ts`.
2. Add a section in `language.translations.en.preferencesModal.sections`.
3. Extend `IConsentState` in `stores/consent.ts` with the new flag.
4. Update `sync()` to write the new flag from `acceptedCategory("marketing")`.
5. Bump `REVISION` in `consent.ts` so existing visitors get re-prompted.

## Reopening preferences

The lib supports a native attribute — drop it on any element:

```html
<button data-cc="show-preferencesModal">Cookie settings</button>
```

Or programmatically: `window.showCookiePreferences?.()`.

## Theming the banner

CSS overrides live in `src/styles/cookie-consent.css`. The lib exposes CSS custom properties (`--cc-bg`, `--cc-btn-primary-bg`, etc.) — they're mapped to project theme tokens (`var(--background)`, `var(--foreground)`, `var(--accent)`).

Don't fork the lib's HTML or CSS structure. Override variables only.

## Banner copy

In `src/scripts/services/consent.ts`, under `language.translations`. The current copy is intentionally placeholder for the kit. Production sites should:

- Replace placeholder text with controller-specific copy (lawyer-vetted).
- Link to a real `/privacy` page (the legal block exists; see `docs/blocks.md`).
- Update revision counter on any material change.

## Compliance notes

The implementation handles the **technical** requirements: blocking before consent, equal-weight buttons, opt-in, persistent reopening, audit-trail via the lib's localStorage cookie. It does **not** handle:

- Privacy policy text (your responsibility — write or seed via Studio).
- Imprint / Impressum (German DDG / Austrian ECG).
- DPA with your processors (Vercel: auto-incorporated for Pro+ via ToS).
- Per-jurisdiction tweaks (CCPA opt-out, etc.).

Don't claim the kit makes a project "GDPR compliant" — it makes the script-loading correct. Compliance is paperwork plus implementation, and only one half of that lives in this repo.
