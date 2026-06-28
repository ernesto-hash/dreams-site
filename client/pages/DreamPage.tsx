import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";

type Dream = {
  id: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  country?: string | null;
  language?: string | null;
  contact?: string | null;
  likes?: number | null;
  views?: number | null;
  category?: string | null;
  created_at?: string | null;
};

const localLikedKey = (id: string) => `liked_dream_${id}`;

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function DreamPage() {
  const { id: param } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [related, setRelated] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!param) return;

    async function fetchDream() {
      setLoading(true);
      setError(null);

      // Try slug lookup first, fall back to id
      let { data, error: fetchError } = await supabase
        .from("dreams")
        .select("*")
        .eq("slug", param)
        .single();

      if (fetchError || !data) {
        // UUID fallback
        const res = await supabase
          .from("dreams")
          .select("*")
          .eq("id", param)
          .single();

        if (res.error || !res.data) {
          setError("Dream not found.");
          setLoading(false);
          return;
        }

        data = res.data;

        // Redirect to canonical slug URL if the dream has a slug
        if (data.slug) {
          navigate(`/dream/${data.slug}`, { replace: true });
          return;
        }
      }

      // Increment views
      await supabase
        .from("dreams")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", data.id);

      setDream({ ...data, views: (data.views || 0) + 1 });

      // Fetch related dreams by same category
      if (data.category) {
        const { data: relatedData } = await supabase
          .from("dreams")
          .select("id, slug, title, author, country")
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(6);
        setRelated(relatedData || []);
      }

      setLoading(false);
    }

    fetchDream();
  }, [param, navigate]);

  const handleLike = async () => {
    if (!dream) return;
    if (localStorage.getItem(localLikedKey(dream.id))) return;

    const { error: rpcError } = await supabase.rpc("increment_dream_likes", {
      p_dream_id: dream.id,
    });
    if (rpcError) return;

    localStorage.setItem(localLikedKey(dream.id), "1");
    setDream({ ...dream, likes: (dream.likes || 0) + 1 });
  };

  const dreamCanonical = dream
    ? `https://monumentofdreams.com/dream/${dream.slug || dream.id}`
    : undefined;

  if (loading) return <p className="text-center py-20 text-neon-secondary/70">Loading...</p>;
  if (error || !dream) return <p className="text-center py-20 text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title={`${dream.title || "Untitled Dream"} — Monument of Dreams`}
        description={`${(dream.description || "").substring(0, 150)}… Share your dream on Monument of Dreams.`}
        canonical={dreamCanonical}
        ogType="article"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
        <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
          {dream.title || "Untitled Dream"}
        </h1>

        <p className="text-neon-secondary font-rajdhani text-base mb-6 leading-relaxed">
          {dream.description}
        </p>

        <div className="flex justify-between items-center mb-8 border-t border-neon-primary/20 pt-4">
          <div>
            <p className="text-sm font-exo2 text-neon-primary">{dream.author || "Anonymous"}</p>
            <p className="text-xs text-neon-secondary/60">{dream.country || "Unknown"}</p>
            <p className="text-xs text-neon-secondary/40">{formatDate(dream.created_at)}</p>
            <p className="text-xs text-neon-secondary/40">Views: {dream.views || 0}</p>
          </div>

          <button
            onClick={handleLike}
            aria-label="Like this dream"
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-exo2 ${
              localStorage.getItem(localLikedKey(dream.id))
                ? "opacity-60 cursor-default border border-neon-primary/30"
                : "bg-neon-primary text-dark-bg"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{dream.likes || 0}</span>
          </button>
        </div>

        {/* CONTACT — shown if the author left a handle */}
        {dream.contact && (
          <div className="mb-8 p-4 card-dark rounded-xl border border-neon-primary/20">
            <p className="text-sm text-neon-secondary/70 mb-1">The dreamer left a way to connect:</p>
            <p className="text-neon-primary font-exo2 break-all">{dream.contact}</p>
          </div>
        )}

        {/* RELATED DREAMS */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-orbitron text-xl text-neon-primary mb-6">
              People who share this dream
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <a
                  key={r.id}
                  href={`/dream/${r.slug || r.id}`}
                  className="card-dark p-4 rounded-xl hover:scale-[1.02] transition-transform duration-200 block"
                >
                  <p className="font-orbitron text-sm text-white font-semibold line-clamp-2 mb-2">
                    {r.title || "Untitled Dream"}
                  </p>
                  <p className="text-xs text-neon-secondary/60">
                    {r.author || "Anonymous"} — {r.country || "Unknown"}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
