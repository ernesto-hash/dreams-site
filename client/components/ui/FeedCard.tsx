import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PremiumSeal from "@/components/ui/PremiumSeal";
import { staggerDelay } from "@/lib/motion";

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

export default function FeedCard({ dream, index = 0 }: { dream: FeedDream; index?: number }) {
  const relateCount = dream.dream_relations?.[0]?.count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: staggerDelay(index), ease: "easeOut" }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
    >
      <Link
        to={`/dream/${dream.slug || dream.id}`}
        className="card-dark block p-6 rounded-xl hover:shadow-glow-neon transition-shadow duration-300"
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
    </motion.div>
  );
}

export function FeedCardSkeleton() {
  return (
    <div className="card-dark p-6 rounded-xl">
      <div className="space-y-2 mb-4">
        <div className="h-3 rounded skeleton-shimmer w-full" />
        <div className="h-3 rounded skeleton-shimmer w-5/6" />
        <div className="h-3 rounded skeleton-shimmer w-4/6" />
      </div>
      <div className="flex justify-between items-center border-t border-neon-primary/10 pt-3">
        <div className="h-2.5 w-24 rounded skeleton-shimmer" />
        <div className="h-2.5 w-16 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
