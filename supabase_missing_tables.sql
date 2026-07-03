-- ============================================================================
-- Monument of Dreams — cria as 3 tabelas em falta: live_sessions, dream_relations, profiles
-- Colar no SQL Editor do Supabase e correr de uma vez.
-- A tabela "dreams" já existe e não é tocada por este script.
-- ============================================================================


-- ============================================================================
-- 1) live_sessions
-- Presença anónima em tempo real ("X Live Visitors Worldwide" na home).
-- Escrita: Index.tsx (upsert), client/lib/live/liveService.ts (upsert).
-- Leitura: Index.tsx e client/hooks/useLiveUsers.ts (contagem de sessões
-- recentes via last_seen, mais realtime UPDATE).
-- session_id é gerado no browser (localStorage), sem ligação a auth.users —
-- por isso a escrita é pública e sem WITH CHECK restritivo, tal como já é hoje.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.live_sessions (
  session_id  text PRIMARY KEY,
  country     text,
  city        text,
  last_seen   timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- usado pelo filtro .gte("last_seen", fiveMinutesAgo) em Index.tsx/useLiveUsers.ts
CREATE INDEX IF NOT EXISTS idx_live_sessions_last_seen ON public.live_sessions (last_seen);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Leitura pública — necessária para a contagem de visitantes e para o
-- Realtime (postgres_changes em UPDATE) entregar eventos.
CREATE POLICY "live_sessions_select_public"
  ON public.live_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert público — qualquer visitante regista a sua própria sessão anónima.
CREATE POLICY "live_sessions_insert_public"
  ON public.live_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update público — necessário para o upsert (onConflict: "session_id")
-- atualizar last_seen/country/city de uma sessão já existente.
CREATE POLICY "live_sessions_update_public"
  ON public.live_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Sem policy de DELETE — nenhum código do site apaga sessões, fica bloqueado
-- por omissão. Limpeza de sessões antigas, se vier a existir, deve ser feita
-- por um job/cron com a service_role key, fora do RLS.


-- ============================================================================
-- 2) dream_relations
-- Botão "I Relate to This" (client/components/ui/RelateButton.tsx) — regista
-- que uma sessão anónima se identificou com um sonho. Também alimenta a
-- contagem embutida dream_relations(count) usada em Feed.tsx/FeedCard.tsx,
-- e o feed ao vivo via Realtime INSERT (client/lib/socialEngine.ts).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dream_relations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id    uuid NOT NULL REFERENCES public.dreams (id) ON DELETE CASCADE,
  session_id  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  -- impede a mesma sessão anónima de inflacionar o contador ao clicar
  -- repetidamente no mesmo sonho; o insert seguinte falha em silêncio
  -- (RelateButton.tsx não trata o erro, o que é o comportamento pretendido aqui)
  UNIQUE (dream_id, session_id)
);

-- usado pelo select embutido dream_relations(count) agrupado por sonho
CREATE INDEX IF NOT EXISTS idx_dream_relations_dream_id ON public.dream_relations (dream_id);

ALTER TABLE public.dream_relations ENABLE ROW LEVEL SECURITY;

-- Leitura pública — necessária para o embed dream_relations(count) no
-- Feed/Gallery, e para o Realtime (INSERT) entregar eventos ao feed ao vivo.
CREATE POLICY "dream_relations_select_public"
  ON public.dream_relations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert público — qualquer visitante pode relacionar-se com um sonho.
-- dream_id só pode ser um sonho que exista de facto: garantido pela foreign
-- key acima, não precisa de ser repetido aqui na policy.
CREATE POLICY "dream_relations_insert_public"
  ON public.dream_relations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Sem policy de UPDATE/DELETE — nenhum código do site altera ou apaga
-- relations, fica bloqueado por omissão.


-- ============================================================================
-- 3) profiles
-- Perfil do utilizador com conta (Fase 4.1 — client/context/AuthContext.tsx,
-- client/pages/Register.tsx). 1 linha por utilizador de auth.users, criada
-- no momento do registo. avatar/bio/contact são lidos pelo AuthContext mas
-- ainda não escritos por nenhum ecrã — ficam nullable para uma fase futura.
-- is_premium é o campo da Fase 5 (gate premium, hoje sempre false/fechado).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username    text NOT NULL,
  country     text NOT NULL,
  avatar      text,
  bio         text,
  contact     text,
  is_premium  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Leitura só do próprio perfil — é tudo o que o AuthContext faz hoje
-- (select por id = utilizador com sessão ativa). Uma futura página de
-- perfil público precisaria de alargar isto (ex.: USING (true)).
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Insert só da própria linha, e só por utilizador autenticado — acontece
-- logo a seguir ao supabase.auth.signUp() em Register.tsx, com sessão já
-- ativa (confirmação de email está desligada neste projeto).
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Sem policy de UPDATE/DELETE — nenhum ecrã de edição de perfil existe
-- ainda no código, fica bloqueado por omissão até essa fase ser construída.
