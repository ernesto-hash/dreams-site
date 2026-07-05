import { createClient } from "@supabase/supabase-js";

// web-push is a CommonJS module — import via createRequire (mesmo padrão de scripts/send_test_push.mjs)
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const webpush = require("web-push");

// Agendamento (ver vercel.json → crons):
// "0 21 * * *" = 21:00 UTC = 22:00 em Portugal continental no horário de verão (WEST, UTC+1).
// No horário de inverno (WET, UTC+0) isto passa a disparar às 21:00 locais —
// ajustar a expressão para "0 22 * * *" quando Portugal mudar para hora de inverno.
// No plano Hobby da Vercel o cron corre 1x/dia mas sem hora exata garantida (há uma janela de execução).

export default async function handler(req: any, res: any) {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || req.headers.authorization !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    res.status(500).json({ error: "VAPID keys not configured" });
    return;
  }

  webpush.setVapidDetails(
    "mailto:dreams@monumentofdreams.com",
    vapidPublicKey,
    vapidPrivateKey,
  );

  // Escolhe uma dose aleatória: prefere type=quote, depois qualquer texto não-nulo
  let doses;
  const { data: quoteDoses } = await supabase
    .from("content_bank")
    .select("text, tema")
    .eq("active", true)
    .eq("type", "quote")
    .not("text", "is", null)
    .limit(20);
  doses = quoteDoses;

  if (!doses?.length) {
    const { data: textDoses } = await supabase
      .from("content_bank")
      .select("text, tema")
      .eq("active", true)
      .not("text", "is", null)
      .limit(20);
    doses = textDoses;
  }

  let body = "O teu sonho aguarda. Hoje é o dia.";
  if (doses?.length) {
    const dose = doses[Math.floor(Math.random() * doses.length)];
    body = dose.text;
  }

  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (subErr) {
    res.status(500).json({ error: subErr.message });
    return;
  }

  const payload = JSON.stringify({ title: "Dreams", body });

  let enviadas = 0;
  let falhas = 0;
  const expiredIds: string[] = [];

  for (const sub of subs || []) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        { TTL: 60 * 60 * 24 },
      );
      enviadas++;
    } catch (e: any) {
      falhas++;
      if (e.statusCode === 404 || e.statusCode === 410) {
        expiredIds.push(sub.id);
      } else {
        console.error(`Erro ao enviar push para subscrição ${sub.id}:`, e.message);
      }
    }
  }

  let removidas = 0;
  if (expiredIds.length) {
    const { error: delErr } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredIds);
    if (!delErr) removidas = expiredIds.length;
  }

  res.status(200).json({ enviadas, falhas, removidas });
}
