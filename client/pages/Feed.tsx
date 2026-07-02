import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import FeedCard, { FeedDream } from "@/components/ui/FeedCard";

const PAGE_SIZE = 15;

export default function Feed() {
  const [dreams, setDreams] = useState<FeedDream[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const fetchMore = async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const from = offsetRef.current;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("dreams")
      .select("id, slug, description, author, country, created_at, dream_relations(count)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setDreams((prev) => (from === 0 ? data : [...prev, ...data]));
      offsetRef.current = from + PAGE_SIZE;
      const more = data.length === PAGE_SIZE;
      hasMoreRef.current = more;
      setHasMore(more);
    }

    loadingRef.current = false;
    setLoading(false);
  };

  const fetchMoreRef = useRef(fetchMore);
  useEffect(() => {
    fetchMoreRef.current = fetchMore;
  });

  useEffect(() => {
    fetchMoreRef.current();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMoreRef.current();
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
            </div>
          )}

          {!loading && !hasMore && dreams.length > 0 && (
            <p className="text-center text-neon-secondary/50 text-sm py-8">
              You've reached the end.
            </p>
          )}

          {!loading && dreams.length === 0 && (
            <p className="text-center text-neon-secondary/40 text-sm py-16">
              No dreams yet.
            </p>
          )}

          <div ref={sentinelRef} className="h-px" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
