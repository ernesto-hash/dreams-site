import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGES_DIR = "C:\\Users\\ernes\\AppData\\Local\\Temp\\dreams_content_images_v2";
const BUCKET = "content-images";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Falta VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function sanitizeKey(filename) {
  const nfd = filename.normalize("NFD");
  let result = "";
  for (const ch of nfd) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x0300 && cp <= 0x036f) continue;
    if (/[a-zA-Z0-9._\-]/.test(ch)) { result += ch; } else { result += "_"; }
  }
  return result;
}

async function run() {
  const files = readdirSync(IMAGES_DIR)
    .filter((f) => f.endsWith(".png"))
    .sort();

  console.log(`\n${files.length} ficheiros a sobrescrever no bucket "${BUCKET}"\n`);

  let ok = 0, fail = 0;

  for (const file of files) {
    const safeKey = sanitizeKey(file);
    const storagePath = `dreams/${safeKey}`;
    const fileData = readFileSync(join(IMAGES_DIR, file));

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileData, { contentType: "image/png", upsert: true });

    if (error) {
      console.error(`  ✗ ${file} — ${error.message}`);
      fail++;
    } else {
      console.log(`  ✓ ${safeKey}`);
      ok++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`  Sobrescritos: ${ok}   Falhas: ${fail}`);
  console.log(`─────────────────────────────────`);
}

run().catch((e) => { console.error("Erro inesperado:", e); process.exit(1); });
