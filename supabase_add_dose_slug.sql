-- ============================================================================
-- Monument of Dreams — SEO Phase A: add a unique slug to every dose.
-- Paste into the Supabase SQL Editor and run top to bottom.
-- ============================================================================


-- ============================================================================
-- 1) content_bank.slug
-- Nullable text column. Backfilled below for existing live doses; every
-- future dose (scripts/feed-pexels.mjs) writes its own slug at insert time.
-- ============================================================================

ALTER TABLE public.content_bank
  ADD COLUMN IF NOT EXISTS slug text;

-- Partial unique index (ignores NULLs) so rows without a slug yet don't
-- block each other, but no two doses can ever share a slug.
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_bank_slug
  ON public.content_bank (slug)
  WHERE slug IS NOT NULL;


-- ============================================================================
-- 2) Backfill — generates a kebab-case slug from category + quote for every
-- existing live dose that doesn't have one yet. English only (this is the
-- English site), capped at 60 chars, collisions resolved with a -2, -3, ...
-- numeric suffix (trimming the base so the total still fits in 60 chars).
-- Processed in created_at order so backfill runs are deterministic/repeatable.
-- ============================================================================

DO $$
DECLARE
  rec RECORD;
  base_slug   text;
  candidate   text;
  suffix_num  int;
  suffix_txt  text;
  max_len     int := 60;
BEGIN
  FOR rec IN
    SELECT id, category, quote
    FROM public.content_bank
    WHERE status = 'live' AND slug IS NULL
    ORDER BY created_at ASC, id ASC
  LOOP
    base_slug := lower(coalesce(rec.category, '') || ' ' || coalesce(rec.quote, ''));
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');   -- strip punctuation
    base_slug := regexp_replace(base_slug, '[\s_]+', '-', 'g');        -- spaces -> hyphens
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');            -- collapse repeats
    base_slug := trim(both '-' from base_slug);
    base_slug := substring(base_slug from 1 for max_len);
    base_slug := trim(both '-' from base_slug);                       -- clean truncation edge

    IF base_slug = '' THEN
      base_slug := 'dose';
    END IF;

    candidate  := base_slug;
    suffix_num := 1;

    WHILE EXISTS (SELECT 1 FROM public.content_bank WHERE slug = candidate) LOOP
      suffix_num := suffix_num + 1;
      suffix_txt := '-' || suffix_num::text;
      candidate  := substring(base_slug from 1 for max_len - length(suffix_txt)) || suffix_txt;
    END LOOP;

    UPDATE public.content_bank SET slug = candidate WHERE id = rec.id;
  END LOOP;
END $$;


-- ============================================================================
-- 3) Verify — run this after and eyeball the output.
-- ============================================================================

SELECT id, category, slug, left(quote, 50) AS quote_preview
FROM public.content_bank
WHERE status = 'live'
ORDER BY created_at DESC
LIMIT 20;

-- Sanity check: should return 0 rows (no live dose left without a slug,
-- no duplicate slugs).
SELECT slug, count(*)
FROM public.content_bank
WHERE status = 'live'
GROUP BY slug
HAVING count(*) > 1 OR slug IS NULL;
