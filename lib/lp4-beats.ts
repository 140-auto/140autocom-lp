/**
 * lp4's beats, in order — the single source both narratives read from.
 *
 * §1.7 requires a designed static narrative for `prefers-reduced-motion` that
 * covers the same beats and reaches the same end card. Two hand-maintained
 * lists would drift apart, and the drift would be invisible until someone
 * actually browsed with the preference set, so the scroll stage and the static
 * document are generated from this one array.

 */
export type Lp4Beat = {
	id: string;
	/** file stem, resolved by sceneSrc/scenePortraitSrc */
	still: string;
	/** key in the Lp4 message namespace; omitted where the beat carries no copy */
	copyKey?: string;
	/**
	 * Scroll-scrubbed clip, landscape only. There is no portrait
	 * video chain, so phones fall back to the native 9:16 still rather than a
	 * cropped 16:9 clip — see SceneMedia.
	 */
	clip?: string;
	/** scroll distance in viewport heights */
	scroll: number;
	linger?: number;
	tone?: "light" | "dark";
};

export const LP4_BEATS: Lp4Beat[] = [
	// scene 0's line is the hero headline, rendered as server HTML by <Hero>;
	// repeating it here would double it on screen
	{ id: "gridlock", still: "b0", scroll: 1.2 },
	// §5's required shot: the brokers are passed without slowing and WITHOUT ANY
	// ACCOMPANYING COPY. The missing copyKey is the requirement.
	{ id: "brokers", still: "b1", scroll: 1.5 },
	{ id: "chaos", still: "b2a", copyKey: "s1", clip: "order", scroll: 1.3 },
	// §5: gradual enough that no single frame is the change. Two endpoint renders
	// with a clip interpolating between them, not one frame with a visible
	// boundary in it.
	{ id: "order", still: "b2b", copyKey: "s2", scroll: 2, linger: 0.4 },
	// the handoff (§1.6): the ordered gantries become real listing cards
	{ id: "handoff", still: "b2b", scroll: 1.7, linger: 0.5 },
	{ id: "fork", still: "b3", copyKey: "s3", scroll: 1.3 },
	{ id: "inspection", still: "b4", copyKey: "s4", scroll: 2.1, linger: 0.35, tone: "dark" },
	// the honesty beat (§1.6), at the peak
	{ id: "gate", still: "b5", copyKey: "s5", clip: "gate", scroll: 1.9, linger: 0.45 },
	// §5 gives the arrival no copy — the shot carries the ending
	{ id: "arrive", still: "b6", scroll: 1.5 },
];

/** Landscape render. Assets are namespaced per version so two films can ship
 *  side by side without one's `b0` overwriting the other's. */
export const sceneSrc = (stem: string) => `/lp/lp4/scenes/${stem}.webp`;
/** Native 9:16 render (§1.7) — composed for the phone, never a crop. */
export const scenePortraitSrc = (stem: string) => `/lp/lp4/scenes/port/${stem}.webp`;
/** Scroll-scrubbed clip, landscape only. */
export const clipSrc = (stem: string) => `/lp/lp4/clips/${stem}.mp4`;
