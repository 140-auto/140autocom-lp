import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

/**
 * A holding page at `/`.
 *
 * Every CTA in both films points at `href="/"` because in production that is
 * the browse page. This build is the two landing-page concepts on their own,
 * with no browse page behind them, so without this route all five buttons —
 * the hero CTA, the docked CTA and both end-card CTAs — land on a 404. A
 * reviewer clicking the thing the whole page is built to make them click should
 * not be shown a stack trace.
 *
 * Deliberately a dead end and deliberately plain: it is a placeholder, not a
 * eleventh landing page, and it does not link on to /lp3 or /lp4 — those are
 * for the board, and this is where a stray click arrives.
 */
export const metadata: Metadata = {
	title: "140auto",
	robots: { index: false, follow: false, nocache: true },
};

export default async function Soon({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Soon");

	return (
		<main className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-(--color-bg) p-6 text-center">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src="/brand/140auto-mark.svg" alt="140auto" className="h-16 w-16" />
			<h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-bold text-(--color-text)">{t("title")}</h1>
			<p className="text-body text-(--color-text-muted)">{t("note")}</p>
		</main>
	);
}
