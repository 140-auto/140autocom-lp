/**
 * One-time, read-only snapshot of real listings for the §1.6 handoff beat.
 *
 * This is a standalone board-review app with no database. Run once, commit the
 * output, never run again in normal work.
 *
 * Two things this must get right:
 *   1. NEVER `SELECT *` on oc.* — the production app connects as a
 *      least-privilege role and only the granted projection columns exist to
 *      it. Columns are enumerated to mirror PUBLIC_LISTING_SELECT.
 *   2. `cover_src` in the production query is a ONE-HOUR presigned S3 URL. A
 *      committed fixture holding those URLs is dead within the hour, so each
 *      cover image is downloaded to public/lp/listings/ and the path rewritten.
 *
 *   node scripts/snapshot-listings.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import path from "node:path";
import pg from "pg";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SIBLING = "/Users/ezzat/140Auto/140autocom";
const OUT_JSON = "lib/listings-snapshot.json";
const OUT_IMG = "public/lp/listings";
const LIMIT = 12;

function env() {
	const raw = readFileSync(path.join(SIBLING, ".env.local"), "utf8");
	const out = {};
	for (const line of raw.split("\n")) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
	}
	return out;
}

const E = env();
// Mirror lib/db.ts:19 — strip sslmode from the URL so it cannot override the
// explicit TLS config below (pg v9 changed its semantics; RDS presents a chain
// node does not have a root for).
const dbUrl = new URL(E.DATABASE_URL);
dbUrl.searchParams.delete("sslmode");
const client = new pg.Client({
	connectionString: dbUrl.toString(),
	ssl: { rejectUnauthorized: false },
});

const SELECT = `
  l.id, l.year, l.mileage, l.location, l.price, l.condition, l.is_new,
  l.exterior_color, l.paint_condition, l.interior_condition,
  m.name AS model_name, m.body_style, m.fuel_type, m.transmission,
  mk.name AS make_name`;

await client.connect();
const { rows } = await client.query(
	`SELECT ${SELECT},
	        (SELECT s3_key FROM oc.listing_media lm
	          WHERE lm.listing_id = l.id AND lm.media_type = 'image'
	            AND lm.is_soft_deleted = false
	          ORDER BY lm.display_order LIMIT 1) AS cover_key
	   FROM oc.listings l
	   JOIN oc.models m ON l.model_id = m.id
	   JOIN oc.makes mk ON m.make_id = mk.id
	  WHERE l.status = 'available'
	    -- The handoff beat shows a real price divided into a real monthly
	    -- figure, and an inspection needs a real odometer. Rows missing either
	    -- cannot carry the beat, so they are excluded rather than rendered blank.
	    AND l.price IS NOT NULL AND l.mileage IS NOT NULL
	    AND EXISTS (SELECT 1 FROM oc.listing_media lm2
	                 WHERE lm2.listing_id = l.id AND lm2.media_type = 'image'
	                   AND lm2.is_soft_deleted = false)
	  ORDER BY l.updated_at DESC
	  LIMIT $1`,
	[LIMIT],
);
await client.end();

mkdirSync(OUT_IMG, { recursive: true });
const s3 = new S3Client({
	region: E.S3_REGION ?? "eu-north-1",
	credentials: { accessKeyId: E.S3_ACCESS_KEY_ID, secretAccessKey: E.S3_SECRET_ACCESS_KEY },
});

const out = [];
for (const r of rows) {
	let cover = null;
	if (r.cover_key) {
		const file = `${r.id}.jpg`;
		const dest = path.join(OUT_IMG, file);
		if (!existsSync(dest)) {
			const url = await getSignedUrl(
				s3,
				new GetObjectCommand({ Bucket: "internal-listings", Key: r.cover_key }),
				{ expiresIn: 600 },
			);
			const res = await fetch(url);
			if (res.ok) await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
		}
		if (existsSync(dest)) cover = `/lp/listings/${file}`;
	}
	const { cover_key, ...rest } = r;
	out.push({ ...rest, price: String(rest.price), cover });
}

writeFileSync(OUT_JSON, JSON.stringify(out, null, "\t") + "\n");
console.log(`wrote ${out.length} listings, ${out.filter((l) => l.cover).length} with covers`);
