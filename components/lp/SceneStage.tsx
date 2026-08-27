"use client";

import { useMemo, type ReactNode } from "react";
import {
	useScrollWorld,
	copyOpacity,
	type Segment,
	type ScrollWorldState,
} from "@/lib/scroll-world/useScrollWorld";

export type SceneDef = Segment & {
	/** The scene itself. Receives eased 0..1 progress — the same value the
	 *  scroll-world engine feeds to video.currentTime. */
	render: (progress: number) => ReactNode;
	/** Typeset copy, synced to scroll position. Amin never speaks (§1.1). */
	copy?: string;
	/**
	 * Ground the copy sits on. §1.3 gives navy ink on paper and paper ink on the
	 * navy field — there is no third option and no white-on-green (which is
	 * banned outright). A dark scene therefore has to flip the copy, or the line
	 * disappears into the field.
	 */
	tone?: "light" | "dark";
	/** Pinned over the scene at its peak — used for the §1.6 listing handoff. */
	overlay?: ReactNode;
};

/**
 * The scroll-scrubbed stage. Scenes are fixed to the viewport and cross-fade at
 * the seams while a tall track behind them provides the scroll distance —
 * scroll-world's shape, with the video swapped for vector and the engine's own
 * chrome (route rail, progress bar, particles, brand bar) removed so the CTA
 * stays the only green interactive element (§1.5.3).
 */
export function SceneStage({
	scenes,
	crossfade,
	chrome,
}: {
	scenes: SceneDef[];
	/**
	 * Viewport-heights of feathering at each seam. The default cross-dissolves,
	 * which is right for a film with one continuous camera. A montage cutting
	 * between locked frames passes a tiny value instead — NOT zero: the hook
	 * divides by this to compute seam opacity, and 0 makes that 0/0 at the
	 * boundary.
	 */
	crossfade?: number;
	/** Persistent overlay drawn above every scene, given the live scroll state. */
	chrome?: (state: ScrollWorldState) => ReactNode;
}) {
	const segments = useMemo(
		() => scenes.map((s) => ({ id: s.id, scroll: s.scroll, linger: s.linger })),
		[scenes],
	);
	const { trackRef, state } = useScrollWorld(segments, { crossfade });

	return (
		<>
			{/* fixed scene stack */}
			<div className="pointer-events-none fixed inset-0 z-10" aria-hidden>
				{scenes.map((scene, i) => {
					const seg = state.segments[i];
					if (!seg || !seg.visible) return null;
					return (
						<div
							key={scene.id}
							className="absolute inset-0"
							style={{ opacity: seg.opacity, zIndex: i === state.active ? 20 : 10 }}
						>
							{scene.render(seg.progress)}
						</div>
					);
				})}
			</div>

			{/* copy + overlays, above the scenes */}
			<div className="pointer-events-none fixed inset-0 z-20">
				{scenes.map((scene, i) => {
					const seg = state.segments[i];
					if (!seg) return null;
					const op = copyOpacity(i, scenes.length, seg.linear, seg.linear <= 0, seg.linear >= 1);
					if (op < 0.01) return null;
					return (
						// Copy sits in the upper band, where every scene keeps its light
						// ground. §1.3 has navy ink on paper and no white-on-dark
						// alternative, so centring the copy would drop it onto the
						// road and destroy the contrast.
						<div
							key={scene.id}
							className={
								scene.overlay
									? // an overlay is a thing IN the scene, not a line of copy
									  // laid over it, so it is centred rather than parked in
									  // the copy band
									  // The tick rail sits at the bottom edge now, so this can
									  // centre honestly — which is what lets the handoff grid
									  // align to the screen rendered inside the frame.
									  "absolute inset-0 flex items-center justify-center px-4"
									: "absolute inset-0 flex items-start px-6 pt-[12vh] md:px-16 md:pt-[14vh]"
							}
							style={{
								opacity: op,
								// §4's depth planes reach the copy too: it rides a little
								// higher than the scene it sits on, which is what stops a
								// line of type reading as a caption pasted on a photograph.
								transform: scene.overlay
									? undefined
									: `translate3d(0, ${((0.5 - seg.linear) * 2.6).toFixed(2)}vh, 0)`,
							}}
						>
							{/* same directional scrim as the hero: the copy needs a
							    readable ground over a busy rendered scene */}
							{scene.overlay ? null : (
								<div
									className="pointer-events-none absolute inset-0 -z-10"
									style={{
										background:
											scene.tone === "dark"
												? "linear-gradient(to left, color-mix(in srgb, var(--color-text) 82%, transparent) 0%, transparent 62%)"
												: "linear-gradient(to left, color-mix(in srgb, var(--color-bg) 88%, transparent) 0%, color-mix(in srgb, var(--color-bg) 58%, transparent) 34%, transparent 66%)",
										// masked to the copy band only — full-height it
										// veils whatever the scene put on that side
										WebkitMaskImage:
											"linear-gradient(to bottom, black 0%, black 26%, transparent 52%)",
										maskImage:
											"linear-gradient(to bottom, black 0%, black 26%, transparent 52%)",
									}}
								/>
							)}
							{scene.overlay ? (
								// the handoff grid needs the whole frame, not the copy band
								scene.overlay
							) : scene.copy ? (
								<p
									className="max-w-xl text-balance text-[clamp(1.35rem,3.4vw,2.5rem)] font-semibold leading-[1.45]"
									style={{
										color:
											scene.tone === "dark" ? "var(--color-bg)" : "var(--color-text)",
									}}
								>
									{scene.copy}
								</p>
							) : null}
						</div>
					);
				})}
			</div>

			{chrome ? <div className="pointer-events-none fixed inset-0 z-30">{chrome(state)}</div> : null}

			{/* the track: pure scroll distance, height set by the hook */}
			<div ref={trackRef} aria-hidden />
		</>
	);
}
