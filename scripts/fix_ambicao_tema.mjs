import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function run() {
  // The 8 ambição records have tema stored with garbled Latin-1 chars.
  // Fetch and identify them by checking for the garbled Ã sequence.
  const { data, error } = await supabase
    .from("content_bank")
    .select("id, tema")
    .ilike("tema", "%Ã%");

  if (error) { console.error("Fetch error:", error.message); process.exit(1); }

  console.log(`Found ${data?.length ?? 0} records to fix:`);
  data?.forEach(r => console.log(`  ${r.id} → "${r.tema}"`));

  if (!data?.length) { console.log("Nothing to fix."); return; }

  const ids = data.map(r => r.id);
  const { error: updErr } = await supabase
    .from("content_bank")
    .update({ tema: "ambição" })
    .in("id", ids);

  if (updErr) { console.error("Update error:", updErr.message); process.exit(1); }
  console.log(`\n✓ ${ids.length} records updated to tema = "ambição"`);
}

run().catch(e => { console.error(e); process.exit(1); });
