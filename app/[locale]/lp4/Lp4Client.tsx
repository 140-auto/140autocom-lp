"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { SceneStage, type SceneDef } from "@/components/lp/SceneStage";
import { SceneMedia } from "@/components/lp/SceneMedia";
import { InspectionNotes } from "@/components/lp/scenes/Inspection";
import { LP4_BEATS, sceneSrc, scenePortraitSrc, clipSrc } from "@/lib/lp4-beats";

/**
 * lp4 — من غير لف ودوران / One Long Test Drive (§5).
 *
 * Every beat is a rendered scene. §5's rule that "the camera never cuts and
 * never leaves the road" is honoured by keeping one road, one camera height and
 * one chase-cam viewpoint across all of them, and by cross-dissolving at the
 * seams rather than cutting.
 *
 * The beat list itself lives in LP4_BEATS so the reduced-motion narrative walks
 * exactly the same beats (§1.7); this file adds only what needs the client —
 * the scrubbed media and the scene-specific overlays.
 */
export function Lp4Client({ handoff }: { handoff: ReactNode }) {
	const t = useTranslations("Lp4");

	const scenes: SceneDef[] = LP4_BEATS.map((beat) => ({
		id: beat.id,
		scroll: beat.scroll,
		linger: beat.linger,
		tone: beat.tone,
		copy: beat.copyKey ? t(beat.copyKey) : undefined,
		overlay: beat.id === "handoff" ? handoff : undefined,
		render: (p: number) => (
			<>
				<SceneMedia
					progress={p}
					still={sceneSrc(beat.still)}
					stillPortrait={scenePortraitSrc(beat.still)}
					clip={beat.clip ? clipSrc(beat.clip) : undefined}
					alt=""
					push={beat.id === "handoff" ? 0.02 : undefined}
				/>
				{beat.id === "inspection" ? (
					/* faults first, always — the order is enforced inside the
					   component, not by the order of this list */
					<InspectionNotes
						progress={p}
						// anchors land on the inspected car, which sits right of centre
						// in b4 — measured from the render, not guessed
						faults={[
							{ at: [50, 66], text: "رشّ في الرفرف الشمال" },
							{ at: [65, 63], text: "العداد عالي" },
							{ at: [78, 74], text: "كاوتش قدام محتاج تغيير" },
						]}
						merits={[
							{ at: [82, 67], text: "الموتور نضيف" },
							{ at: [62, 73], text: "صيانة بالكامل" },
						]}
					/>
				) : null}
			</>
		),
	}));

	return <SceneStage scenes={scenes} />;
}
