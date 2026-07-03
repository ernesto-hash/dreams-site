import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 10;

type ContentItem = {
  id: string;
  type: string;
  content_url: string | null;
  text: string | null;
  tema: string | null;
  is_ai_generated: boolean;
  active: boolean;
  created_at: string;
};

export default function FeedDoses() {
  const [items, setItems] = useState<ContentItem[]>([]);
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
      .from("content_bank")
      .select("id, type, content_url, text, tema, is_ai_generated, active, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setItems((prev) => (from === 0 ? data : [...prev, ...data]));
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

  if (items.length === 0 && !loading) return null;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-5 py-6">
      {items.map((item) => (
        <article
          key={item.id}
          className="relative rounded-2xl overflow-hidden bg-black border border-neon-primary/20 min-h-[440px] flex flex-col justify-end shadow-lg"
        >
          {item.content_url ? (
            <img
              src={item.content_url}
              alt={item.tema || "dream"}
              className="absolute inset-0 w-full h-full object-cover opacity-55"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(212,175,55,0.15) 0%, #080808 75%)",
              }}
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.08) 100%)",
            }}
          />

          {item.is_ai_generated && (
            <span className="absolute top-3 right-3 z-10 text-[10px] font-semibold text-neon-primary bg-black/70 border border-neon-primary/40 px-2 py-0.5 rounded-full tracking-wide">
              ✦ Curated
            </span>
          )}

          <div className="relative z-10 p-5 pb-6">
            {item.tema && (
              <p className="text-neon-primary/60 text-[10px] uppercase tracking-[0.2em] mb-2">
                {item.tema}
              </p>
            )}
            {item.text && (
              <p className="font-cinzel text-white text-[15px] leading-relaxed line-clamp-6">
                "{item.text}"
              </p>
            )}
            <p className="text-neon-secondary/35 text-[10px] mt-3">
              {new Date(item.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </article>
      ))}

      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
        </div>
      )}

      {!loading && !hasMore && items.length > 0 && (
        <p className="text-center text-neon-secondary/35 text-[11px] py-6 tracking-widest uppercase">
          — End —
        </p>
      )}

      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}
