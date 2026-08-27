import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

	// `en` is a REGISTERED locale with no catalogue yet — routing.ts keeps it
	// registered on purpose, so that authoring messages/en.json is the only work
	// an English build needs. Until that file exists the dynamic import throws
	// and every /en request 500s, which is a worse failure than serving the
	// canonical Arabic. Fall back, and say which locale actually rendered so a
	// half-translated build cannot masquerade as a finished one.
	let messages: Record<string, unknown>;
	let resolved = locale;
	try {
		messages = (await import(`../messages/${locale}.json`)).default;
	} catch {
		messages = (await import(`../messages/${routing.defaultLocale}.json`)).default;
		resolved = routing.defaultLocale;
	}

	return { locale: resolved, messages };
});
