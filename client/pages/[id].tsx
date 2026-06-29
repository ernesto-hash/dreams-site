import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";

export default function DreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dream, setDream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  // FETCH DREAM
  useEffect(() => {
    if (!id) return;

    async function fetchDream() {
      const { data } = await supabase
        .from("dreams")
        .select("*")
        .eq("id", id)
        .single();

      setDream(data);
      setLoading(false);

      // check local like
      const likedDreams = JSON.parse(
        localStorage.getItem("likedDreams") || "[]"
      );

      setLiked(likedDreams.includes(id));

      // increment view
      await supabase
        .from("dreams")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", id);
    }

    fetchDream();
  }, [id]);

  // REALTIME LISTENER
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel("dream-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "dreams", filter: `id=eq.${id}` },
        (payload) => {
          setDream(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // LIKE
  async function handleLike() {
    if (!dream || liked) return;

    setLikeLoading(true);

    const { data } = await supabase
      .from("dreams")
      .update({ likes: (dream.likes || 0) + 1 })
      .eq("id", dream.id)
      .select()
      .single();

    setDream(data);

    const likedDreams = JSON.parse(
      localStorage.getItem("likedDreams") || "[]"
    );

    localStorage.setItem(
      "likedDreams",
      JSON.stringify([...likedDreams, dream.id])
    );

    setLiked(true);
    setLikeLoading(false);
  }

  function shareLink() {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-neon-secondary">
        Loading dream...
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center text-neon-secondary">
        <p>Dream not found.</p>
        <button
          onClick={() => navigate("/gallery")}
          className="mt-4 px-4 py-2 bg-neon-primary text-dark-bg rounded-lg shadow-glow-neon"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title={`${dream.title} — Monument of Dreams`}
        description={dream.description?.slice(0, 160) || "A dream shared on Monument of Dreams."}
        canonical={`https://monumentofdreams.com/dream/${dream.id}`}
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
        <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
          {dream.title}
        </h1>

        <div className="text-neon-secondary mb-6 font-exo2">
          <p>
            <span className="text-neon-primary">By:</span> {dream.author}
          </p>

          {dream.country && (
            <p>
              <span className="text-neon-primary">Country:</span>{" "}
              {dream.country}
            </p>
          )}

          <p className="text-neon-secondary/60 text-sm mt-1">
            Published{" "}
            {new Date(dream.created_at).toLocaleDateString("en-US")}
          </p>

          <p className="text-neon-secondary/50 text-xs mt-1">
            👁 {dream.views || 0} views
          </p>
        </div>

        <div className="card-dark p-6 rounded-lg mb-8 leading-relaxed text-neon-secondary">
          {dream.description}
        </div>

        {/* LIKE */}
        <button
          onClick={handleLike}
          disabled={likeLoading || liked}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-glow-neon transition-all ${
            liked
              ? "bg-neon-secondary text-dark-bg"
              : "bg-neon-primary text-dark-bg hover:scale-105"
          }`}
        >
          ❤️ {dream.likes || 0}
        </button>

        {/* SHARE */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={shareLink}
            className="px-3 py-2 border border-neon-primary rounded-lg"
          >
            Copy Link
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            className="px-3 py-2 border border-neon-primary rounded-lg"
          >
            WhatsApp
          </a>

          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            className="px-3 py-2 border border-neon-primary rounded-lg"
          >
            Twitter
          </a>
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate("/gallery")}
            className="px-4 py-2 bg-dark-card text-neon-secondary border border-neon-primary/40 rounded-lg"
          >
            ← Back to Gallery
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
