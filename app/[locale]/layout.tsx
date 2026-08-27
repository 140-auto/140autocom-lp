import type { Metadata } from "next";
import localFont from "next/font/local";
import { League_Spartan } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

const ibmPlexSansArabic = localFont({
	src: [
		{ path: "../../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.ttf", weight: "400", style: "normal" },
		{ path: "../../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.ttf", weight: "500", style: "normal" },
		{ path: "../../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.ttf", weight: "600", style: "normal" },
		{ path: "../../fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Bold.ttf", weight: "700", style: "normal" },
	],
	variable: "--font-ibm-plex-sans-arabic",
	display: "swap",
});

// lp-concepts §1.3: League Spartan carries English headlines and ALL figures.
const leagueSpartan = League_Spartan({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	variable: "--font-league-spartan",
	display: "swap",
});

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

// Board-review build: never indexed, never served to end users.
export const metadata: Metadata = {
	title: "140auto — LP concepts",
	robots: { index: false, follow: false, nocache: true },
};

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) notFound();
	setRequestLocale(locale);

	const dir = locale === "ar" ? "rtl" : "ltr";

	return (
		<html lang={locale} dir={dir} className={`${ibmPlexSansArabic.variable} ${leagueSpartan.variable}`}>
			<body>
				<NextIntlClientProvider>{children}</NextIntlClientProvider>
			</body>
		</html>
	);
}
