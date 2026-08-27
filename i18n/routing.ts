import { defineRouting } from "next-intl/routing";

// Mirrors the production app (ADR 0009): Arabic is default and canonical,
// English secondary. "as-needed" means / is Arabic and /en is English.
// Only ar messages are authored for the board build; en is registered so
// adding messages/en.json is the only work an English build needs.
export const routing = defineRouting({
	locales: ["ar", "en"],
	defaultLocale: "ar",
	localePrefix: "as-needed",
	localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
