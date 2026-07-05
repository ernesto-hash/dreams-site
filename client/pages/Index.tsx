import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import Seo from "@/components/Seo";

import LiveActivity from "@/components/ui/LiveActivity";
import Milestones from "@/components/ui/Milestones";
import TrendingDreams from "@/components/ui/TrendingDreams";
import RelateButton from "@/components/ui/RelateButton";
import Reveal from "@/components/ui/Reveal";
import Globe3D from "@/components/Globe3D";
import FeedDoses from "@/components/FeedDoses";
import OnboardingSonho from "@/components/OnboardingSonho";

import useSocialFeed from "@/hooks/useSocialFeed";
import SocialNotifications from "@/components/live/SocialNotifications";
import GlobalLiveFeed from "@/components/live/GlobalLiveFeed";

type Dream = {
  id: string;
  slug?: string | null;
  description?: string | null;
  author?: string | null;
  likes?: number | null;
  views?: number | null;
  created_at?: string | null;
};

type LiveEvent = {
  id: string;
  type: string;
  message: string;
  created_at: string;
};

export default function Index() {
  const [recentDreams, setRecentDreams] = useState<Dream[]>([]);
  const [dreamOfDay, setDreamOfDay] = useState<Dream | null>(null);
  const [totalDreams, setTotalDreams] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [activeCountries, setActiveCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDreamPopup, setShowDreamPopup] = useState(false);

  const [onboardingDone, setOnboardingDone] = useState(
    () => !!localStorage.getItem("dreams_onboarding_done")
  );
  const [userTema, setUserTema] = useState<string | null>(
    () => localStorage.getItem("dreams_user_tema")
  );

  const handleOnboardingComplete = (tema: string) => {
    setOnboardingDone(true);
    setUserTema(tema);
  };

  const handleResetTema = () => {
    localStorage.removeItem("dreams_onboarding_done");
    localStorage.removeItem("dreams_user_tema");
    setOnboardingDone(false);
    setUserTema(null);
  };

  const events: LiveEvent[] = useSocialFeed() || [];

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // FETCH DATA
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Recent dreams
      const { data: recent } = await supabase
        .from("dreams")
        .select("id, slug, description, author, likes, views, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentDreams(recent || []);

      // Total count
      const { count } = await supabase
        .from("dreams")
        .select("*", { count: "exact", head: true });
      setTotalDreams(count || 0);

      // Dream of the day
      const { data: allDreams } = await supabase
        .from("dreams")
        .select("id, slug, description");
      if (allDreams && allDreams.length > 0) {
        const start = new Date(new Date().getFullYear(), 0, 0).getTime();
        const dayIndex = Math.floor((Date.now() - start) / 86400000);
        setDreamOfDay(allDreams[dayIndex % allDreams.length]);
      }

      // Real distinct countries from dreams table
      const { data: countryData } = await supabase
        .from("dreams")
        .select("country")
        .not("country", "is", null)
        .limit(200);
      if (countryData) {
        const unique = [...new Set(countryData.map((d) => d.country).filter(Boolean))] as string[];
        setActiveCountries(unique);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // SHOW DREAM POPUP ONCE PER DAY
  useEffect(() => {
    if (!dreamOfDay) return;
    const today = new Date().toDateString();
    const last = localStorage.getItem("dream_popup_last_shown");
    if (!last || last !== today) {
      setShowDreamPopup(true);
      localStorage.setItem("dream_popup_last_shown", today);
    }
  }, [dreamOfDay]);

  // LIVE SESSION COUNT (real data from Supabase)
  useEffect(() => {
    const sessionId = localStorage.getItem("session_id") ||
      (typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem("session_id", sessionId);

    supabase.from("live_sessions").upsert(
      { session_id: sessionId, country: "Unknown", last_seen: new Date().toISOString() },
      { onConflict: "session_id" }
    );

    const fetchCount = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("live_sessions")
        .select("*", { count: "exact", head: true })
        .gte("last_seen", fiveMinutesAgo);
      setLiveCount(count || 0);
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // REALTIME DREAM INSERT
  useEffect(() => {
    const channel = supabase
      .channel("dreams-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dreams" },
        (payload) => {
          setRecentDreams((prev) => [payload.new as Dream, ...prev.slice(0, 2)]);
          setTotalDreams((n) => n + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // WEBSITE SCHEMA (SEO)
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Monument of Dreams",
      "url": "https://monumentofdreams.com",
      "description": "A free digital space where people from all over the world share and preserve their dreams forever.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://monumentofdreams.com/gallery?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
    document.querySelector("#website-schema")?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "website-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }, []);

  const dreamUrl = (d: Dream) => `/dream/${d.slug || d.id}`;

  return (
    <div className="min-h-screen bg-gradient-dark overflow-x-hidden">
      {!onboardingDone && (
        <OnboardingSonho onComplete={handleOnboardingComplete} />
      )}
      <Seo
        title="Monument of Dreams — Share Your Dream Free, Forever"
        description="Monument of Dreams is a free digital archive of human dreams. Share yours and connect with people around the world who dream the same thing."
        canonical="https://monumentofdreams.com/"
      />
      <Header />

      {showDreamPopup && dreamOfDay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card-dark max-w-md w-full p-6 rounded-2xl text-center">
            <h3 className="font-orbitron text-xl mb-4 text-neon-primary">
              Dream of the Day
            </h3>
            <p className="text-neon-secondary italic mb-6">
              "{dreamOfDay.description}"
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to={dreamUrl(dreamOfDay)}
                className="neon-button px-5 py-2"
                onClick={() => setShowDreamPopup(false)}
              >
                View Dream
              </Link>
              <button
                onClick={() => setShowDreamPopup(false)}
                className="px-5 py-2 border border-neon-primary/40 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 text-white container mx-auto px-4 sm:px-6">
        <div className="pt-6 pb-4">
          <LiveActivity />
        </div>

        {/* GLOBAL STATS */}
        <Reveal className="py-6 text-center space-y-2 mb-8">
          <h3 className="font-orbitron text-xl text-neon-primary">
            {totalDreams.toLocaleString()} Dreams Submitted Worldwide
          </h3>
          {liveCount > 0 && (
            <p className="text-neon-secondary text-sm">
              {liveCount.toLocaleString()} Live Visitors Worldwide
              <span className="inline-block ml-2 text-xs px-2 py-1 rounded-full bg-neon-primary/20 animate-pulse">
                Live
              </span>
            </p>
          )}
          {activeCountries.length > 0 && (
            <p className="text-neon-secondary text-xs">
              Active Countries: {activeCountries.slice(0, 8).join(", ")}
            </p>
          )}
        </Reveal>

        {/* WORLD MAP */}
        <Reveal className="mb-8">
          <Globe3D countries={activeCountries} />
        </Reveal>

        {/* FEED DOSES — experiência central */}
        <section className="mb-12">
          <FeedDoses userTema={userTema} onResetTema={handleResetTema} />
        </section>

        {/* MILESTONES */}
        <Reveal className="mb-12">
          <Milestones />
        </Reveal>

        {/* MAIN CONTENT GRID */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {dreamOfDay && (
              <section className="card-dark p-8 rounded-2xl h-full flex flex-col items-center justify-center text-center">
                <div className="text-center mb-6">
                  <h2 className="font-orbitron text-2xl mb-2 text-neon-primary">
                    Dream of the Day
                  </h2>
                  <p className="text-neon-secondary/80 text-sm">
                    Today's featured dream from our community
                  </p>
                </div>
                <div className="mb-6 w-full max-w-2xl">
                  <p className="text-neon-secondary italic text-lg leading-relaxed">
                    "{dreamOfDay.description}"
                  </p>
                </div>
                <Link to={dreamUrl(dreamOfDay)} className="neon-button px-6 py-2">
                  Explore This Dream →
                </Link>
              </section>
            )}
          </div>
          <div className="lg:col-span-1">
            <TrendingDreams />
          </div>
        </Reveal>

        {/* GLOBAL LIVE FEED */}
        <section className="mb-12">
          <GlobalLiveFeed events={events || []} />
        </section>

        {/* MANIFESTO */}
        <section className="mb-12">
          <div className="max-w-4xl mx-auto">
            <Reveal className="card-dark backdrop-blur-xl border border-neon-primary/30 rounded-3xl p-8 sm:p-12">
              <h2 className="font-orbitron text-2xl sm:text-3xl text-center mb-6">
                A Monument Built From Dreams
              </h2>
              <p className="text-neon-secondary/90 text-center max-w-3xl mx-auto">
                Dreams have always been part of human history. Monument of Dreams
                exists to preserve them — and to connect the people who share them.
              </p>
            </Reveal>
          </div>
        </section>

        {/* RECENT DREAMS */}
        <section className="mb-16">
          <h2 className="font-orbitron text-2xl mb-6">Recent Dreams</h2>
          {loading ? (
            <p className="text-center py-8">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentDreams.map((d) => (
                <Link
                  key={d.id}
                  to={dreamUrl(d)}
                  className="card-dark p-5 rounded-xl hover:scale-[1.02] transition-transform duration-300"
                >
                  <p className="text-neon-secondary line-clamp-4 mb-4 h-24">
                    "{d.description}"
                  </p>
                  <div className="flex justify-between text-xs text-neon-secondary/60 border-t border-neon-primary/20 pt-3">
                    <span>{d.author || "Anonymous"}</span>
                    <span>{formatDate(d.created_at)}</span>
                  </div>
                  <div className="mt-4">
                    <RelateButton dreamId={d.id} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <SocialNotifications events={events || []} />
      <Footer />
    </div>
  );
}
