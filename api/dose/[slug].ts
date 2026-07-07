/**
 * Serverless-rendered HTML for /dose/:slug (via the /dose/:slug -> /api/dose/:slug
 * rewrite in vercel.json). Serves real, crawlable markup for every dose — including
 * ones inserted by scripts/feed-pexels.mjs seconds ago, since this looks the row up
 * in Supabase on every request instead of relying on a build-time snapshot.
 *
 * Real browsers get this same HTML first, then the normal client bundle boots on
 * top of it (see client/main.tsx's `data-ssr="light"` check) and takes over with
 * the full interactive DosePage. Nothing here needs to match that component's
 * markup — it only needs to be valid, real content for crawlers/link-unfurlers
 * that don't execute JS.
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

// Vite appends the hashed module script + modulepreload + stylesheet tags to
// </head> at build time. Grab those verbatim from the real build output so this
// hand-written page loads the exact same JS/CSS bundle as everything else,
// without ever hardcoding a hashed filename here (they change every deploy).
// Deliberately ignores <body> — react-snap may or may not have populated it,
// and either way it's irrelevant since we write our own body below.
function extractBuiltAssetTags(): string {
  try {
    const html = readFileSync(BUILT_INDEX_PATH, "utf-8");
    const matches = html.match(
      /<(script|link)[^>]+(?:src|href)="\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g,
    );
    return (matches || []).join("\n    ");
  } catch (err) {
    console.error("[api/dose] failed to read built index.html for asset tags:", err);
    return "";
  }
}

function renderNotFound(res: any) {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dose Not Found — Monument of Dreams</title>
    <meta name="robots" content="noindex" />
  </head>
  <body style="background:#0A0A0A;color:#fff;font-family:sans-serif;text-align:center;padding:80px 20px;">
    <p>This dose doesn't exist.</p>
    <a href="/feed" style="color:#D4AF37;">Back to the Feed</a>
  </body>
</html>`;

  res.status(404);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(html);
}

export default async function handler(req: any, res: any) {
  const slugParam = req.query.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  if (!slug) {
    renderNotFound(res);
    return;
  }

  const { data: dose, error } = await supabase
    .from("content_bank")
    .select("id, slug, category, quote, image_url, image_author, created_at")
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (error || !dose) {
    renderNotFound(res);
    return;
  }

  const categoryLabel = formatCategoryLabel(dose.category);
  const article = /^[aeiou]/i.test(categoryLabel) ? "an" : "a";
  const quote = dose.quote || "";
  const truncatedQuote = quote.length > 70 ? `${quote.slice(0, 70)}…` : quote;
  const title = quote
    ? `"${truncatedQuote}" — ${categoryLabel} | Monument of Dreams`
    : `${categoryLabel} | Monument of Dreams`;
  const description = quote
    ? `"${quote}" — ${article} ${categoryLabel} dose from Monument of Dreams.`
    : `${article[0].toUpperCase()}${article.slice(1)} ${categoryLabel} dose from Monument of Dreams.`;
  const canonical = `${SITE_URL}/dose/${dose.slug}`;
  const image = dose.image_url || `${SITE_URL}/og-image.jpg`;
  const datePublished = dose.created_at ? new Date(dose.created_at).toISOString() : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: quote,
    image,
    genre: "motivation",
    inLanguage: "en",
    url: canonical,
  };
  if (datePublished) jsonLd.datePublished = datePublished;
  if (dose.image_author) jsonLd.creditText = dose.image_author;

  const assetTags = extractBuiltAssetTags();

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
    <meta property="og:type" content="article" />
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
      #dose-ssr { background:#0A0A0A; min-height:100vh; display:flex; flex-direction:column; justify-content:flex-end; position:relative; overflow:hidden; }
      #dose-ssr img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
      #dose-ssr .overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.15) 100%); }
      #dose-ssr .content { position:relative; z-index:1; padding:48px 24px; max-width:640px; margin:0 auto; width:100%; box-sizing:border-box; }
      #dose-ssr .category { color:#D4AF37; text-transform:uppercase; letter-spacing:0.25em; font-size:12px; margin:0 0 16px; }
      #dose-ssr blockquote { color:#fff; font-size:28px; line-height:1.5; margin:0; font-family:Georgia, serif; }
      #dose-ssr .credit { color:rgba(255,255,255,0.35); font-size:11px; margin-top:24px; }
      #dose-ssr a { color:#D4AF37; }
    </style>
  </head>
  <body>
    <div id="root" data-ssr="light">
      <div id="dose-ssr">
        ${dose.image_url ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(categoryLabel)}" />` : ""}
        <div class="overlay"></div>
        <div class="content">
          <p class="category">${escapeHtml(categoryLabel)}</p>
          ${quote ? `<blockquote>&ldquo;${escapeHtml(quote)}&rdquo;</blockquote>` : ""}
          ${dose.image_author ? `<p class="credit">Photo by ${escapeHtml(dose.image_author)}</p>` : ""}
          <p style="margin-top:32px;"><a href="/feed">&larr; Back to the Feed</a></p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
