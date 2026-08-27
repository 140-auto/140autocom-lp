import { getTranslations } from "next-intl/server";

/**
 * §1.5.1: server-rendered HTML with the primary CTA already in it, before any
 * media request. If the scene layer never loads, the page still functions —
 * this is the fallback the whole media chain is allowed to fail against.
 */
export async function Hero({ title, kicker }: { title: string; kicker?: string }) {
	const t = await getTranslations("Cta");
	const c = await getTranslations("Common");

	return (
		<header className="relative z-30 flex min-h-[100svh] flex-col justify-start p-6 pt-[12vh] md:p-16 md:pt-[14vh]">
			{/* The rendered scenes are busy everywhere, so navy ink needs a light
			    ground under it. This feathers the paper token in from the side the
			    copy sits on (inline-end, i.e. right in Arabic) rather than veiling
			    the whole frame — the scene stays visible, the copy stays legible. */}
			<div
				className="pointer-events-none absolute inset-0 -z-10"
				style={{
					background:
						"linear-gradient(to left, color-mix(in srgb, var(--color-bg) 88%, transparent) 0%, color-mix(in srgb, var(--color-bg) 62%, transparent) 34%, transparent 66%)",
					// masked to the copy band only. Run full-height it veils
					// whatever the scene put on that side — in b6 that is Amin.
					WebkitMaskImage:
						"linear-gradient(to bottom, black 0%, black 26%, transparent 52%)",
					maskImage:
						"linear-gradient(to bottom, black 0%, black 26%, transparent 52%)",
				}}
			/>
			{kicker ? (
				<p className="text-label font-medium tracking-wide text-(--color-accent-ink)">{kicker}</p>
			) : null}
			<h1 className="mt-3 max-w-3xl text-balance text-[clamp(2rem,6vw,4.25rem)] font-bold leading-[1.15] text-(--color-text)">
				{title}
			</h1>
			{/* `hero-cta` is what globals.css hides once DockedCTA reports a
			    scroll. §1.5.1 still holds — the CTA is in the server HTML before
			    any media — and §1.5.2's dock now replaces it instead of doubling
			    it. */}
			<div className="hero-cta mt-8">
				<a
					href="/"
					className="inline-flex h-11 items-center rounded-(--radius) bg-(--color-accent) px-6 font-semibold text-(--color-on-accent) transition-colors hover:bg-(--color-accent-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-ink) focus-visible:ring-offset-2"
				>
					{t("primary")}
				</a>
			</div>
			{/* The cue used to be the word «انزل» sitting in flow on `mt-auto`, so
			    it scrolled away with the hero and, on the way, read as a stray
			    label rather than as an instruction. A chevron says "scroll" without
			    being read, stays put while it is still true, and leaves the moment
			    it stops being true. globals.css owns the bob and the exit; the
			    stylesheet's global reduced-motion rule already stills it. */}
			<div
				className="scroll-cue pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center"
				aria-label={c("scrollHint")}
			>
				<svg viewBox="0 0 24 14" className="h-3.5 w-6" fill="none" aria-hidden>
					<path
						d="M2 2l10 10L22 2"
						stroke="var(--color-text-muted)"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
		</header>
	);
}
