"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One beat's visual: a rendered still, or a rendered clip scrubbed by scroll.
 *
 * The video path ports the three hard-won behaviours from scroll-world's
 * scrub-engine.js. They look like paranoia and are not:
 *
 *  1. BLOB LOADING. Scrubbing sets `video.currentTime`. Many static hosts do not
 *     serve HTTP byte-range requests, which pins `video.seekable` to [0,0] and
 *     clamps every seek to frame 0 — the clip looks frozen. Fetching the file as
 *     a Blob and playing it from an object URL sidesteps that entirely.
 *  2. SEEK COALESCING. Never issue a seek while the decoder is still seeking. On
 *     a phone a fast flick otherwise piles seeks up until the clip locks solid.
 *  3. iOS PRIMING. A muted video that has never played will not paint a seeked
 *     frame on iOS Safari — it stays blank. So the still is held as a poster
 *     until a real frame paints, and each clip is primed (play→pause) on first
 *     touch.
 */

type Props = {
	/** Eased 0..1 position within this beat. */
	progress: number;
	still: string;
	/** Native 9:16 render for phones (§1.7). */
	stillPortrait?: string;
	clip?: string;
	alt?: string;
	/** Ken-Burns push applied to stills. Beats with a clip do not need it. */
	push?: number;
};

export function SceneMedia({ progress, still, stillPortrait, clip, alt = "", push = 0.06 }: Props) {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [painted, setPainted] = useState(false);
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const target = useRef(0);
	const current = useRef(0);

	const reduce =
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Clips are landscape-only. There is no portrait video chain, so on a phone
	// the alternative would be object-cover on a 16:9 clip — which is precisely
	// the crop §1.7 forbids. A phone gets the NATIVE 9:16 still instead, which is
	// an honest degradation rather than a wrong one.
	const portrait =
		typeof window !== "undefined" &&
		window.matchMedia("(orientation: portrait)").matches;

	// Under reduced motion the clips are never fetched at all — the stills stay
	// up and cross-dissolve, which is the designed static narrative (§1.7).
	useEffect(() => {
		if (!clip || reduce || portrait) return;
		let dead = false;
		let url: string | null = null;
		fetch(clip)
			.then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
			.then((b) => {
				if (dead) return;
				url = URL.createObjectURL(b);
				setBlobUrl(url);
			})
			.catch(() => {});
		return () => {
			dead = true;
			if (url) URL.revokeObjectURL(url);
		};
	}, [clip, reduce, portrait]);

	target.current = progress;

	useEffect(() => {
		if (!blobUrl) return;
		let raf = 0;
		const step = () => {
			const v = videoRef.current;
			raf = requestAnimationFrame(step);
			if (!v || !v.duration) return;
			if (v.seeking) return; // (2) coalesce
			current.current += (target.current - current.current) * 0.18;
			const t = Math.min(0.999, Math.max(0, current.current)) * v.duration;
			if (Math.abs(v.currentTime - t) > 0.008) {
				try {
					v.currentTime = t;
				} catch {}
			}
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [blobUrl]);

	// (3) prime on first touch so iOS paints the first seek instead of a blank
	useEffect(() => {
		if (!blobUrl) return;
		const prime = () => {
			const v = videoRef.current;
			if (!v) return;
			const p = v.play();
			if (p && p.then) p.then(() => { try { v.pause(); } catch {} }).catch(() => {});
		};
		window.addEventListener("touchstart", prime, { once: true, passive: true });
		return () => window.removeEventListener("touchstart", prime);
	}, [blobUrl]);

	const scale = clip || reduce ? 1 : 1 + progress * push;

	return (
		<div className="absolute inset-0 overflow-hidden bg-(--color-bg)">
			{/* The still is also the poster, and stays until a real frame paints.
			    <picture> rather than a JS media query so the browser picks the
			    native 9:16 render itself — correct in the server HTML, with no
			    flash of the landscape frame on a phone. */}
			<picture>
				{stillPortrait ? (
					<source media="(orientation: portrait)" srcSet={stillPortrait} />
				) : null}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={still}
					alt={alt}
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
					style={{ opacity: painted ? 0 : 1, transform: `scale(${scale.toFixed(4)})` }}
				/>
			</picture>
			{blobUrl ? (
				<video
					ref={videoRef}
					src={blobUrl}
					muted
					playsInline
					preload="auto"
					// §1.7 / §7: silent. Clips are encoded -an, so there is no audio
					// track to mute in the first place; `muted` is belt and braces.
					onSeeked={() => setPainted(true)}
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : null}
		</div>
	);
}
