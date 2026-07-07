import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type ContentRow = {
  id: string;
  type: string;
  quote: string | null;
  category: string | null;
  image_url: string | null;
  is_ai_generated: boolean;
  status: string;
  created_at: string;
};

const COLUMNS = "id, type, quote, category, image_url, is_ai_generated, status, created_at";

export default function CuradoriaAdmin() {
  const { user, profile, loading } = useAuth();
  const [live, setLive] = useState<ContentRow[]>([]);
  const [hidden, setHidden] = useState<ContentRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");

  async function loadRows() {
    setLoadingRows(true);
    const [{ data: liveData }, { data: hiddenData }] = await Promise.all([
      supabase.from("content_bank").select(COLUMNS).eq("status", "live").order("created_at", { ascending: false }),
      supabase.from("content_bank").select(COLUMNS).eq("status", "hidden").order("created_at", { ascending: false }),
    ]);
    setLive(liveData || []);
    setHidden(hiddenData || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (profile?.is_admin) loadRows();
  }, [profile]);

  async function setStatus(id: string, status: "live" | "hidden") {
    setError("");
    const { error: updateError } = await supabase
      .from("content_bank")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setError(`[${updateError.code}] ${updateError.message}`);
      return;
    }
    loadRows();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-neon-secondary">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="font-cinzel text-neon-primary text-xl">Restricted access</p>
        <p className="text-neon-secondary/70">You need to be logged in to view curation.</p>
        <Link to="/login" className="neon-button px-6 py-2">Login</Link>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="font-cinzel text-neon-primary text-xl">Not authorized</p>
        <p className="text-neon-secondary/70">Your account doesn't have access to curation.</p>
        <Link to="/" className="neon-button px-6 py-2">Back to site</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-cinzel text-3xl text-neon-primary">Curation</h1>
          <Link to="/" className="text-neon-secondary/60 hover:text-neon-primary text-sm">
            ← Back to site
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-500/40 bg-red-900/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <section className="mb-14">
          <h2 className="font-cinzel text-xl text-white mb-4">
            Live <span className="text-neon-primary">({live.length})</span>
          </h2>
          {loadingRows ? (
            <p className="text-neon-secondary/60">Loading...</p>
          ) : live.length === 0 ? (
            <p className="text-neon-secondary/50 text-sm">Nothing live yet.</p>
          ) : (
            <div className="space-y-4">
              {live.map((row) => (
                <div key={row.id} className="card-dark p-5 rounded-xl border border-neon-primary/20">
                  <p className="text-neon-primary/60 text-xs uppercase tracking-wide mb-2">
                    {row.category || "no category"} · {row.type}
                  </p>
                  <p className="text-neon-secondary leading-relaxed mb-4">"{row.quote}"</p>
                  <button
                    onClick={() => setStatus(row.id, "hidden")}
                    className="px-4 py-2 text-sm border border-red-500/40 text-red-300 rounded-lg hover:bg-red-900/20"
                  >
                    Hide
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-cinzel text-xl text-white mb-4">
            Hidden <span className="text-neon-primary">({hidden.length})</span>
          </h2>
          {loadingRows ? (
            <p className="text-neon-secondary/60">Loading...</p>
          ) : hidden.length === 0 ? (
            <p className="text-neon-secondary/50 text-sm">Nothing hidden.</p>
          ) : (
            <div className="space-y-4">
              {hidden.map((row) => (
                <div
                  key={row.id}
                  className="card-dark p-5 rounded-xl border border-neon-primary/20 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-neon-primary/60 text-xs uppercase tracking-wide mb-1">
                      {row.category || "no category"} · {row.type}
                    </p>
                    <p className="text-neon-secondary text-sm truncate">"{row.quote}"</p>
                  </div>
                  <button
                    onClick={() => setStatus(row.id, "live")}
                    className="neon-button px-4 py-2 text-sm flex-shrink-0"
                  >
                    Publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
