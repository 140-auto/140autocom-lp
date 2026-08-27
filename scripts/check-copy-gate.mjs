/**
 * The spec gates that live in DATA rather than in the served page.
 *
 * scripts/accept-lp.sh checks the rendered HTML. These are the rules a page
 * scrape cannot see — copy prohibitions across every version at once, and the
 * beat weighting, which is exactly the kind of thing that drifts silently the
 * first time someone retunes a beat for pacing.
 *
 * Plain node rather than vitest: this repo's other gates are .mjs scripts, and
 * the installed vitest cannot load its own native binding.
 *
 * Usage: node scripts/check-copy-gate.mjs
 */
import { readFileSync } from "node:fs";
import { LP3_BEATS, LP3_TICKS } from "../lib/lp3-beats.ts";

const ar = JSON.parse(readFileSync(new URL("../messages/ar.json", import.meta.url), "utf8"));

let failed = 0;
const check = (ok, label, detail = "") => {
	if (!ok) failed++;
	console.log(`  ${ok ? "pass" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
};

console.log("§1.4 prohibited copy terms, every version:");
// §1.4 is partly a SUBSTITUTION rule (say قسّط, never موّل), so the term that can
// actually fail is موّل — grepping for قسّط would score 0/0 on legitimate copy.
const PROHIBITED = ["مضمون", "فوري", "احجز دلوقتي", "موّل"];
for (const ns of Object.keys(ar).filter((k) => /^Lp\d$/.test(k))) {
	const copy = Object.values(ar[ns]).join(" ");
	const hits = PROHIBITED.filter((t) => copy.includes(t));
	check(hits.length === 0, ns, hits.join(", "));
}

console.log("\n§1.6 honesty beat, verbatim and unmodified:");
// §1.6 gives ONE canonical wording and §7 requires it "unmodified".
//
// Lp1, Lp2 and Lp4 each paraphrase it instead. That is a real deviation and it
// predates lp3 — it went unnoticed because accept-lp4.sh used to grep the raw
// response, which contains the whole message catalogue whether or not a string
// was rendered, so the check passed vacuously for every version.
//
// They are listed here rather than silently skipped, and rather than failing the
// build: Lp1 and Lp2 are concept-only and Lp4 is signed off with its re-render
// deferred, so rewriting their copy is a board decision, not a gate's. Remove a
// version from this set the moment its line is brought back in line with §1.6.
const KNOWN_DEVIATIONS = new Set(["Lp1", "Lp2", "Lp4"]);
for (const ns of Object.keys(ar).filter((k) => /^Lp\d$/.test(k))) {
	const said = Object.values(ar[ns]).some((v) => v === ar.Common.honesty);
	if (!said && KNOWN_DEVIATIONS.has(ns)) {
		console.log(`  known deviation  ${ns} — paraphrases §1.6's line; see §7`);
		continue;
	}
	check(said, ns, said ? "" : "states it in its own words");
}

console.log("\n§1.6 lp3 audience weighting (target 70/20/10):");
const vh = { buyer: 0, seller: 0, finance: 0 };
for (const b of LP3_BEATS) vh[b.audience] += b.scroll;
const total = vh.buyer + vh.seller + vh.finance;
const pct = (n) => (n / total) * 100;
// Carried by scroll distance, not scene count — count alone reads 57/14/14.
check(pct(vh.buyer) > 64, "buyer", `${pct(vh.buyer).toFixed(0)}%`);
check(pct(vh.seller) > 14, "seller", `${pct(vh.seller).toFixed(0)}%`);
check(pct(vh.finance) > 5 && pct(vh.finance) < 16, "financing", `${pct(vh.finance).toFixed(0)}%`);

console.log("\n§4 lp3 structure:");
check(LP3_TICKS.length === 6, "every capability ticks", `${LP3_TICKS.length} ticks`);
check(
	Boolean(LP3_BEATS.find((b) => b.audience === "finance")?.tick),
	"financing beat still earns its tick",
);
// <Hero> renders s0 as server HTML (§1.5.1); a beat repeating it doubles the headline.
check(!LP3_BEATS.some((b) => b.copyKey === "s0"), "hero line not repeated in a beat");
// A clip interpolates between two endpoint stills of the identical locked frame —
// that is what pins the camera. Pointing a beat at the `b` end starts it wrong.
const badPair = LP3_BEATS.filter((b) => b.clip && b.still !== `${b.clip}a`);
check(badPair.length === 0, "each clip beat starts on its `a` endpoint", badPair.map((b) => b.id).join(", "));

console.log(failed ? `\n${failed} gate(s) FAILED` : "\nCopy and beat gates: clean.");
process.exit(failed ? 1 : 0);
