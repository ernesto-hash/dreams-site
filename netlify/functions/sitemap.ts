import { createClient } from "@supabase/supabase-js";
import type { Handler } from "@netlify/functions";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE = "https://monumentofdreams.com";

const staticPages = [
  { url: "/",                    priority: "1.0", changefreq: "daily" },
  { url: "/gallery",             priority: "0.9", changefreq: "daily" },
  { url: "/submit",              priority: "0.8", changefreq: "weekly" },
  { url: "/dreams-about-dreams", priority: "0.7", changefreq: "weekly" },
  { url: "/dreams-that-come-true", priority: "0.7", changefreq: "weekly" },
  { url: "/dream-meanings",      priority: "0.9", changefreq: "weekly" },
  { url: "/dreams/flying",       priority: "0.8", changefreq: "daily" },
  { url: "/dreams/love",         priority: "0.8", changefreq: "daily" },
  { url: "/dreams/success",      priority: "0.8", changefreq: "daily" },
  { url: "/dreams/family",       priority: "0.8", changefreq: "daily" },
  { url: "/dreams/money",        priority: "0.8", changefreq: "daily" },
  { url: "/dreams/future",       priority: "0.8", changefreq: "daily" },
  { url: "/dreams/fears",        priority: "0.8", changefreq: "daily" },
  { url: "/about",               priority: "0.6", changefreq: "monthly" },
  { url: "/faq",                 priority: "0.6", changefreq: "monthly" },
];

export const handler: Handler = async () => {
  const { data: dreams } = await supabase
    .from("dreams")
    .select("id, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `\n  <url>\n    <loc>${BASE}${page.url}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
  }

  for (const dream of dreams ?? []) {
    const identifier = dream.slug || dream.id;
    const lastmod = dream.created_at?.split("T")[0] ?? "";
    xml += `\n  <url>\n    <loc>${BASE}/dream/${identifier}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
  }

  xml += `\n</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
    body: xml,
  };
};
