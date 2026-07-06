import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Seo from "@/components/Seo";
import ShareableCard from "@/components/ShareableCard";

const PAGE_SIZE = 30;

type ContentItem = {
  id: string;
  image_url: string;
  quote: string | null;
  category: string | null;
  is_ai_generated: boolean;
};

export default function Discover() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ContentItem | null>(null);
  const [sharing, setSharing] = useState<ContentItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
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
      .select("id, image_url, quote, category, is_ai_generated")
      .eq("status", "live")
      .not("image_url", "is", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setItems((prev) => (from === 0 ? data : [...prev, ...data]));
      offsetRef.current = from + PAGE_SIZE;
      hasMoreRef.current = data.length === PAGE_SIZE;
    }

    loadingRef.current = false;
    setLoading(false);
  };

  const fetchMoreRef = useRef(fetchMore);
  useEffect(() => { fetchMoreRef.current = fetchMore; });
  useEffect(() => { fetchMoreRef.current(); }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchMoreRef.current(); },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // fecha modal com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Seo
        title="Discover — Monument of Dreams"
        description="Explore dream images curated from around the world."
        canonical="https://monumentofdreams.com/descobrir"
      />
      <Header />

      <main className="pt-16">
        {items.length === 0 && !loading && (
          <p className="text-center text-neon-secondary/40 text-sm py-24">
            No images yet.
          </p>
        )}

        <div className="grid grid-cols-3 gap-[2px]">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="relative aspect-square overflow-hidden bg-dark-card focus:outline-none"
            >
              <img
                src={item.image_url}
                alt={item.category || "dream"}
                className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-80"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
          </div>
        )}

        <div ref={sentinelRef} className="h-px" />
      </main>

      {sharing && (
        <ShareableCard item={sharing} onClose={() => setSharing(null)} />
      )}

      {/* Modal de detalhe */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/88 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-sm bg-black border border-neon-primary/20 rounded-2xl overflow-hidden shadow-glow-neon"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.image_url}
              alt={selected.category || "dream"}
              className="w-full aspect-square object-cover"
            />

            <div className="p-5">
              {selected.category && (
                <p className="text-neon-primary/60 text-[10px] uppercase tracking-[0.2em] mb-2">
                  {selected.category}
                </p>
              )}
              {selected.quote && (
                <p className="font-cinzel text-white text-[14px] leading-relaxed">
                  "{selected.quote}"
                </p>
              )}
              {selected.is_ai_generated && (
                <span className="mt-4 inline-block text-[10px] font-semibold text-neon-primary border border-neon-primary/40 px-2 py-0.5 rounded-full tracking-wide">
                  ✦ Curated
                </span>
              )}
            </div>

            <button
              onClick={() => { setSharing(selected); setSelected(null); }}
              aria-label="Partilhar"
              className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/60 border border-neon-primary/20 flex items-center justify-center text-neon-secondary/50 hover:text-neon-primary transition-colors"
            >
              <Share2 size={13} />
            </button>

            <button
              onClick={() => setSelected(null)}
              aria-label="Fechar"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-neon-secondary/60 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
