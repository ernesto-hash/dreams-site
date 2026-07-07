/**
 * Serverless-rendered HTML for /category/:slug (via the /category/:slug ->
 * /api/category?category=:slug rewrite in vercel.json). Static filename on
 * purpose — mirrors api/dose.ts exactly, which is the pattern proven to work
 * on this project's Vercel "vite" zero-config setup (bracket dynamic-segment
 * filenames were not reliably detected as routable functions here).
 *
 * Serves a real, crawlable grid of live doses for one of the 7 known
 * categories, fetched from Supabase on every request — no build-time
 * snapshot to go stale as scripts/feed-pexels.mjs adds doses daily.
 *
 * Real browsers get this same HTML first, then the normal client bundle boots
 * on top of it (see client/main.tsx's `data-ssr="light"` check) and takes
 * over with the full interactive DoseCategoryPage.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

const SITE_URL = "https://monumentofdreams.com";
const GTAG_ID = "G-MRY5XXZGPF";
const BUILT_INDEX_PATH = path.join(process.cwd(), "dist", "spa", "index.html");

// The 7 content_bank categories (see scripts/feed-pexels.mjs's CATEGORY_QUERIES).
// Deliberately a different taxonomy from the "dreams" table's /dreams/:category
// (flying/love/success/family/money/future/fears) — money and family overlap in
// name but refer to a different table/route.
const KNOWN_CATEGORIES = [
  "ambition",
  "discipline",
  "money",
  "financial_freedom",
  "family",
  "goals",
  "mindset",
];

const DOSES_PER_CATEGORY_PAGE = 24;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCategoryLabel(category: string | null): string {
  if (!category) return "Dreams";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// See api/dose.ts for why this reads the built index.html rather than trying
// to hardcode or reuse its <body> markup.
function extractBuiltAssetTags(): string {
  try {
    const html = readFileSync(BUILT_INDEX_PATH, "utf-8");
    const matches = html.match(
      /<(script|link)[^>]+(?:src|href)="\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g,
    );
    return (matches || []).join("\n    ");
  } catch (err) {
    console.error("[api/category] failed to read built index.html for asset tags:", err);
    return "";
  }
}

function renderNotFound(res: any) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Category Not Found — Monument of Dreams</title>
    <meta name="robots" content="noindex" />
  </head>
  <body style="background:#0A0A0A;color:#fff;font-family:sans-serif;text-align:center;padding:80px 20px;">
    <p>This category doesn't exist.</p>
    <a href="/feed" style="color:#D4AF37;">Back to the Feed</a>
  </body>
</html>`;

  res.status(404);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(html);
}

export default async function handler(req: any, res: any) {
  const categoryParam = req.query.category;
  const category = Array.isArray(categoryParam) ? categoryParam[0] : categoryParam;

  if (!category || !KNOWN_CATEGORIES.includes(category)) {
    renderNotFound(res);
    return;
  }

  const { data, error } = await supabase
    .from("content_bank")
    .select("id, slug, category, quote, image_url, image_author, created_at")
    .eq("category", category)
    .eq("status", "live")
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(DOSES_PER_CATEGORY_PAGE);

  if (error) {
    console.error("[api/category] Supabase query failed:", error.message);
  }

  const doses = data || [];
  const categoryLabel = formatCategoryLabel(category);
  const article = /^[aeiou]/i.test(categoryLabel) ? "an" : "a";
  const title = `${categoryLabel} — Daily Doses | Monument of Dreams`;
  const description = `Browse ${categoryLabel} doses — daily quotes and images from Monument of Dreams to keep you moving. ${article[0].toUpperCase()}${article.slice(1)} new dose is added every day.`;
  const canonical = `${SITE_URL}/category/${category}`;
  const image = doses[0]?.image_url || `${SITE_URL}/og-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: canonical,
    about: categoryLabel,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: doses.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/dose/${d.slug}`,
        name: d.quote ? (d.quote.length > 70 ? `${d.quote.slice(0, 70)}…` : d.quote) : categoryLabel,
      })),
    },
  };

  const assetTags = extractBuiltAssetTags();

  const cardsHtml = doses
    .map((d) => {
      const quote = d.quote || "";
      const truncated = quote.length > 140 ? `${quote.slice(0, 140)}…` : quote;
      return `
        <a class="card" href="/dose/${d.slug}">
          ${d.image_url ? `<img src="${escapeHtml(d.image_url)}" alt="${escapeHtml(categoryLabel)}" loading="lazy" />` : ""}
          <div class="overlay"></div>
          ${truncated ? `<p class="quote">&ldquo;${escapeHtml(truncated)}&rdquo;</p>` : ""}
        </a>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="/favicon.ico?v=3" />

    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${escapeHtml(image)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    <script async src="https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GTAG_ID}');
    </script>

    ${assetTags}

    <style>
      #category-ssr { background:#0A0A0A; min-height:100vh; padding:48px 20px; box-sizing:border-box; }
      #category-ssr .eyebrow { color:#D4AF37; text-transform:uppercase; letter-spacing:0.25em; font-size:12px; margin:0 0 12px; text-align:center; }
      #category-ssr h1 { color:#fff; font-family:Georgia, serif; font-size:32px; margin:0 0 32px; text-align:center; }
      #category-ssr .grid { display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; max-width:960px; margin:0 auto; }
      @media (min-width:640px) { #category-ssr .grid { grid-template-columns:repeat(3, 1fr); } }
      @media (min-width:1024px) { #category-ssr .grid { grid-template-columns:repeat(4, 1fr); } }
      #category-ssr .card { position:relative; display:block; aspect-ratio:3/4; border-radius:12px; overflow:hidden; background:#000; border:1px solid rgba(212,175,55,0.15); text-decoration:none; }
      #category-ssr .card img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.6; }
      #category-ssr .card .overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%); }
      #category-ssr .card .quote { position:relative; z-index:1; color:#fff; font-family:Georgia, serif; font-size:12px; line-height:1.4; padding:12px; margin:0; position:absolute; bottom:0; left:0; right:0; }
      #category-ssr .empty { color:rgba(255,255,255,0.5); text-align:center; padding:40px 0; }
      #category-ssr .back { display:block; text-align:center; margin-top:32px; color:#D4AF37; text-decoration:none; }
    </style>
  </head>
  <body>
    <div id="root" data-ssr="light">
      <div id="category-ssr">
        <p class="eyebrow">Daily Doses</p>
        <h1>${escapeHtml(categoryLabel)}</h1>
        <div class="grid">
          ${cardsHtml || `<p class="empty">No doses in this category yet.</p>`}
        </div>
        <a class="back" href="/feed">&larr; Back to the Feed</a>
      </div>
    </div>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
