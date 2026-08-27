// next-intl owns the real <html>; this root layout only satisfies Next's
// requirement that app/ has one. See app/[locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return children;
}
