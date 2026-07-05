import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGES_DIR = "C:\\Users\\ernes\\AppData\\Local\\Temp\\dreams_content_images";
const BUCKET = "content-images";
const LIMIT = 30;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Falta VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function extractTema(filename) {
  const match = filename.match(/^dream_\d+_(.+)\.png$/i);
  return match ? match[1] : "unknown";
}

function sanitizeKey(filename) {
  // NFD decompõe caracteres acentuados; depois removemos combining marks (U+0300–U+036F)
  const nfd = filename.normalize("NFD");
  let result = "";
  for (const ch of nfd) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x0300 && cp <= 0x036f) continue; // combining diacritic
    if (/[a-zA-Z0-9._\-]/.test(ch)) {
      result += ch;
    } else {
      result += "_";
    }
  }
  return result;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) { console.error("Erro ao criar bucket:", error.message); process.exit(1); }
    console.log(`Bucket "${BUCKET}" criado.`);
  } else {
    console.log(`Bucket "${BUCKET}" já existe.`);
  }
}

async function run() {
  await ensureBucket();

  const files = readdirSync(IMAGES_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort()
    .slice(0, LIMIT);

  // pré-busca URLs já existentes para evitar duplicados sem precisar de UNIQUE constraint
  const { data: existing } = await supabase.from("content_bank").select("content_url");
  const existingUrls = new Set((existing || []).map((r) => r.content_url));
  console.log(`\n${files.length} ficheiros | ${existingUrls.size} registos já na BD\n`);

  let ok = 0, skipped = 0, fail = 0;

  for (const file of files) {
    const safeKey = sanitizeKey(file);
    const storagePath = `dreams/${safeKey}`;
    const { data: urlPreview } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const predictedUrl = urlPreview.publicUrl;

    if (existingUrls.has(predictedUrl)) {
      console.log(`  ↷ ${file}  [já existe na BD]`);
      skipped++;
      continue;
    }

    const fileData = readFileSync(join(IMAGES_DIR, file));
    const tema = extractTema(file);

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileData, { contentType: "image/png", upsert: true });

    if (upErr) {
      console.error(`  ✗ ${file} — upload falhou: ${upErr.message}`);
      fail++;
      continue;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: dbErr } = await supabase.from("content_bank").insert({
      type: "image",
      content_url: urlData.publicUrl,
      text: null,
      tema,
      is_ai_generated: true,
      active: true,
    });

    if (dbErr) {
      console.error(`  ✗ ${file} — insert DB falhou: ${dbErr.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${file}  [${tema}]  → ${safeKey}`);
      ok++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`  Novos: ${ok}   Já existiam: ${skipped}   Falhas: ${fail}`);
  console.log(`─────────────────────────────────`);
}

run().catch((e) => { console.error("Erro inesperado:", e); process.exit(1); });
