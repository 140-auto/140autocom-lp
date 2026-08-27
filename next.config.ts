import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Board-review build. No DB, no S3: the listing handoff reads a committed
// snapshot fixture with local cover images (see scripts/snapshot-listings.mjs),
// so none of the production app's remote-image or pg config is needed here.
const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
