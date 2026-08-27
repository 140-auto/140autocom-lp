/**
 * lp3's accumulation (§4): each capability, once performed, drops a green tick
 * into a fixed column at the frame edge. It is the ONLY element that carries
 * across the cuts, and it is what makes seven unrelated locked-off frames read
 * as one argument rather than a slideshow.
 *
 * Drawn as UI, never rendered into the frames. §1.2 composites marks in post for
 * exactly this reason, and a generator asked to draw a growing checklist
 * consistently across seven images will not.
 *
 * The list completes — every beat earns its tick, the financing beat included,
 * where the tick is for preparing the file and never for an approval (§1.4).
 */

/**
 * Renders the list only — the caller positions it. The scroll stage pins it to
 * the frame edge; the reduced-motion document lets it sit in the flow. Baking
 * `absolute` in here put the static copy on top of the document.
 *
 * Position it with logical inset utilities, never physical ones. §1.7 fixes the
 * camera and Amin's travel direction across locales, but that rule is about the
 * rendered film — this rail is Arabic UI text and belongs on the side the reader
 * starts from, which is the right in Arabic and the left in English.
 *
 * It sits on its own paper panel. Bare, it was unreadable on the beat that
 * matters most: the hero frame is a pale sky with nothing ticked yet, so seven
 * faint grey lines were laid over the palest ground in the film with no
 * contrast anywhere. A panel makes the rail legible on every frame regardless of
 * what the render put behind it, and it stops the column colliding with the
 * listing grid at the handoff.
 */
export function TickColumn({
	ticks,
	done,
	row = false,
	className = "",
	style,
}: {
	ticks: string[];
	done: number;
	/** Lay the completed list out horizontally — for the end card, not the rail. */
	row?: boolean;
	className?: string;
	/** The rail's own parallax rate, set by the stage (§4's depth planes). */
	style?: import("react").CSSProperties;
}) {
	return (
		<ul
			className={`flex ${row ? "flex-row flex-wrap gap-x-5 gap-y-2" : "flex-col gap-2 md:gap-2.5"} rounded-(--radius) border border-(--color-hairline) bg-(--color-surface)/85 px-4 py-3 backdrop-blur-sm ${className}`}
			style={style}
			aria-hidden
		>
			{ticks.map((label, i) => {
				const lit = i < done;
				return (
					<li key={label} className="flex items-center gap-2">
						<span
							className="grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-300"
							style={{
								// Small and quiet. §1.5.3 keeps the CTA the only green
								// INTERACTIVE element; these are inert, but a loud green
								// column would still compete with the button for the eye.
								background: lit ? "var(--color-accent)" : "transparent",
								border: lit ? "none" : "1px solid var(--color-hairline-strong)",
							}}
						>
							{lit ? (
								<svg viewBox="0 0 10 8" className="size-2.5" fill="none" aria-hidden>
									<path
										d="M1 4.2 3.5 6.7 9 1.2"
										stroke="var(--color-on-accent)"
										strokeWidth="1.8"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							) : null}
						</span>
						{/* Unlit entries stay present rather than appearing from nothing,
						    so the viewer can see how much is still to come — but as MUTED
						    INK, not as the same ink at low opacity. Fading the whole row
						    faded the panel out from under it too. */}
						<span
							className="text-caption font-semibold transition-colors duration-300"
							style={{ color: lit ? "var(--color-text)" : "var(--color-text-muted)" }}
						>
							{label}
						</span>
					</li>
				);
			})}
		</ul>
	);
}

/** The completed column as a plain list, for the reduced-motion narrative (§1.7). */
export function TickList({ ticks, row = false }: { ticks: string[]; row?: boolean }) {
	return <TickColumn ticks={ticks} done={ticks.length} row={row} />;
}
