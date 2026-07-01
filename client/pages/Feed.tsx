import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import FeedCard, { FeedDream } from "@/components/ui/FeedCard";

const PAGE_SIZE = 15;

export default function Feed() {
  const [dreams, setDreams] = useState<FeedDream[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (pageNumber: number) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("dreams")
      .select("id, slug, description, author, country, created_at, dream_relations(count)")
      .order("created_at", { ascending: false })
      .range(from, to);

    setDreams((prev) => (pageNumber === 0 ? data || [] : [...prev, ...(data || [])]));
    if (!data || data.length < PAGE_SIZE) setHasMore(false);

    setLoading(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          const next = page + 1;
          setPage(next);
          loadPage(next);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, hasMore, loadPage]);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Dream Feed — Monument of Dreams"
        description="Scroll through dreams shared by people around the world, newest first."
        canonical="https://monumentofdreams.com/feed"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-10 text-center">
            Dream Feed
          </h1>

          <div className="flex flex-col gap-6">
            {dreams.map((dream) => (
              <FeedCard key={dream.id} dream={dream} />
            ))}
          </div>

          {loading && (
            <p className="text-center text-neon-secondary/70 py-8">Loading...</p>
          )}

          {!hasMore && dreams.length > 0 && (
            <p className="text-center text-neon-secondary/50 text-sm py-8">
              You've reached the end.
            </p>
          )}

          <div ref={sentinelRef} className="h-px" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
