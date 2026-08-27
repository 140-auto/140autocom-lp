import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/router/pathname -- use these instead of next/navigation
// and next/link everywhere so an "as-needed" localePrefix (bare / for ar,
// /en for en) is preserved on every navigation, not just the initial load.
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
