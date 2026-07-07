import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  const { data: dreams } = await supabase
    .from("dreams")
    .select("id, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);

  const { data: doses } = await supabase
    .from("content_bank")
    .select("slug, created_at")
    .eq("status", "live")
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(10000);

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/gallery", priority: "0.9", changefreq: "daily" },
    { url: "/submit", priority: "0.8", changefreq: "weekly" },
    { url: "/dreams-about-dreams", priority: "0.7", changefreq: "weekly" },
    { url: "/dreams-that-come-true", priority: "0.7", changefreq: "weekly" },
    { url: "/dreams/flying", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/love", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/success", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/family", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/money", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/future", priority: "0.8", changefreq: "daily" },
    { url: "/dreams/fears", priority: "0.8", changefreq: "daily" },
    { url: "/dream-meanings", priority: "0.9", changefreq: "weekly" },
    { url: "/about", priority: "0.6", changefreq: "monthly" },
    { url: "/faq", priority: "0.6", changefreq: "monthly" },
    { url: "/contact", priority: "0.5", changefreq: "monthly" },
    { url: "/privacy", priority: "0.4", changefreq: "monthly" },
    { url: "/terms", priority: "0.4", changefreq: "monthly" },
    { url: "/support", priority: "0.4", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  staticPages.forEach(page => {
    xml += `
  <url>
    <loc>https://monumentofdreams.com${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  dreams?.forEach(dream => {
    const identifier = dream.slug || dream.id;
    xml += `
  <url>
    <loc>https://monumentofdreams.com/dream/${identifier}</loc>
    <lastmod>${dream.created_at?.split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });

  doses?.forEach(dose => {
    xml += `
  <url>
    <loc>https://monumentofdreams.com/dose/${dose.slug}</loc>
    <lastmod>${dose.created_at?.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(xml);
}
