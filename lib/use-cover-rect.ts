"use client";

import { useEffect, useState } from "react";

export type Rect = { x: number; y: number; w: number; h: number };

/**
 * Where a normalised rect inside an `object-cover` image actually lands on
 * screen.
 *
 * The handoff needs this. The live listing grid is meant to appear ON the
 * enormous display rendered inside the frame, but scenes are drawn with
 * `object-cover`, so how much of the image is cropped — and therefore where the
 * screen sits — changes with the viewport's aspect ratio. A fixed inset is
 * correct at exactly one window size. The previous build gave up and covered
 * the rendered screen with an opaque panel of its own, which left two
 * misaligned bezels visible at once.
 *
 * `aspect` is the source's width/height. `rect` is the target's position within
 * the source, 0..1. Returns CSS pixels relative to the covering box, or null
 * before first measure.
 */
export function useCoverRect(aspect: number, rect: Rect | null) {
	const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(
		null,
	);

	useEffect(() => {
		if (!rect) {
			setBox(null);
			return;
		}
		const measure = () => {
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			// object-cover scales the image up until it covers both axes, then
			// centres it and crops the overflow.
			const widthDriven = vw / vh > aspect;
			const rw = widthDriven ? vw : vh * aspect;
			const rh = widthDriven ? vw / aspect : vh;
			setBox({
				left: (vw - rw) / 2 + rect.x * rw,
				top: (vh - rh) / 2 + rect.y * rh,
				width: rect.w * rw,
				height: rect.h * rh,
			});
		};
		measure();
		window.addEventListener("resize", measure);
		window.addEventListener("orientationchange", measure);
		return () => {
			window.removeEventListener("resize", measure);
			window.removeEventListener("orientationchange", measure);
		};
	}, [aspect, rect]);

	return box;
}
