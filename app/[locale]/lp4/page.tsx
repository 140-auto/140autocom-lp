import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/lp/Hero";
import { DockedCTA } from "@/components/lp/DockedCTA";
import { ListingHandoff } from "@/components/lp/ListingHandoff";
import { EndCard } from "@/components/lp/EndCard";
import { StaticNarrative } from "@/components/lp/StaticNarrative";
import { Lp4Client } from "./Lp4Client";
import { LP4_BEATS, sceneSrc, scenePortraitSrc } from "@/lib/lp4-beats";

export default async function Lp4({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("Lp4");
	const cta = await getTranslations("Cta");

	return (
		<main className="relative">
			{/* §1.5.1 — hero and CTA are server HTML, before any media */}
			<Hero title={t("s0")} kicker={t("name")} />
			<DockedCTA label={cta("primary")} href="/" />
			{/* the handoff grid is server-rendered and handed to the client island,
			    so the real listings exist in the HTML even if the island never mounts */}
			{/* §1.7: the scroll flight, and a designed static narrative for
			    prefers-reduced-motion. Both are in the server HTML; CSS picks. */}
			<div className="motion-only">
				<Lp4Client handoff={<ListingHandoff />} />
			</div>
			<div className="reduced-only">
				<StaticNarrative
					beats={LP4_BEATS}
					namespace="Lp4"
					sceneSrc={sceneSrc}
					scenePortraitSrc={scenePortraitSrc}
					handoff={<ListingHandoff />}
				/>
			</div>
			<EndCard />
		</main>
	);
}
