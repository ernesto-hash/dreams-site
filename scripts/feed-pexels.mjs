/**
 * Seeds content_bank with real vertical Pexels photos + curated quotes from
 * quotes/<category>.json. Never deletes anything — only inserts new rows
 * (status='live' by default), skipping pexels_id and quotes already used.
 *
 * Bounded for daily automation: inserts a single batch of DAILY_BATCH_MIN..
 * DAILY_BATCH_MAX doses per run (round-robin across categories), not a full
 * ~100-row seed. Safe to run once a day via cron/GitHub Actions.
 *
 * Assumes the schema migration (tema→category, text→quote,
 * content_url→image_url, + pexels_id/image_author/aspect) has already run.
 *
 * Requires in .env (or the environment): PEXELS_KEY, and
 * (VITE_SUPABASE_URL or SUPABASE_URL) + (SUPABASE_SERVICE_ROLE_KEY or
 * SUPABASE_SERVICE_ROLE).
 */
import dotenv from "dotenv";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUOTES_DIR = path.resolve(__dirname, "..", "quotes");

const PEXELS_KEY = process.env.PEXELS_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PEXELS_KEY) {
  console.error("Missing PEXELS_KEY in the environment.");
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE/SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Bounded daily batch: total doses inserted per run across ALL categories.
const DAILY_BATCH_MIN = 15;
const DAILY_BATCH_MAX = 30;
const DAILY_BATCH_TARGET = (() => {
  const fromEnv = parseInt(process.env.DAILY_BATCH_SIZE || "", 10);
  if (Number.isFinite(fromEnv)) {
    return Math.min(DAILY_BATCH_MAX, Math.max(DAILY_BATCH_MIN, fromEnv));
  }
  return DAILY_BATCH_MIN + Math.floor(Math.random() * (DAILY_BATCH_MAX - DAILY_BATCH_MIN + 1));
})();

// Low-stock guard thresholds (override via env if needed).
const QUOTE_LOW_STOCK_THRESHOLD = parseInt(process.env.QUOTE_LOW_STOCK_THRESHOLD || "5", 10);
const LIVE_DOSES_LOW_STOCK_THRESHOLD = parseInt(process.env.LIVE_DOSES_LOW_STOCK_THRESHOLD || "50", 10);

// Search terms per category — category names are abstract, this gives
// Pexels something photographic to search for.
const CATEGORY_QUERIES = {
  ambition: ["mountain climber summit", "city skyline sunrise", "determined athlete"],
  discipline: ["early morning workout", "runner training discipline", "focused gym training"],
  money: ["luxury lifestyle", "finance wealth city", "money success"],
  financial_freedom: ["freedom travel beach", "financial independence", "yacht ocean freedom"],
  family: ["family silhouette sunset", "father son walking", "family together outdoors"],
  goals: ["target achievement", "finish line race", "success celebration"],
  mindset: ["meditation calm focus", "stoic silhouette mountain", "solitary reflection nature"],
};

const CATEGORIES = Object.keys(CATEGORY_QUERIES);

function loadQuotes(category) {
  const file = path.join(QUOTES_DIR, `${category}.json`);
  return JSON.parse(readFileSync(file, "utf-8"));
}

async function fetchExistingPexelsIds() {
  const { data, error } = await supabase.from("content_bank").select("pexels_id").not("pexels_id", "is", null);
  if (error) {
    console.error("Failed to read existing pexels_id values:", error.message);
    process.exit(1);
  }
  return new Set((data || []).map((r) => r.pexels_id));
}

async function fetchExistingSlugs() {
  const { data, error } = await supabase.from("content_bank").select("slug").not("slug", "is", null);
  if (error) {
    console.error("Failed to read existing slug values:", error.message);
    process.exit(1);
  }
  return new Set((data || []).map((r) => r.slug));
}

// English kebab-case slug from category + quote, capped at 60 chars.
// Mirrors the backfill logic in supabase_add_dose_slug.sql: on collision,
// append a numeric suffix (-2, -3, ...), trimming the base so the total
// still fits the length cap.
const SLUG_MAX_LEN = 60;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeSlug(category, quote, usedSlugs) {
  let base = slugify(`${category} ${quote}`).slice(0, SLUG_MAX_LEN).replace(/-+$/g, "");
  if (!base) base = "dose";

  let candidate = base;
  let n = 1;
  while (usedSlugs.has(candidate)) {
    n++;
    const suffix = `-${n}`;
    candidate = base.slice(0, SLUG_MAX_LEN - suffix.length) + suffix;
  }
  usedSlugs.add(candidate);
  return candidate;
}

async function fetchExistingQuotes(category) {
  const { data, error } = await supabase.from("content_bank").select("quote").eq("category", category);
  if (error) {
    console.error(`Failed to read existing quotes for ${category}:`, error.message);
    process.exit(1);
  }
  return new Set((data || []).map((r) => r.quote));
}

async function countLiveDoses() {
  const { count, error } = await supabase
    .from("content_bank")
    .select("id", { count: "exact", head: true })
    .eq("status", "live");
  if (error) {
    console.error("Failed to count live doses:", error.message);
    return null;
  }
  return count;
}

async function searchPexels(query, page) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=20&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } });
  if (!res.ok) {
    throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.photos || [];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// One feeder per category: lazily pulls Pexels photo pages and pairs each
// unused photo with the next unused quote, so the round-robin scheduler
// below can pull "one dose at a time" from whichever categories still have
// stock, instead of draining one category before moving to the next.
function makeCategoryFeeder(category, usedPexelsIds, availableQuotes) {
  const queries = CATEGORY_QUERIES[category];
  let queryIdx = 0;
  let page = 1;
  let photoBuffer = [];
  let quoteIndex = 0;
  let exhausted = availableQuotes.length === 0;

  async function fillBuffer() {
    while (photoBuffer.length === 0 && !exhausted) {
      if (queryIdx >= queries.length) {
        exhausted = true;
        return;
      }
      let photos;
      try {
        photos = await searchPexels(queries[queryIdx], page);
      } catch (err) {
        console.error(`  x [${category}] search "${queries[queryIdx]}" p${page} failed: ${err.message}`);
        queryIdx++;
        page = 1;
        continue;
      }
      await sleep(250); // Pexels rate-limit courtesy

      if (photos.length === 0 || page >= 3) {
        queryIdx++;
        page = 1;
      } else {
        page++;
      }

      photoBuffer = photos.filter((p) => !usedPexelsIds.has(p.id));
    }
  }

  return {
    category,
    quotesRemaining: () => availableQuotes.length - quoteIndex,
    isExhausted: () => exhausted,
    async next() {
      if (exhausted || quoteIndex >= availableQuotes.length) {
        exhausted = true;
        return null;
      }
      await fillBuffer();
      if (photoBuffer.length === 0) {
        exhausted = true;
        return null;
      }
      const photo = photoBuffer.shift();
      const quote = availableQuotes[quoteIndex];
      quoteIndex++;
      return { photo, quote };
    },
  };
}

async function run() {
  const usedPexelsIds = await fetchExistingPexelsIds();
  const usedSlugs = await fetchExistingSlugs();
  console.log(`${usedPexelsIds.size} pexels_id already used in the DB.`);
  console.log(`Target for this run: ${DAILY_BATCH_TARGET} doses (range ${DAILY_BATCH_MIN}-${DAILY_BATCH_MAX}).\n`);

  const feeders = [];
  const quotesRemainingAtStart = {};
  for (const category of CATEGORIES) {
    const allQuotes = loadQuotes(category);
    const usedQuotes = await fetchExistingQuotes(category);
    const availableQuotes = allQuotes.filter((q) => !usedQuotes.has(q));
    quotesRemainingAtStart[category] = availableQuotes.length;
    feeders.push(makeCategoryFeeder(category, usedPexelsIds, availableQuotes));
  }

  const insertedByCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  const failedByCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  let totalInserted = 0;

  outer: while (totalInserted < DAILY_BATCH_TARGET) {
    let anyActive = false;

    for (const feeder of feeders) {
      if (totalInserted >= DAILY_BATCH_TARGET) break outer;
      if (feeder.isExhausted()) continue;

      const pick = await feeder.next();
      if (!pick) continue;
      anyActive = true;

      const { photo, quote } = pick;
      const slug = makeSlug(feeder.category, quote, usedSlugs);
      const { error } = await supabase.from("content_bank").insert({
        type: "image",
        category: feeder.category,
        quote,
        slug,
        image_url: photo.src.large2x,
        image_author: photo.photographer,
        pexels_id: photo.id,
        aspect: "vertical",
        status: "live",
      });

      if (error) {
        console.error(`  x [${feeder.category}] insert failed (pexels_id ${photo.id}): ${error.message}`);
        failedByCategory[feeder.category]++;
      } else {
        console.log(`  + [${feeder.category}] pexels_id ${photo.id} - "${quote.slice(0, 50)}..."`);
        usedPexelsIds.add(photo.id);
        insertedByCategory[feeder.category]++;
        totalInserted++;
      }
    }

    if (!anyActive) break; // every category is exhausted, stop looping
  }

  console.log("\n─────────────────────────────────────────────");
  for (const category of CATEGORIES) {
    const remaining = quotesRemainingAtStart[category] - insertedByCategory[category];
    console.log(
      `  ${category.padEnd(18)} inserted: ${insertedByCategory[category]}   failed: ${failedByCategory[category]}   quotes remaining: ${remaining}`,
    );
  }
  console.log("─────────────────────────────────────────────");
  console.log(`  TOTAL inserted: ${totalInserted} (target was ${DAILY_BATCH_TARGET})`);
  console.log("─────────────────────────────────────────────\n");

  // Low-stock guard — surfaced as WARNING lines so they're easy to grep in
  // the GitHub Actions log / notifications.
  let anyWarning = false;
  for (const category of CATEGORIES) {
    const remaining = quotesRemainingAtStart[category] - insertedByCategory[category];
    if (remaining < QUOTE_LOW_STOCK_THRESHOLD) {
      anyWarning = true;
      console.warn(
        `WARNING: category "${category}" has only ${remaining} unused quote(s) left (threshold ${QUOTE_LOW_STOCK_THRESHOLD}). Add more quotes to quotes/${category}.json.`,
      );
    }
  }

  const liveCount = await countLiveDoses();
  if (liveCount !== null && liveCount < LIVE_DOSES_LOW_STOCK_THRESHOLD) {
    anyWarning = true;
    console.warn(
      `WARNING: only ${liveCount} live dose(s) in content_bank (threshold ${LIVE_DOSES_LOW_STOCK_THRESHOLD}).`,
    );
  }

  if (!anyWarning) {
    console.log("Stock levels OK — no low-stock warnings.");
  }
}

run().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
