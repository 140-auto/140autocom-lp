import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

/**
 * §1.5.4: the secondary CTA appears at the seller beat and the end card only.
 *
 * Three optional layers, in the order a version reaches for them:
 *
 * - `tagline` is for a version that bookends itself. Omitted, the card is the
 *   trust statement alone, which is all lp4 wants.
 * - `headline` is §4's "the headline returns": lp3 opens on its proven line and
 *   closes on it again, so the line is the last thing read as well as the first.
 * - `still` and `chrome` fill the card. Left bare it is a short paragraph
 *   floating in a screen-height field of paper — the emptiest frame in a film
 *   that has just spent sixteen viewport-heights being full, and the frame the
 *   visitor remembers. The closing render goes behind it full-bleed, with the
 *   paper feathered in from the reading side so §1.3's navy-on-paper contrast
 *   is unaffected by whatever the render put underneath.
 */
export async function EndCard({
	headline,
	tagline,
	still,
	stillPortrait,
	chrome,
}: {
	headline?: string;
	tagline?: string;
	still?: string;
	stillPortrait?: string;
	/** The thing the film accumulated, shown complete — lp3's tick column. */
	chrome?: ReactNode;
} = {}) {
	const t = await getTranslations("Cta");
	const lead = headline ?? tagline;
	const sub = headline ? tagline : undefined;

	return (
		<section className="relative z-30 flex min-h-[100svh] flex-col justify-center gap-6 overflow-hidden bg-(--color-bg) p-6 md:p-16">
			{still ? (
				<>
					<picture>
						{stillPortrait ? (
							<source media="(orientation: portrait)" srcSet={stillPortrait} />
						) : null}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src={still}
							alt=""
							loading="lazy"
							decoding="async"
							className="absolute inset-0 -z-20 h-full w-full object-cover"
						/>
					</picture>
					{/* Paper feathered in from the reading side, exactly as <Hero> does
					    it. Full-height here rather than masked to a band: the end card
					    is a document, not a copy strip over a scene. */}
					<div
						className="pointer-events-none absolute inset-0 -z-10"
						style={{
							background:
								"linear-gradient(to left, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 92%, transparent) 38%, color-mix(in srgb, var(--color-bg) 45%, transparent) 72%, color-mix(in srgb, var(--color-bg) 20%, transparent) 100%)",
						}}
					/>
				</>
			) : null}

			{lead ? (
				<p className="max-w-2xl text-balance text-[clamp(1.75rem,5vw,3.25rem)] font-bold leading-[1.25] text-(--color-text)">
					{lead}
				</p>
			) : null}
			{sub ? (
				<p className="max-w-2xl text-balance text-[clamp(1.15rem,2.6vw,1.6rem)] font-semibold leading-[1.4] text-(--color-text)">
					{sub}
				</p>
			) : null}
			<p
				className={
					lead
						? "max-w-2xl text-balance text-body text-(--color-text-muted)"
						: "max-w-2xl text-balance text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-[1.3] text-(--color-text)"
				}
			>
				{t("trust")}
			</p>

			{/* The film's accumulation, complete — and it comes BEFORE the buttons.
			    The card used to close on the checklist, which put the last word on
			    a list of things already done rather than on the thing to do next. */}
			{chrome ? <div className="flex justify-center pt-4">{chrome}</div> : null}

			{/* The closing call. Bigger than the docked CTA and centred, because
			    this is the one place on the page where the visitor has stopped
			    scrolling and is deciding. The motion is on its own clock, not tied
			    to scroll position — there is no scroll left here. */}
			<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
				<a
					href="/"
					className="cta-sheen cta-nudge inline-flex h-14 items-center gap-2 rounded-(--radius) bg-(--color-accent) px-8 text-body-lg font-semibold text-(--color-on-accent) transition-colors hover:bg-(--color-accent-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-ink) focus-visible:ring-offset-2"
				>
					{t("primary")}
					<Arrow />
				</a>
				{/* secondary is never green — only one green interactive element (§1.5.3) */}
				<a
					href="/"
					className="cta-nudge inline-flex h-14 items-center gap-2 rounded-(--radius) border border-(--color-hairline-strong) bg-(--color-surface) px-8 text-body-lg font-semibold text-(--color-text) transition-colors hover:border-(--color-text-muted) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-ink) focus-visible:ring-offset-2"
				>
					{t("secondary")}
					<Arrow />
				</a>
			</div>
		</section>
	);
}

/** Points the way the reader is going — globals.css mirrors it for RTL. */
function Arrow() {
	return (
		<svg viewBox="0 0 16 12" className="icon-directional h-3 w-4" fill="none" aria-hidden>
			<path
				d="M1 6h13M9.5 1.5 14 6l-4.5 4.5"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
