-- ============================================================================
-- Monument of Dreams — restrict /admin/curadoria to admins only.
-- Paste into the Supabase SQL Editor and run top to bottom.
-- ============================================================================


-- ============================================================================
-- 1) profiles.is_admin
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Set your account as admin.
UPDATE public.profiles
SET is_admin = true
WHERE id = 'e6500cad-aba3-4032-86f7-805f1c3c4b06';


-- ============================================================================
-- 2) content_bank RLS — authenticated select/update now require is_admin.
-- Public read of status='live' is a separate, already-existing policy and
-- is intentionally left untouched by this script.
-- ============================================================================

DROP POLICY IF EXISTS "authenticated all select" ON public.content_bank;
DROP POLICY IF EXISTS "authenticated update" ON public.content_bank;

CREATE POLICY "admin all select"
  ON public.content_bank
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "admin update"
  ON public.content_bank
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );


-- ============================================================================
-- 3) Verify — run this after and check the output (see chat for what to look for).
-- ============================================================================

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'content_bank'
ORDER BY cmd, policyname;
