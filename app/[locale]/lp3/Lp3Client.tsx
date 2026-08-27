"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { SceneStage, type SceneDef } from "@/components/lp/SceneStage";
import { ParallaxScene } from "@/components/lp/ParallaxScene";
import { InspectionNotes } from "@/components/lp/scenes/Inspection";
import { PriceTags, ForSaleSign } from "@/components/lp/scenes/SceneLabels";
import { TickColumn } from "@/components/lp/scenes/TickColumn";
import { LP3_BEATS, LP3_TICKS, sceneSrc, scenePortraitSrc, clipSrc } from "@/lib/lp3-beats";

/**
 * lp3 — احنا بنعمل ده كله / Everything We Do (§4).
 *
 * A capability montage and the deliberate inverse of lp4: that film is one
 * unbroken camera that never cuts; this one is nine locked frames that only
 * ever cut. The seams are hard cuts because `crossfade` is near zero.
 *
 * Each beat's world is built in depth planes (`ParallaxScene`) that travel at
 * different rates against scroll. Before that it was a slideshow — seven of the
 * nine beats were a single flat image that did not change at all while the
 * visitor scrolled past it.
 */
export function Lp3Client({ handoff }: { handoff: ReactNode }) {
	const t = useTranslations("Lp3");
	const c = useTranslations("Common");

	const scenes: SceneDef[] = LP3_BEATS.map((beat) => ({
		id: beat.id,
		scroll: beat.scroll,
		linger: beat.linger,
		tone: beat.tone,
		copy: beat.copyKey ? t(beat.copyKey) : undefined,
		overlay: beat.id === "handoff" ? handoff : undefined,
		render: (p: number) => (
			<ParallaxScene
				progress={p}
				still={sceneSrc(beat.still)}
				stillPortrait={scenePortraitSrc(beat.still)}
				clip={beat.clip ? clipSrc(beat.clip) : undefined}
				parallax={beat.parallax}
				alt=""
				overlay={
					beat.id === "inspect" ? (
						/* faults first, always — the order is enforced inside the
						   component, not by the order of this list */
						<InspectionNotes
							progress={p}
							// Percentages of the frame, pointing at the grey car in the
							// bay: its far wing, its near front tyre, then its bonnet.
							faults={[
								{ at: [63, 62], atPortrait: [68, 64], text: "رشّ في الرفرف الشمال" },
								{ at: [44, 73], atPortrait: [36, 76], text: "كاوتش قدام محتاج تغيير" },
							]}
							merits={[{ at: [52, 50], atPortrait: [52, 57], text: "الموتور نضيف" }]}
						/>
					) : beat.id === "installments" ? (
						<PriceTags progress={p} />
					) : beat.id === "sell" ? (
						<ForSaleSign label={c("forSale")} progress={p} />
					) : undefined
				}
			/>
		),
	}));

	return (
		<SceneStage
			scenes={scenes}
			// §4: hard cuts, not dissolves. Not 0 — the hook divides by this to
			// feather the seams, and 0 makes that 0/0 at the boundary.
			crossfade={0.02}
			chrome={(state) => (
				<TickColumn
					ticks={LP3_TICKS}
					// A tick lands once its beat is behind us. `active` is the beat
					// under the top of the viewport, so counting the ticked beats up
					// to and including it is what makes the column fill as the film
					// works through the list.
					done={LP3_BEATS.slice(0, state.active + 1).filter((b) => b.tick).length}
					// Bottom-inline-start at every width. It used to jump to the
					// vertical middle on desktop, where it sat directly under the
					// hero's CTA and beside the handoff screen; down here it clears
					// both, and the handoff can centre properly.
					className="absolute bottom-8 start-6 md:bottom-10 md:start-10"
					// its own rate, slower than the scene — the rail is the one thing
					// that carries across the cuts, so it should feel anchored
					style={{ transform: `translate3d(0, ${(-state.overall * 2).toFixed(2)}vh, 0)` }}
				/>
			)}
		/>
	);
}
