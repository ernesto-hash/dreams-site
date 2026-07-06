/**
 * Semeia content_bank com fotos verticais reais da Pexels API + citações
 * curadas de quotes/<category>.json. Não apaga nada — só insere linhas novas
 * (status='live' por defeito), evitando pexels_id e quotes já usados.
 *
 * Assume que a migração do schema (tema→category, text→quote,
 * content_url→image_url, + pexels_id/image_author/aspect) já correu.
 *
 * Requer no .env: PEXELS_KEY, e (VITE_SUPABASE_URL ou SUPABASE_URL) +
 * (SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SERVICE_ROLE).
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
  console.error("Falta PEXELS_KEY no .env");
  process.exit(1);
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Falta SUPABASE_URL/VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE/SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const PER_CATEGORY = 15; // 7 categorias × 15 ≈ 105 (~100 pedido)

// Termos de pesquisa por categoria — os nomes das categorias são abstratos,
// isto dá à Pexels algo de fotográfico para procurar.
const CATEGORY_QUERIES = {
  ambition: ["mountain climber summit", "city skyline sunrise", "determined athlete"],
  discipline: ["early morning workout", "runner training discipline", "focused gym training"],
  money: ["luxury lifestyle", "finance wealth city", "money success"],
  financial_freedom: ["freedom travel beach", "financial independence", "yacht ocean freedom"],
  family: ["family silhouette sunset", "father son walking", "family together outdoors"],
  goals: ["target achievement", "finish line race", "success celebration"],
  mindset: ["meditation calm focus", "stoic silhouette mountain", "solitary reflection nature"],
};

function loadQuotes(category) {
  const file = path.join(QUOTES_DIR, `${category}.json`);
  return JSON.parse(readFileSync(file, "utf-8"));
}

async function fetchExistingPexelsIds() {
  const { data, error } = await supabase.from("content_bank").select("pexels_id").not("pexels_id", "is", null);
  if (error) {
    console.error("Erro a ler pexels_id existentes:", error.message);
    process.exit(1);
  }
  return new Set((data || []).map((r) => r.pexels_id));
}

async function fetchExistingQuotes(category) {
  const { data, error } = await supabase.from("content_bank").select("quote").eq("category", category);
  if (error) {
    console.error(`Erro a ler quotes existentes de ${category}:`, error.message);
    process.exit(1);
  }
  return new Set((data || []).map((r) => r.quote));
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

async function seedCategory(category, usedPexelsIds) {
  const allQuotes = loadQuotes(category);
  const usedQuotes = await fetchExistingQuotes(category);
  const availableQuotes = allQuotes.filter((q) => !usedQuotes.has(q));

  const queries = CATEGORY_QUERIES[category];
  let inserted = 0;
  let failed = 0;
  let quoteIndex = 0;

  for (const query of queries) {
    if (inserted >= PER_CATEGORY || quoteIndex >= availableQuotes.length) break;

    for (let page = 1; page <= 3; page++) {
      if (inserted >= PER_CATEGORY || quoteIndex >= availableQuotes.length) break;

      let photos;
      try {
        photos = await searchPexels(query, page);
      } catch (err) {
        console.error(`  ✗ [${category}] pesquisa "${query}" p${page} falhou: ${err.message}`);
        break;
      }
      if (photos.length === 0) break;

      for (const photo of photos) {
        if (inserted >= PER_CATEGORY || quoteIndex >= availableQuotes.length) break;
        if (usedPexelsIds.has(photo.id)) continue;

        const quote = availableQuotes[quoteIndex];
        const { error } = await supabase.from("content_bank").insert({
          type: "image",
          category,
          quote,
          image_url: photo.src.large2x,
          image_author: photo.photographer,
          pexels_id: photo.id,
          aspect: "vertical",
          status: "live",
        });

        if (error) {
          console.error(`  ✗ [${category}] insert falhou (pexels_id ${photo.id}): ${error.message}`);
          failed++;
        } else {
          console.log(`  ✓ [${category}] pexels_id ${photo.id} — "${quote.slice(0, 50)}..."`);
          usedPexelsIds.add(photo.id);
          inserted++;
        }
        quoteIndex++;
      }

      await sleep(250); // cortesia para o rate limit da Pexels
    }
  }

  return { inserted, failed, quotesAvailable: availableQuotes.length };
}

async function run() {
  const usedPexelsIds = await fetchExistingPexelsIds();
  console.log(`${usedPexelsIds.size} pexels_id já usados na BD.\n`);

  const summary = [];
  for (const category of Object.keys(CATEGORY_QUERIES)) {
    console.log(`── ${category} ──`);
    const result = await seedCategory(category, usedPexelsIds);
    summary.push({ category, ...result });
    console.log("");
  }

  console.log("─────────────────────────────────────────────");
  let totalInserted = 0;
  for (const s of summary) {
    console.log(`  ${s.category.padEnd(18)} inserted: ${s.inserted}   failed: ${s.failed}   quotes disponíveis: ${s.quotesAvailable}`);
    totalInserted += s.inserted;
  }
  console.log("─────────────────────────────────────────────");
  console.log(`  TOTAL inseridas: ${totalInserted}`);
  console.log("─────────────────────────────────────────────");
}

run().catch((e) => {
  console.error("Erro inesperado:", e);
  process.exit(1);
});
