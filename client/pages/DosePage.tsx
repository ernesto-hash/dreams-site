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

function formatCategoryLabel(category: string | null): string {
  if (!category) return "Dreams";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DOSE_COLUMNS = "id, slug, category, quote, image_url, image_author, created_at";

export default function DosePage() {
  const { slug } = useParams<{ slug: string }>();
  const [dose, setDose] = useState<Dose | null>(null);
  const [more, setMore] = useState<Dose[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setDose(null);
    setMore([]);

    async function fetchDose() {
      const { data, error } = await supabase
        .from("content_bank")
        .select(DOSE_COLUMNS)
        .eq("slug", slug)
        .eq("status", "live")
        .single();

      if (cancelled) return;

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setDose(data);

      if (data.category) {
        const { data: moreData } = await supabase
          .from("content_bank")
          .select(DOSE_COLUMNS)
          .eq("category", data.category)
          .eq("status", "live")
          .neq("id", data.id)
          .limit(24);

        if (!cancelled) {
          setMore(shuffle(moreData || []).slice(0, 8));
        }
      }

      setLoading(false);
    }

    fetchDose();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-neon-primary/30 border-t-neon-primary animate-spin" />
      </div>
    );
  }

  if (notFound || !dose) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col">
        <Seo
          title="Dose Not Found — Monument of Dreams"
          description="The dose you are looking for does not exist."
        />
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-20">
          <div className="text-center">
            <p className="font-cinzel text-neon-primary/70 text-xs uppercase tracking-[0.22em] mb-4">
              Monument of Dreams
            </p>
            <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              This dose doesn't exist
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

  const categoryLabel = formatCategoryLabel(dose.category);
  const description = dose.quote
    ? `"${dose.quote}" — a ${categoryLabel} dose from Monument of Dreams.`
    : `A ${categoryLabel} dose from Monument of Dreams.`;

  return (
    <div className="min-h-screen bg-black">
      <Seo
        title={`${categoryLabel} — Monument of Dreams`}
        description={description}
        canonical={`https://monumentofdreams.com/dose/${dose.slug}`}
        ogImage={dose.image_url || undefined}
        ogType="article"
      />
      <Header />

      <main>
        {/* HERO */}
        <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
          {dose.image_url ? (
            <img
              src={dose.image_url}
              alt={categoryLabel}
              className="absolute inset-0 w-full h-full object-cover"
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
                "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.35) 100%)",
            }}
          />

          <Link
            to="/feed"
            className="absolute top-24 left-4 sm:left-8 z-10 text-neon-secondary/70 hover:text-neon-primary text-sm font-exo2 transition-colors"
          >
            ← Back
          </Link>

          <div className="relative z-10 px-6 sm:px-10 pb-16 sm:pb-24 max-w-2xl mx-auto w-full">
            <p className="text-neon-primary/80 text-xs uppercase tracking-[0.25em] mb-4 font-exo2">
              {categoryLabel}
            </p>
            {dose.quote && (
              <p className="font-cinzel text-white text-2xl sm:text-4xl leading-relaxed">
                "{dose.quote}"
              </p>
            )}
            {dose.image_author && (
              <p className="text-neon-secondary/35 text-[11px] mt-6">
                Photo by {dose.image_author}
              </p>
            )}
          </div>
        </section>

        {/* MORE LIKE THIS */}
        {more.length > 0 && (
          <section className="px-4 sm:px-8 py-16 max-w-6xl mx-auto">
            <h2 className="font-cinzel text-neon-primary/70 text-xs uppercase tracking-[0.22em] mb-8">
              More {categoryLabel} Doses
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {more.map((item, i) => (
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
                        alt={formatCategoryLabel(item.category)}
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
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
