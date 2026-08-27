"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-scrub primitive, ported from scroll-world's scrub-engine.js.
 *
 * The engine builds its own DOM and CSS, which fights every requirement in
 * lp-concepts §1.5 (server-rendered hero, docked CTA, one green interactive
 * element) and §1.6 (a live listing grid mid-timeline). What is actually worth
 * keeping is its *math* and its hard-won playback behaviour, so that is what is
 * ported here; the DOM is ours.
 *
 * The key insight that makes the vector build possible: the engine maps scroll
 * onto a per-segment 0..1 progress value and only then feeds it to
 * `video.currentTime`. Nothing about that mapping is video-specific — an SVG
 * timeline consumes the identical value. See `Scene` for both consumers.
 */

export type Segment = {
	id: string;
	/** Viewport-heights of scroll spent on this segment. More = longer dwell. */
	scroll?: number;
	/**
	 * 0..1. Remaps time so the camera settles mid-segment — exactly where the
	 * copy peaks — then moves quicker at the edges. Seam frames are untouched
	 * (f(0)=0, f(1)=1). Keep <= 0.6; 1 is a full pause.
	 */
	linger?: number;
};

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (x: number) => {
	const t = clamp(x);
	return t * t * (3 - 2 * t);
};

/** scrub-engine.js `lingerEase` — a cubic about the midpoint, mixed by L. */
const lingerEase = (x: number, L: number) => {
	const l = clamp(L);
	const c = x - 0.5;
	return (1 - l) * x + l * (4 * c * c * c + 0.5);
};

export type SegmentState = {
	/** Eased 0..1 position within this segment — drives SVG time or currentTime. */
	progress: number;
	/** Un-eased 0..1. Copy timing uses this so text is not dragged by `linger`. */
	linear: number;
	/** 0..1 opacity, feathered by `crossfade` viewport-heights at each seam. */
	opacity: number;
	visible: boolean;
};

export type ScrollWorldState = {
	segments: SegmentState[];
	/** Index of the segment currently under the top of the viewport. */
	active: number;
	/** 0..1 across the whole track. */
	overall: number;
	/** True once the visitor has scrolled at all — §1.5.2 docks the CTA on this. */
	scrolled: boolean;
};

const DEFAULT_SCROLL = 1.3;

export function useScrollWorld(
	segments: Segment[],
	opts: { crossfade?: number; reduce?: boolean } = {},
) {
	const crossfade = opts.crossfade ?? 0.12;
	const trackRef = useRef<HTMLDivElement | null>(null);
	const [state, setState] = useState<ScrollWorldState>(() => ({
		segments: segments.map((_, i) => ({
			progress: 0,
			linear: 0,
			// Segment 0 is fully opaque before any scroll so the hero paints
			// immediately rather than fading up from nothing.
			opacity: i === 0 ? 1 : 0,
			visible: i === 0,
		})),
		active: 0,
		overall: 0,
		scrolled: false,
	}));

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;

		let vh = window.innerHeight;
		// Width the current layout was computed at. A mobile URL bar showing or
		// hiding fires `resize` with only the height changed; re-laying out there
		// makes the page visibly jump mid-scroll, so height-only resizes are
		// ignored (scrub-engine.js `onResize`).
		let laidOutW = window.innerWidth;
		let bounds: { start: number; end: number }[] = [];
		let total = 0;
		let ticking = false;
		// Scroll origin. §1.5.1 puts a server-rendered hero ahead of the film, so
		// segment 0 must begin where the TRACK begins, not at page top —
		// otherwise the hero and the first scene's copy occupy the screen at the
		// same time.
		let origin = 0;

		const layout = () => {
			vh = window.innerHeight;
			laidOutW = window.innerWidth;
			origin = track.offsetTop;
			let off = 0;
			bounds = segments.map((s) => {
				const start = off * vh;
				off += s.scroll ?? DEFAULT_SCROLL;
				return { start, end: off * vh };
			});
			total = off;
			// +1vh so the final segment can actually reach progress 1.
			track.style.height = `${total * vh + vh}px`;
			read();
		};

		const read = () => {
			// Clamped to the track's own range. Above the track (the hero) that
			// pins segment 0 at progress 0 so the first scene sits BEHIND the
			// hero rather than being faded out to nothing; below it, the last
			// scene holds at 1 instead of vanishing before the end card.
			const raw = (window.scrollY || window.pageYOffset) - origin;
			const y = clamp(raw, 0, total * vh);
			const fade = crossfade * vh;

			let active = 0;
			for (let i = 0; i < bounds.length; i++) {
				if (y >= bounds[i].start) active = i;
			}

			const next = bounds.map((b, i) => {
				const span = b.end - b.start || 1;
				const linear = clamp((y - b.start) / span);
				const linger = segments[i].linger ?? 0;
				let outside = 0;
				if (y < b.start) outside = b.start - y;
				else if (y > b.end) outside = y - b.end;
				const opacity = smooth(1 - outside / fade);
				return {
					progress: linger ? lingerEase(linear, linger) : linear,
					linear,
					opacity,
					visible: opacity > 0.001,
				};
			});

			setState({
				segments: next,
				active,
				overall: clamp(y / (total * vh || 1)),
				scrolled: (window.scrollY || 0) > 8,
			});
			ticking = false;
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(read);
		};

		const onResize = () => {
			if (window.innerWidth === laidOutW) return; // URL-bar-only resize
			layout();
		};

		layout();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		window.addEventListener("orientationchange", layout);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("orientationchange", layout);
		};
	}, [segments, crossfade]);

	return { trackRef, state };
}

/**
 * Copy timing (scrub-engine.js `read`): the first segment greets on landing and
 * fades out, the last holds its card once reached, and everything between rises,
 * HOLDS, and falls. Split out so the vector scenes and the reduced-motion
 * narrative can share one definition of "when does this line land".
 *
 * The middle case used to be scrub-engine's triangle — full opacity at exactly
 * the midpoint and zero at both seams. On a 1.5vh segment that leaves the line
 * genuinely readable for a few hundred pixels of scroll, and every beat reads as
 * flashing past. A plateau instead: in over the first fifth, held across the
 * middle three-fifths, out over the last fifth. Same segment length, roughly
 * three times the dwell at full opacity, and the seams still reach 0 so adjacent
 * beats never double up.
 */
const COPY_RAMP = 0.2;
export function copyOpacity(index: number, count: number, linear: number, atStart: boolean, atEnd: boolean) {
	if (index === 0) return atEnd ? 0 : smooth(1 - linear / 0.62);
	if (index === count - 1) return atStart ? 0 : smooth(linear / 0.4);
	if (atStart || atEnd) return 0;
	return smooth(Math.min(linear, 1 - linear) / COPY_RAMP);
}
