import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Seo from "@/components/Seo";
import PremiumSeal from "@/components/ui/PremiumSeal";

type Dream = {
  id: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  country?: string | null;
  likes?: number | null;
  views?: number | null;
  created_at?: string | null;
  is_featured?: boolean | null;
};

export default function Gallery() {
  const [wishes, setWishes] = useState<Dream[]>([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "popular" | "views" | "featured" | "trending"
  >("newest");

  const [hasMore, setHasMore] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    likes: 0,
    views: 0,
  });

  const localLikedKey = (id: string) => `liked_dream_${id}`;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // 🔥 realtime listener
  useEffect(() => {
    const channel = supabase
      .channel("dreams-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dreams" },
        (payload) => {
          setWishes((prev) => [payload.new as Dream, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // stats globais
  useEffect(() => {
    async function fetchStats() {
      const { data, count } = await supabase
        .from("dreams")
        .select("country, likes, views", { count: "exact" });

      if (!data) return;

      const countries = new Set(data.map((d) => d.country)).size;
      const likes = data.reduce((a, b) => a + (b.likes || 0), 0);
      const views = data.reduce((a, b) => a + (b.views || 0), 0);

      setStats({
        total: count ?? data.length,
        countries,
        likes,
        views,
      });
    }

    fetchStats();
  }, []);

  useEffect(() => {
    setPage(0);
    setWishes([]);
    setHasMore(true);
    fetchPage(0);
  }, [sortBy]);

  async function fetchPage(pageNumber: number) {
    if (pageNumber === 0) setLoading(true);
    else setLoadingMore(true);

    const from = pageNumber * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let query = supabase.from("dreams").select("id, slug, title, description, author, country, likes, views, created_at, is_featured");

    if (sortBy === "popular") query = query.gt("likes", 0);
    if (sortBy === "featured") query = query.eq("is_featured", true);

    if (sortBy === "newest")
      query = query.order("created_at", { ascending: false });

    if (sortBy === "popular")
      query = query.order("likes", { ascending: false });

    if (sortBy === "views")
      query = query.order("views", { ascending: false });

    if (sortBy === "trending")
      query = query
        .order("likes", { ascending: false })
        .order("views", { ascending: false })
        .order("created_at", { ascending: false });

    const { data } = await query.range(from, to);

    setWishes((prev) =>
      pageNumber === 0 ? data || [] : [...prev, ...(data || [])]
    );

    if (!data || data.length < itemsPerPage) setHasMore(false);

    setLoading(false);
    setLoadingMore(false);
  }

  const loadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  };

  const handleLike = async (dreamId: string, index: number) => {
    if (localStorage.getItem(localLikedKey(dreamId))) return;

    await supabase.rpc("increment_dream_likes", {
      p_dream_id: dreamId,
    });

    localStorage.setItem(localLikedKey(dreamId), "1");

    setWishes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        likes: (next[index].likes || 0) + 1,
      };
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Dream Gallery — Browse All Dreams | Monument of Dreams"
        description="Browse thousands of dreams shared by people from over 50 countries. Filter by newest, trending, or most loved dreams."
        canonical="https://monumentofdreams.com/gallery"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-orbitron text-4xl text-white mb-4">
            Global Dream Gallery
          </h1>

          {/* stats */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm text-neon-secondary">
            <span>{stats.total} Dreams</span>
            <span>{stats.countries} Countries</span>
            <span>{stats.likes} Likes</span>
            <span>{stats.views} Views</span>
          </div>

          {/* filters */}
          <div className="flex flex-wrap gap-3 mb-10">
            {["newest", "popular", "views", "featured", "trending"].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s as any)}
                className={`px-4 py-2 rounded ${
                  sortBy === s
                    ? "bg-neon-primary text-dark-bg"
                    : "border border-neon-primary/30 text-neon-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishes.map((d, idx) => (
                <Link
                  to={`/dream/${d.slug || d.id}`}
                  key={d.id}
                  className="card-dark p-6 rounded-lg hover:shadow-glow-neon transition"
                >
                  <PremiumSeal active={d.is_featured} />

                  {d.likes! > 20 && (
                    <span className="text-xs text-red-400 ml-2">
                      🔥 Trending
                    </span>
                  )}

                  <p className="text-neon-secondary line-clamp-4 mt-3 mb-4">
                    "{d.description}"
                  </p>

                  <div className="text-xs text-neon-secondary/60">
                    {d.author} — {formatDate(d.created_at)}
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleLike(d.id, idx);
                    }}
                    className="mt-3 text-sm"
                  >
                    ❤️ {d.likes || 0}
                  </button>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="text-center mt-10">
              <button onClick={loadMore}>
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}