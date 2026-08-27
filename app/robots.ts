import type { MetadataRoute } from "next";

// §7: these pages are for the board only. Nothing here is public.
export default function robots(): MetadataRoute.Robots {
	return { rules: [{ userAgent: "*", disallow: "/" }] };
}
