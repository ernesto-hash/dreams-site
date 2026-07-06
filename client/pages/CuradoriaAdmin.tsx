import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type ContentRow = {
  id: string;
  type: string;
  text: string | null;
  tema: string | null;
  content_url: string | null;
  is_ai_generated: boolean;
  active: boolean;
  status: string;
  created_at: string;
};

const COLUMNS = "id, type, text, tema, content_url, is_ai_generated, active, status, created_at";

export default function CuradoriaAdmin() {
  const { user, loading } = useAuth();
  const [pending, setPending] = useState<ContentRow[]>([]);
  const [approved, setApproved] = useState<ContentRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [error, setError] = useState("");

  async function loadRows() {
    setLoadingRows(true);
    const [{ data: pendingData }, { data: approvedData }] = await Promise.all([
      supabase.from("content_bank").select(COLUMNS).eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("content_bank").select(COLUMNS).eq("status", "approved").order("created_at", { ascending: false }),
    ]);
    setPending(pendingData || []);
    setApproved(approvedData || []);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (user) loadRows();
  }, [user]);

  async function approve(id: string) {
    setError("");
    const { error: updateError } = await supabase
      .from("content_bank")
      .update({ status: "approved", active: true })
      .eq("id", id);
    if (updateError) {
      setError(`[${updateError.code}] ${updateError.message}`);
      return;
    }
    loadRows();
  }

  async function reject(id: string) {
    setError("");
    const { error: updateError } = await supabase
      .from("content_bank")
      .update({ status: "rejected", active: false })
      .eq("id", id);
    if (updateError) {
      setError(`[${updateError.code}] ${updateError.message}`);
      return;
    }
    loadRows();
  }

  async function toggleActive(id: string, current: boolean) {
    setError("");
    const { error: updateError } = await supabase
      .from("content_bank")
      .update({ active: !current })
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
        <p className="font-cinzel text-neon-primary text-xl">Acesso restrito</p>
        <p className="text-neon-secondary/70">Precisas de sessão iniciada para ver a curadoria.</p>
        <Link to="/login" className="neon-button px-6 py-2">Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark px-4 sm:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-cinzel text-3xl text-neon-primary">Curadoria</h1>
          <Link to="/" className="text-neon-secondary/60 hover:text-neon-primary text-sm">
            ← Voltar ao site
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-500/40 bg-red-900/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <section className="mb-14">
          <h2 className="font-cinzel text-xl text-white mb-4">
            Pendentes <span className="text-neon-primary">({pending.length})</span>
          </h2>
          {loadingRows ? (
            <p className="text-neon-secondary/60">A carregar...</p>
          ) : pending.length === 0 ? (
            <p className="text-neon-secondary/50 text-sm">Nada pendente.</p>
          ) : (
            <div className="space-y-4">
              {pending.map((row) => (
                <div key={row.id} className="card-dark p-5 rounded-xl border border-neon-primary/20">
                  <p className="text-neon-primary/60 text-xs uppercase tracking-wide mb-2">
                    {row.tema || "sem tema"} · {row.type}
                  </p>
                  <p className="text-neon-secondary leading-relaxed mb-4">"{row.text}"</p>
                  <div className="flex gap-3">
                    <button onClick={() => approve(row.id)} className="neon-button px-4 py-2 text-sm">
                      Aprovar
                    </button>
                    <button
                      onClick={() => reject(row.id)}
                      className="px-4 py-2 text-sm border border-red-500/40 text-red-300 rounded-lg hover:bg-red-900/20"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-cinzel text-xl text-white mb-4">
            Aprovadas <span className="text-neon-primary">({approved.length})</span>
          </h2>
          {loadingRows ? (
            <p className="text-neon-secondary/60">A carregar...</p>
          ) : approved.length === 0 ? (
            <p className="text-neon-secondary/50 text-sm">Nenhuma dose aprovada.</p>
          ) : (
            <div className="space-y-4">
              {approved.map((row) => (
                <div
                  key={row.id}
                  className="card-dark p-5 rounded-xl border border-neon-primary/20 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-neon-primary/60 text-xs uppercase tracking-wide mb-1">
                      {row.tema || "sem tema"} · {row.type}
                    </p>
                    <p className="text-neon-secondary text-sm truncate">"{row.text}"</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <label className="flex items-center gap-2 text-xs text-neon-secondary/70">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={() => toggleActive(row.id, row.active)}
                      />
                      Ativa
                    </label>
                    <button
                      onClick={() => reject(row.id)}
                      className="px-3 py-1.5 text-xs border border-red-500/40 text-red-300 rounded-lg hover:bg-red-900/20"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
