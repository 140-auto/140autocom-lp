import Image from "next/image";
import { getTranslations } from "next-intl/server";
import snapshot from "@/lib/listings-snapshot.json";

/**
 * §1.6 "the handoff": the one beat where the rendered world dissolves into real
 * live listing cards from the database. Required in all four versions.
 *
 * This is a standalone board build with no DB connection, so the rows come from
 * a committed snapshot taken once by scripts/snapshot-listings.mjs — real cars,
 * real prices, real photos. Regenerate that to refresh.
 */

export type Listing = (typeof snapshot)[number];

/**
 * §1.4 forbids any promise of approval, and §1.6's "third road" says the
 * visitor never engages a financing institution on this page. So the monthly
 * figure is presented as arithmetic on the asking price — the big number
 * divided — and never as an offer, a rate, or an approval.
 */
const MONTHS = 60;
export const monthly = (price: string) => Math.round(Number(price) / MONTHS / 100) * 100;

export async function ListingHandoff({
	limit = 6,
	tint = false,
}: {
	limit?: number;
	/**
	 * Sit the photographs in the rendered world.
	 *
	 * §1.3's colour law makes `#18CB96` the only saturated colour anywhere in the
	 * film, and these are real photographs of real cars in real colours — on the
	 * handoff beat they are the only saturated thing on screen and they read as
	 * pasted on. A light grade is enough to seat them without misreporting what
	 * colour anyone's car actually is; it is opt-in so lp4 and the real browse
	 * page are untouched.
	 */
	tint?: boolean;
}) {
	const t = await getTranslations("Common");
	const rows = snapshot.slice(0, limit);

	return (
		<div className="mx-auto w-full max-w-6xl">
			<p className="mb-4 text-label font-medium text-(--color-accent-ink)">{t("handoffLabel")}</p>
			{/* Rows past the second are hidden on a phone. lp3 serves this grid on a
			    screen inside the film, which is pinned to one viewport — six cards in
			    two columns is three rows and the third was clipped in half by the
			    bezel, which reads as a rendering fault rather than as a full screen. */}
			<ul className="grid grid-cols-2 gap-3 max-md:[&>li:nth-child(n+5)]:hidden md:grid-cols-3 md:gap-4">
				{rows.map((l) => (
					<li
						key={l.id}
						className="overflow-hidden rounded-(--radius) border border-(--color-hairline) bg-(--color-surface)"
					>
						<div className="relative aspect-video bg-(--color-surface-2)">
							{l.cover ? (
								<Image
									src={l.cover}
									alt={`${l.year} ${l.make_name} ${l.model_name}`}
									fill
									sizes="(min-width: 768px) 320px, 45vw"
									className="object-cover"
									style={tint ? { filter: "saturate(0.8) contrast(0.96) sepia(0.1) brightness(1.02)" } : undefined}
								/>
							) : null}
						</div>
						<div className="p-3">
							<p className="truncate text-label font-semibold text-(--color-text)">
								{l.year} {l.make_name} {l.model_name}
							</p>
							{/* Figures use League Spartan + tabular Western digits (§1.3) */}
							<p className="mt-1 font-(family-name:--font-display-latin) text-body font-semibold tabular-nums text-(--color-text)">
								{Number(l.price).toLocaleString("en-US")}
								<span className="ms-1 text-caption font-normal text-(--color-text-muted)">جنيه</span>
							</p>
							<p className="mt-1 text-caption text-(--color-text-muted)">
								<span className="font-(family-name:--font-display-latin) tabular-nums text-(--color-accent-ink)">
									{monthly(l.price).toLocaleString("en-US")}
								</span>{" "}
								<span className="text-(--color-accent-ink)">جنيه/شهر</span>
								{" · "}
								<span className="font-(family-name:--font-display-latin) tabular-nums">
									{l.mileage.toLocaleString("en-US")}
								</span>{" "}
								كم
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
