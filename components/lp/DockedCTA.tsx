"use client";

import { useEffect, useState } from "react";

/**
 * §1.5: the primary CTA renders in the hero as server HTML before any media
 * loads, then DOCKS on first scroll — bottom-centre on mobile, top-right on
 * desktop — and stays visible for the entire scroll. It is the only green
 * interactive element on the page (§1.5.3), which is why the engine's own
 * route rail, progress bar and brand topbar are all stripped.
 *
 * Rendered by the server inside the hero and again here; this copy is hidden
 * until `scrolled` so there is never a moment with no CTA on screen.
 */
export function DockedCTA({ label, href }: { label: string; href: string }) {
	const [docked, setDocked] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const past = (window.scrollY || 0) > 8;
			setDocked(past);
			// Published on <html> so plain CSS can react to it. The hero's own
			// inline CTA and its scroll cue are server HTML in a server component
			// and cannot read this state any other way — and until they could,
			// the hero button and this one were both on screen at once.
			if (past) document.documentElement.setAttribute("data-scrolled", "");
			else document.documentElement.removeAttribute("data-scrolled");
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div
			data-docked={docked}
			className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 opacity-0 transition-opacity duration-300 data-[docked=true]:opacity-100 md:bottom-auto md:top-0 md:justify-start md:p-6"
			style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
			aria-hidden={!docked}
		>
			<a
				href={href}
				tabIndex={docked ? undefined : -1}
				className="pointer-events-auto inline-flex h-11 items-center rounded-(--radius) bg-(--color-accent) px-6 font-semibold text-(--color-on-accent) transition-colors hover:bg-(--color-accent-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent-ink) focus-visible:ring-offset-2"
			>
				{label}
			</a>
		</div>
	);
}
