/**
 * Tenta verificar/criar a tabela push_subscriptions via Supabase Management API.
 * Se não tiver acesso à Management API, imprime o SQL para correr no dashboard.
 */
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = createClient(VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SQL = `
-- Tabela de subscrições push
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz default now()
);

-- RLS: activar segurança por linha
alter table public.push_subscriptions enable row level security;

-- Qualquer visitante pode subscrever (insert público)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'push_subscriptions'
    and policyname  = 'anon_insert'
  ) then
    execute $policy$
      create policy "anon_insert"
        on public.push_subscriptions
        for insert
        to anon, authenticated
        with check (true)
    $policy$;
  end if;
end;
$$;
`;

async function run() {
  // Testa se a tabela já existe (o cliente Supabase lança excepção se a tabela não estiver no schema cache)
  let tableExists = false;
  try {
    const { error } = await supabase.from("push_subscriptions").select("id").limit(1);
    tableExists = !error;
  } catch {
    tableExists = false;
  }

  if (tableExists) {
    console.log("✓ Tabela push_subscriptions já existe e está acessível.");
    return;
  }

  {
    // tabela não existe — tenta criar via Management API
    const projectRef = new URL(VITE_SUPABASE_URL).hostname.split(".")[0];
    const mgmtUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

    console.log("Tabela não encontrada. A tentar criar via Management API...");
    console.log("(Requer SUPABASE_ACCESS_TOKEN no .env — personal access token do supabase.com)\n");

    const pat = process.env.SUPABASE_ACCESS_TOKEN;
    if (pat) {
      const res = await fetch(mgmtUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${pat}`,
        },
        body: JSON.stringify({ query: SQL }),
      });
      if (res.ok) {
        console.log("✓ Tabela criada com sucesso via Management API!");
        return;
      }
      console.error("✗ Management API falhou:", await res.text());
    }

    // Fallback: imprime o SQL
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Corre este SQL no Supabase Dashboard → SQL Editor:");
    console.log("  https://supabase.com/dashboard/project/xqnipcqrvwrzttcbpizg/sql");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(SQL);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Depois de correr o SQL, reinicia o servidor e testa a subscrição.");
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
