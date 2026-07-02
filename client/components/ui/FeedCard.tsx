import { Link } from "react-router-dom";
import PremiumSeal from "@/components/ui/PremiumSeal";

export type FeedDream = {
  id: string;
  slug?: string | null;
  description?: string | null;
  author?: string | null;
  country?: string | null;
  created_at?: string | null;
  is_featured?: boolean | null;
  dream_relations?: { count: number }[];
};

function formatDate(dateString?: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FeedCard({ dream }: { dream: FeedDream }) {
  const relateCount = dream.dream_relations?.[0]?.count || 0;

  return (
    <Link
      to={`/dream/${dream.slug || dream.id}`}
      className="card-dark block p-6 rounded-xl hover:shadow-glow-neon transition"
    >
      <p className="text-neon-secondary leading-relaxed mb-4 line-clamp-5">
        "{dream.description}"
      </p>

      <div className="flex justify-between items-center text-xs text-neon-secondary/60 border-t border-neon-primary/20 pt-3">
        <span className="flex items-center gap-2">
          {dream.author || "Anonymous"}
          {dream.country ? ` — ${dream.country}` : ""}
          <PremiumSeal active={dream.is_featured} />
        </span>
        <span>{formatDate(dream.created_at)}</span>
      </div>

      <div className="mt-3 text-xs text-neon-primary">
        ⭐ {relateCount} {relateCount === 1 ? "person relates" : "people relate"} to this
      </div>
    </Link>
  );
}
