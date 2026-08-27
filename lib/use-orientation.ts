"use client";

import { useEffect, useState } from "react";

/**
 * Media-query state that is safe to branch on during render.
 *
 * Reading `window.matchMedia(...)` inline while rendering is the obvious way to
 * do this and it is wrong: the server has no `window`, so it renders the false
 * branch, and a client that matches then renders the true branch and React
 * reports a hydration mismatch. Starting at `false` and correcting in an effect
 * means the first client render agrees with the server by construction, and the
 * real answer arrives a tick later.
 */
function useMedia(query: string) {
	const [matches, setMatches] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia(query);
		const sync = () => setMatches(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, [query]);
	return matches;
}

/**
 * True when the viewport is taller than it is wide.
 *
 * Callers use it to pick between LANDSCAPE and PORTRAIT coordinates. §1.7
 * requires the portrait chain to be composed for the phone rather than cropped
 * from the wide frame, which means anything positioned against the picture — an
 * annotation pointing at a wing, a price over a panel — needs a second set of
 * coordinates, not a scaled version of the first.
 */
export const usePortrait = () => useMedia("(orientation: portrait)");

/** §1.7's `prefers-reduced-motion`: the depth planes hold still. */
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
