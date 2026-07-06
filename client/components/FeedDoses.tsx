import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ShareableCard, { type ShareItem } from "@/components/ShareableCard";

const PAGE_SIZE = 10;

type ContentItem = {
  id: string;
  type: string;
  image_url: string | null;
  quote: string | null;
  category: string | null;
  is_ai_generated: boolean;
  status: string;
  created_at: string;
};

type FeedRowProps = {
  category?: string;
  label?: string;
};

export function FeedRow({ category, label }: FeedRowProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharingItem, setSharingItem] = useState<ShareItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

    const base = supabase
      .from("content_bank")
      .select("id, type, image_url, quote, category, is_ai_generated, status, created_at")
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error } = await (category ? base.eq("category", category) : base);

    if (!error && data) {
      setItems((prev) => (from === 0 ? data : [...prev, ...data]));
      offsetRef.current = from + PAGE_SIZE;
      hasMoreRef.current = data.length === PAGE_SIZE;
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
    const container = scrollRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMoreRef.current();
      },
      { root: container, rootMargin: "0px 300px 0px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (items.length === 0 && !loading) return null;

  return (
    <>
    {sharingItem && (
      <ShareableCard item={sharingItem} onClose={() => setSharingItem(null)} />
    )}
    <div className="w-full">
      {label && (
        <p className="font-cinzel text-neon-primary/70 text-[11px] uppercase tracking-[0.22em] px-4 mb-3">
          {label}
        </p>
      )}

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory px-4 pb-2"
      >
        {items.map((item) => (
          <article
            key={item.id}
            className="relative flex-shrink-0 w-[75vw] max-w-[320px] h-[480px] rounded-2xl overflow-hidden bg-black border border-neon-primary/20 snap-start shadow-lg flex flex-col justify-end"
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.category || "dream"}
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

            {/* share button */}
            <button
              onClick={(e) => { e.stopPropagation(); setSharingItem(item); }}
              aria-label="Share"
              className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-black/55 border border-neon-primary/25 flex items-center justify-center text-neon-secondary/45 hover:text-neon-primary hover:border-neon-primary/60 transition-all"
            >
              <Share2 size={13} />
            </button>

            <div className="relative z-10 p-4 pb-5">
              {item.category && (
                <p className="text-neon-primary/60 text-[10px] uppercase tracking-[0.2em] mb-2">
                  {item.category}
                </p>
              )}
              {item.quote && (
                <p className="font-cinzel text-white text-[14px] leading-relaxed line-clamp-5">
                  "{item.quote}"
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
          <div className="flex-shrink-0 w-14 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
          </div>
        )}

        <div ref={sentinelRef} className="flex-shrink-0 w-1" />
      </div>
    </div>
    </>
  );
}

const LABEL_MAP: Record<string, string> = {
  ambition: "Ambition",
  discipline: "Discipline",
  money: "Money",
  financial_freedom: "Financial Freedom",
  family: "Family",
  goals: "Goals",
  mindset: "Mindset",
};

const ALL_CATEGORIES = ["ambition", "discipline", "money", "financial_freedom", "family", "goals", "mindset"];

type FeedDosesProps = {
  userTema?: string | null;
  onResetTema?: () => void;
};

export default function FeedDoses({ userTema, onResetTema }: FeedDosesProps) {
  if (userTema) {
    const others = ALL_CATEGORIES.filter((c) => c !== userTema);
    return (
      <div className="w-full py-4 space-y-10">
        {/* header "For You" with Change button */}
        <div className="flex items-center justify-between px-4">
          <p className="font-cinzel text-neon-primary/70 text-[11px] uppercase tracking-[0.22em]">
            For You · {LABEL_MAP[userTema] ?? userTema}
          </p>
          <button
            onClick={onResetTema}
            className="text-[10px] text-neon-secondary/35 hover:text-neon-secondary/70 transition-colors underline underline-offset-2"
          >
            Change
          </button>
        </div>
        <FeedRow category={userTema} />

        {others.map((c) => (
          <FeedRow key={c} category={c} label={LABEL_MAP[c]} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full py-4 space-y-10">
      <FeedRow label="Latest Dreams" />
    </div>
  );
}
