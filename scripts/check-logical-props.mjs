#!/usr/bin/env node
// Logical-properties (RTL) gate -- ui.md §5.1.
//
// Fails if any Tailwind className token uses a PHYSICAL direction utility that
// has a logical equivalent, because physical directions break the Arabic RTL
// layout. Use: ps-/pe- (not pl-/pr-), ms-/me- (not ml-/mr-), start-/end-
// (not left-/right- positioning), text-start/text-end (not text-left/right),
// inset-inline-* and border-s/border-e.
//
// Precise by design: each whitespace-separated token has its Tailwind VARIANT
// prefixes stripped (everything up to the last ':') before the base utility is
// tested, so `data-[side=left]:slide-in-from-right-2` reduces to
// `slide-in-from-right-2` (an animation, not a layout direction) and is NOT
// flagged, while `sm:pl-4` reduces to `pl-4` and IS.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components"];
const EXT = /\.(tsx|ts)$/;

// base utility (after variant strip) -> matches a physical direction
const PHYSICAL = [
	/^-?(pl|pr|ml|mr)-/, // padding/margin left/right
	/^text-(left|right)$/, // text alignment
	/^-?(left|right)-/, // absolute/inset positioning
	/^border-(l|r)(-|$)/, // border side
	/^(rounded-(l|r|tl|tr|bl|br))(-|$)/, // corner radius side
];

function baseUtility(token) {
	const colon = token.lastIndexOf(":");
	return colon === -1 ? token : token.slice(colon + 1);
}

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) yield* walk(p);
		else if (EXT.test(entry)) yield p;
	}
}

const violations = [];
for (const root of ROOTS) {
	let files;
	try {
		files = [...walk(root)];
	} catch {
		continue;
	}
	for (const file of files) {
		const lines = readFileSync(file, "utf8").split("\n");
		lines.forEach((line, i) => {
			for (const raw of line.split(/[\s"'`{}()]+/)) {
				if (!raw) continue;
				const base = baseUtility(raw);
				if (PHYSICAL.some((re) => re.test(base))) {
					violations.push(`${file}:${i + 1}  ${raw}`);
				}
			}
		});
	}
}

if (violations.length) {
	console.error("Physical-direction Tailwind utilities found (use logical properties -- ui.md §5.1):\n");
	console.error(violations.join("\n"));
	console.error(`\n${violations.length} violation(s).`);
	process.exit(1);
}
console.log("Logical-properties gate: clean.");
