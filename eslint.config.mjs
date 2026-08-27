import next from "eslint-config-next";

// Flat config (ESLint 9 / Next 16). `eslint-config-next` bundles
// next/core-web-vitals + next/typescript. The logical-properties (RTL) gate is
// a separate precise check -- see scripts/check-logical-props.mjs / `pnpm lint:rtl`
// -- because a regex-on-className ESLint rule false-positives on animation
// utilities like `slide-in-from-right-2` that are not layout direction.
const config = [
	{ ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
	...next,
];

export default config;
