import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// web-push is a CommonJS module — import via createRequire
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const webpush = require("web-push");

const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;

if (!VITE_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Falta VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
if (!VITE_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.error("Falta VITE_VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY no .env");
  process.exit(1);
}

webpush.setVapidDetails(
  "mailto:dreams@monumentofdreams.com",
  VITE_VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function run() {
  // Busca todas as subscrições
  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (subErr) {
    console.error("Erro ao buscar subscrições:", subErr.message);
    process.exit(1);
  }

  if (!subs?.length) {
    console.log("Nenhuma subscrição encontrada em push_subscriptions.");
    console.log("Ativa primeiro a permissão no browser.");
    return;
  }

  // Busca uma dose aleatória com texto do content_bank
  const { data: doses } = await supabase
    .from("content_bank")
    .select("text, tema")
    .eq("active", true)
    .not("text", "is", null)
    .limit(20);

  let body = "O teu sonho aguarda. Hoje é o dia.";
  if (doses?.length) {
    const dose = doses[Math.floor(Math.random() * doses.length)];
    body = dose.text;
  }

  const payload = JSON.stringify({
    title: "Monument of Dreams",
    body,
    url: "/",
  });

  console.log(`\n📨 Enviando notificação a ${subs.length} subscrição(ões)...`);
  console.log(`   Body: "${body}"\n`);

  let ok = 0, fail = 0;
  const expired = [];

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        { TTL: 60 * 60 * 24 }
      );
      console.log(`  ✓ ${sub.endpoint.slice(0, 60)}...`);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${sub.endpoint.slice(0, 60)}... → ${e.message}`);
      fail++;
      if (e.statusCode === 410 || e.statusCode === 404) {
        expired.push(sub.id);
      }
    }
  }

  // Limpa subscrições expiradas
  if (expired.length) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
    console.log(`\n🗑  ${expired.length} subscrição(ões) expirada(s) removida(s).`);
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`  Enviadas: ${ok}   Falhas: ${fail}`);
  console.log(`─────────────────────────────────`);
}

run().catch((e) => { console.error("Erro inesperado:", e); process.exit(1); });
