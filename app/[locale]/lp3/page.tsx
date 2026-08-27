import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/lp/Hero";
import { DockedCTA } from "@/components/lp/DockedCTA";
import { ListingHandoff } from "@/components/lp/ListingHandoff";
import { ScreenFrame } from "@/components/lp/scenes/ScreenFrame";
import { EndCard } from "@/components/lp/EndCard";
import { StaticNarrative } from "@/components/lp/StaticNarrative";
import { TickList } from "@/components/lp/scenes/TickColumn";
import { Lp3Client } from "./Lp3Client";
import {
	LP3_BEATS,
	LP3_TICKS,
	LP3_CLOSING,
	sceneSrc,
	scenePortraitSrc,
} from "@/lib/lp3-beats";

export default async function Lp3({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Lp3");
	const cta = await getTranslations("Cta");

	// §1.6's handoff, served on the screen the beat renders Amin parked in front
	// of rather than floating over the scene as clickable-looking UI.
	const handoff = (
		<ScreenFrame>
			<ListingHandoff tint />
		</ScreenFrame>
	);
	// same screen, but in the document flow rather than pinned to a viewport
	const handoffStatic = (
		<ScreenFrame flow>
			<ListingHandoff tint />
		</ScreenFrame>
	);

	return (
		<main className="relative">
			{/* §1.5.1 — hero and CTA are server HTML, before any media */}
			<Hero title={t("s0")} kicker={t("name")} />
			<DockedCTA label={cta("primary")} href="/" />
			{/* §1.7: the scroll flight, and a designed static narrative for
			    prefers-reduced-motion. Both are in the server HTML; CSS picks. */}
			<div className="motion-only">
				<Lp3Client handoff={handoff} />
			</div>
			<div className="reduced-only">
				<StaticNarrative
					beats={LP3_BEATS}
					namespace="Lp3"
					sceneSrc={sceneSrc}
					scenePortraitSrc={scenePortraitSrc}
					handoff={handoffStatic}
					// the accumulation still has to be present without motion (§1.7),
					// so it appears complete rather than filling
					chrome={<TickList ticks={LP3_TICKS} />}
				/>
			</div>
			{/* §4 bookends the spot: the proven headline returns as the closing
			    line, over the closing render, above the completed tick column. */}
			<EndCard
				headline={t("s0")}
				tagline={t("tagline")}
				still={sceneSrc(LP3_CLOSING)}
				stillPortrait={scenePortraitSrc(LP3_CLOSING)}
				chrome={<TickList ticks={LP3_TICKS} row />}
			/>
		</main>
	);
}
