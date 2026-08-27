import { getTranslations } from "next-intl/server";
import type { Lp4Beat } from "@/lib/lp4-beats";
import type { ReactNode } from "react";

/**
 * §1.7's `prefers-reduced-motion` narrative: "a designed static narrative
 * covering the same beats, not a blank page."
 *
 * Deliberately a plain scrolling document — no fixed positioning, no scrubbing,
 * no cross-fades. It is server-rendered with no client island at all, so it also
 * happens to be the page that works with JavaScript off, and it reaches the same
 * end card because it walks the same beat array the scroll stage does.
 *
 * Version-agnostic: the caller supplies its own beats, message namespace and
 * asset resolvers, so both films share one document rather than one being a
 * copy that drifts.
 */
export async function StaticNarrative({
	beats,
	namespace,
	sceneSrc,
	scenePortraitSrc,
	handoff,
	chrome,
}: {
	beats: readonly Lp4Beat[];
	namespace: string;
	sceneSrc: (stem: string) => string;
	scenePortraitSrc: (stem: string) => string;
	handoff: ReactNode;
	/** Persistent element the film accumulates — lp3's tick column, as a static list. */
	chrome?: ReactNode;
}) {
	const t = await getTranslations(namespace);

	return (
		<div className="relative z-30 bg-(--color-bg)">
			{chrome ? <div className="mx-auto max-w-4xl px-6 pt-10 md:px-16">{chrome}</div> : null}
			{beats.map((beat) => (
				<section key={beat.id} className="border-b border-(--color-hairline) px-6 py-10 md:px-16">
					<div className="relative mx-auto max-w-4xl overflow-hidden rounded-(--radius)">
						<picture>
							<source media="(orientation: portrait)" srcSet={scenePortraitSrc(beat.still)} />
							<img
								src={sceneSrc(beat.still)}
								alt=""
								className="block w-full"
								loading="lazy"
								decoding="async"
							/>
						</picture>
					</div>
					{beat.copyKey ? (
						<p className="mx-auto mt-5 max-w-4xl text-balance text-[clamp(1.15rem,2.4vw,1.6rem)] font-semibold leading-[1.5] text-(--color-text)">
							{t(beat.copyKey)}
						</p>
					) : null}
					{beat.id === "handoff" ? <div className="mx-auto mt-6 max-w-4xl">{handoff}</div> : null}
				</section>
			))}
		</div>
	);
}
