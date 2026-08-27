/**
 * lp3's beats, in order — the single source both narratives read from (§1.7).
 *
 * lp3 is a capability montage (§4): nine locked frames, hard cut between, one
 * green tick per capability. Where lp4 is one continuous camera that never cuts,
 * this one only ever cuts.
 *
 * Revised 26 August 2026 with §4's camera rule. The framing is still bolted
 * down, but each beat is now built in depth planes that travel at different
 * rates against scroll — see `parallax` below and `ParallaxScene`.
 */
export type Lp3Beat = {
	id: string;
	/** file stem under the version's scene directory */
	still: string;
	/** key in the Lp3 message namespace; omitted where the beat carries no copy */
	copyKey?: string;
	/** Scroll-scrubbed clip, landscape only — see SceneMedia for the phone path. */
	clip?: string;
	/** scroll distance in viewport heights */
	scroll: number;
	linger?: number;
	tone?: "light" | "dark";
	/**
	 * §4's depth planes. `horizon` is where the ground meets the distance, as a
	 * fraction of frame height — it is the seam the near and far planes are
	 * masked around, so it has to be measured off the actual render rather than
	 * guessed. `amp` is the far plane's travel as a fraction of the viewport;
	 * the near plane moves further, the atmosphere further still.
	 *
	 * `amp: 0` pins a beat flat. The handoff needs that: the live listing grid is
	 * positioned onto the screen rendered INSIDE the frame, so if the frame
	 * drifts the grid slides off the screen it is supposed to be displayed on.
	 */
	parallax?: { horizon: number; amp: number };
	/**
	 * Which capability this beat ticks off. Every capability beat earns one, the
	 * financing beat included — there the tick is for preparing the file, never
	 * for an approval nobody can promise (§1.4).
	 */
	tick: string;
	/** §1.6 audience weighting, asserted by the gate rather than left to a comment. */
	audience: "buyer" | "seller" | "finance";
};

/**
 * §1.6 wants roughly 70% buyer / 20% seller / 10% financing. Scene COUNT alone
 * reads 56/11/11, so the weighting is carried by scroll distance instead.
 * scripts/check-copy-gate.mjs asserts the split, because it is exactly the kind
 * of thing that silently drifts the first time someone retunes a beat.
 *
 * ORDER, revised 26 August 2026: the instalment beat now follows the paperwork
 * beat rather than preceding the handoff. What someone can pay per month is
 * settled by their file, not by the car they happen to be looking at, so
 * promising to find them a good instalment before the file exists puts the
 * claim in the wrong place. It stays classed `buyer`: searching by instalment
 * is a buying tool, not the financing route §1.6's "third road" means.
 */
export const LP3_BEATS: Lp3Beat[] = [
	// scene 0's line is the hero headline, rendered as server HTML by <Hero>;
	// repeating it here would double it on screen
	{ id: "hero", still: "b0", scroll: 0.9, tick: "", audience: "buyer", parallax: { horizon: 0.56, amp: 0.05 } },
	{ id: "find", still: "b1a", copyKey: "s1", clip: "b1", scroll: 1.6, tick: "بندوّرلك", audience: "buyer", parallax: { horizon: 0.5, amp: 0.05 } },
	// the longest of the capability beats: it is the only one with a person in
	// it (§4's carve-out from §1.1) and the engineer needs to be seen
	{ id: "inspect", still: "b2a", copyKey: "s2", clip: "b2", scroll: 1.9, linger: 0.35, tick: "بنفحص", audience: "buyer", parallax: { horizon: 0.62, amp: 0.035 } },
	// The handoff is staged over two beats, not one. As a single beat it read as
	// clickable UI floating over a scene; as two it reads as a thing in the
	// world — Amin rolls up to a screen, then the screen fills with real stock.
	{ id: "screen", still: "b3sa", clip: "b3s", scroll: 1.3, tick: "", audience: "buyer", parallax: { horizon: 0.7, amp: 0.04 } },
	// the handoff (§1.6). Pinned flat — see `parallax` above.
	{ id: "handoff", still: "b3sb", scroll: 2.0, linger: 0.5, tick: "", audience: "buyer", parallax: { horizon: 0.7, amp: 0 } },
	// the honesty beat (§1.6), verbatim per §1.4 — "at or near the peak of the
	// film", so it gets a long dwell rather than the shortest one
	{ id: "papers", still: "b4a", copyKey: "s4", clip: "b4", scroll: 1.6, tick: "بنجهّز الورق", audience: "finance", parallax: { horizon: 0.54, amp: 0.05 } },
	{ id: "installments", still: "b3a", copyKey: "s3", clip: "b3", scroll: 1.6, tick: "بنشوفلك أحسن قسط", audience: "buyer", parallax: { horizon: 0.6, amp: 0.045 } },
	{ id: "sell", still: "b5a", copyKey: "s5", clip: "b5", scroll: 3.0, tick: "بنبيع عربيتك", audience: "seller", parallax: { horizon: 0.55, amp: 0.04 } },
	{ id: "deliver", still: "b6a", copyKey: "s6", clip: "b6", scroll: 1.8, tick: "بنوصّلها لحد عندك", audience: "buyer", parallax: { horizon: 0.6, amp: 0.04 } },
];

/** The closing frame, used by the end card rather than by a beat. */
export const LP3_CLOSING = "b7";

/** Assets are namespaced per version so lp3's `b0` cannot overwrite lp4's. */
export const sceneSrc = (stem: string) => `/lp/lp3/scenes/${stem}.webp`;
/** Native 9:16 render (§1.7) — composed for the phone, never a crop. */
export const scenePortraitSrc = (stem: string) => `/lp/lp3/scenes/port/${stem}.webp`;
/** Scroll-scrubbed clip, landscape only. */
export const clipSrc = (stem: string) => `/lp/lp3/clips/${stem}.mp4`;

/** Ticks in the order they land, for the column and its static counterpart. */
export const LP3_TICKS = LP3_BEATS.filter((b) => b.tick).map((b) => b.tick);
