"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCoverRect, type Rect } from "@/lib/use-cover-rect";

/**
 * The handoff (§1.6) staged as a thing inside the film rather than as UI on top
 * of it.
 *
 * Left bare, the live listing grid floated over the scene as six white cards
 * with borders — indistinguishable from the real browse page, so visitors tried
 * to click it. It is not clickable and must not invite the attempt, so it is
 * served on the enormous display the beat renders Amin parked in front of.
 *
 * On a wide viewport the grid is ALIGNED to that rendered display rather than
 * covering it: `useCoverRect` works out where `object-cover` actually put the
 * screen, and the cards are placed inside it with no second bezel of their own.
 * The render's bezel is the bezel. Covering it, which is what this component
 * used to do, left two frames visibly out of register.
 *
 * On a phone the portrait render composes the display only about a quarter of
 * the frame tall — too short to hold a card grid — so there it falls back to a
 * centred panel that reads as a screen on its own.
 */

/** Measured off `public/lp/lp3/scenes/b3sb.webp`: the pale face inside the bezel. */
const SCREEN_FACE: Rect = { x: 0.238, y: 0.208, w: 0.524, h: 0.388 };
/** 1920x1288 — the landscape scene aspect every lp3 frame is packed at. */
const SCENE_ASPECT = 1920 / 1288;

export function ScreenFrame({
	children,
	flow = false,
}: {
	children: ReactNode;
	/**
	 * In the reduced-motion document the screen sits in the page flow and is
	 * scrolled past, so it must show all of itself and cannot be positioned
	 * against a viewport at all.
	 */
	flow?: boolean;
}) {
	const [aligned, setAligned] = useState(false);
	useEffect(() => {
		if (flow) return;
		const mq = window.matchMedia("(orientation: landscape)");
		const sync = () => setAligned(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, [flow]);

	const box = useCoverRect(SCENE_ASPECT, aligned ? SCREEN_FACE : null);

	// pointer-events-none throughout: §1.5.3 makes the CTA the only interactive
	// element on the page, and this is a picture of a screen.
	if (box) {
		return (
			<div
				className="pointer-events-none absolute overflow-hidden"
				style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
			>
				{/* The rendered display is wide and shallow — a little over a third
				    of the frame's height — so it holds ONE row. Six cards put the
				    second row half outside the screen, which reads as a rendering
				    fault rather than as a screen showing stock. The rest of the
				    grid is hidden rather than the card count changed, because the
				    grid is a server component and this decision is a viewport one. */}
				<div className="h-full w-full p-[2.2%] text-[0.82em] [&_li:nth-child(n+4)]:hidden">
					{children}
				</div>
			</div>
		);
	}

	return (
		<div className={`pointer-events-none ${flow ? "w-full" : "w-[min(94vw,58rem)]"}`}>
			<div className="rounded-[calc(var(--radius)*1.5)] bg-(--color-text) p-2 md:p-3">
				<div
					className={`${flow ? "" : "max-h-[56vh] overflow-hidden"} rounded-(--radius) bg-(--color-bg) p-4 md:p-5`}
				>
					{children}
				</div>
			</div>
		</div>
	);
}
