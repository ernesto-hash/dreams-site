import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

type Dream = {
  id: string;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  country?: string | null;
  created_at?: string | null;
  likes?: number | null;
};

const categoryMeta: Record<string, { title: string; desc: string }> = {
  flying:  { title: "Dreams About Flying",        desc: "People share their flying dreams from around the world" },
  love:    { title: "Dreams About Love",          desc: "Love and relationship dreams shared by real people" },
  success: { title: "Dreams About Success",       desc: "Success and career dreams from around the world" },
  family:  { title: "Dreams About Family",        desc: "Family dreams shared by people worldwide" },
  money:   { title: "Dreams About Money",         desc: "Money and wealth dreams from real people" },
  future:  { title: "Dreams About the Future",    desc: "Future goals and dreams shared worldwide" },
  fears:   { title: "Dreams About Fears",         desc: "Overcoming fears through dreams" },
  general: { title: "Dreams",                     desc: "Dreams shared by people from around the world" },
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const meta = categoryMeta[category as keyof typeof categoryMeta] || categoryMeta.general;
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    setLoading(true);
    supabase
      .from("dreams")
      .select("id, title, description, author, country, created_at, likes")
      .eq("category", category)
      .order("likes", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setDreams(data || []);
        setLoading(false);
      });
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title={`${meta.title} | Monument of Dreams`}
        description={`${meta.desc} — Browse dreams submitted by real people on Monument of Dreams.`}
        canonical={`https://monumentofdreams.com/dreams/${category}`}
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
            {meta.title}
          </h1>
          <p className="text-neon-secondary text-lg">{meta.desc}</p>
        </div>

        {loading ? (
          <p className="text-center py-20 text-neon-secondary/70">Loading dreams...</p>
        ) : dreams.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neon-secondary/70 mb-6">No dreams in this category yet.</p>
            <Link to="/submit" className="neon-button px-6 py-3">
              Be the first — Submit Your Dream
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dreams.map(dream => (
              <Link
                key={dream.id}
                to={`/dream/${dream.id}`}
                className="card-dark p-5 rounded-xl hover:scale-[1.02] transition-transform duration-300 block"
              >
                <h2 className="font-orbitron font-semibold text-white text-base mb-3 line-clamp-2">
                  {dream.title || "Untitled Dream"}
                </h2>
                <p className="text-neon-secondary text-sm line-clamp-3 mb-4">
                  {dream.description}
                </p>
                <div className="flex justify-between items-center text-xs text-neon-secondary/60 border-t border-neon-primary/20 pt-3">
                  <span>{dream.author || "Anonymous"} — {dream.country}</span>
                  <span>♥ {dream.likes || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-neon-secondary/70 mb-4">Share your own dream and join this collection</p>
          <Link to="/submit" className="neon-button px-8 py-3">
            Submit My Dream — Free
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
