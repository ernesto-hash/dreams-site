import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import { staggerDelay } from "@/lib/motion";

type Dose = {
  id: string;
  slug: string;
  category: string | null;
  quote: string | null;
  image_url: string | null;
  image_author: string | null;
  created_at: string;
};

// Same 7 content_bank categories as api/category.ts — a different taxonomy
// from the "dreams" table's /dreams/:category (flying/love/success/etc).
const KNOWN_CATEGORIES = [
  "ambition",
  "discipline",
  "money",
  "financial_freedom",
  "family",
  "goals",
  "mindset",
];

const DOSES_PER_PAGE = 24;

function formatCategoryLabel(category: string | null): string {
  if (!category) return "Dreams";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DoseCategoryPage() {
  const { slug: category } = useParams<{ slug: string }>();
  const [doses, setDoses] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!category || !KNOWN_CATEGORIES.includes(category)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setDoses([]);

    supabase
      .from("content_bank")
      .select("id, slug, category, quote, image_url, image_author, created_at")
      .eq("category", category)
      .eq("status", "live")
      .not("slug", "is", null)
      .order("created_at", { ascending: false })
      .limit(DOSES_PER_PAGE)
      .then(({ data }) => {
        if (cancelled) return;
        setDoses(data || []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  const categoryLabel = formatCategoryLabel(category || null);

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col">
        <Seo
          title="Category Not Found — Monument of Dreams"
          description="This category doesn't exist."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-20">
          <div className="text-center">
            <p className="font-cinzel text-neon-primary/70 text-xs uppercase tracking-[0.22em] mb-4">
              Monument of Dreams
            </p>
            <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              This category doesn't exist
            </h1>
            <p className="text-neon-secondary/70 font-exo2 mb-8">
              It may have been removed, or the link is incorrect.
            </p>
            <Link to="/feed" className="neon-button">
              Back to the Feed
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Seo
        title={`${categoryLabel} — Daily Doses | Monument of Dreams`}
        description={`Browse ${categoryLabel} doses — daily quotes and images from Monument of Dreams to keep you moving.`}
        canonical={`https://monumentofdreams.com/category/${category}`}
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-neon-primary/80 text-xs uppercase tracking-[0.25em] mb-3 font-exo2">
            Daily Doses
          </p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white">
            {categoryLabel}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl skeleton-shimmer border border-neon-primary/10"
              />
            ))}
          </div>
        ) : doses.length === 0 ? (
          <p className="text-center py-20 text-neon-secondary/70">
            No doses in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {doses.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: staggerDelay(i), ease: "easeOut" }}
              >
                <Link
                  to={`/dose/${item.slug}`}
                  className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-black border border-neon-primary/15 hover:border-neon-primary/40 transition-colors"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={categoryLabel}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.05) 100%)",
                    }}
                  />
                  <div className="relative z-10 h-full flex flex-col justify-end p-3">
                    {item.quote && (
                      <p className="font-cinzel text-white text-[11px] leading-snug line-clamp-4">
                        "{item.quote}"
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
