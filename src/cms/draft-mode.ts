import type { AstroCookies } from "astro";
import { perspectiveCookieName } from "@sanity/preview-url-secret/constants";

export const getDraftModeProps = (cookies: AstroCookies) => ({
	perspectiveCookie: cookies.get(perspectiveCookieName)?.value ?? undefined,
});

export const isDraftModeActive = (cookies: AstroCookies): boolean =>
	cookies.has(perspectiveCookieName);
