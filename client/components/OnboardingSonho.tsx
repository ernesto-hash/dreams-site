import { useState } from "react";
import { Flame, Target, Zap, BookOpen, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

const DONE_KEY  = "dreams_onboarding_done";
const TEMA_KEY  = "dreams_user_tema";

const OPTIONS = [
  { icon: Flame,    label: "Rico",               sub: "Conquista & Riqueza",    tema: "ambição"          },
  { icon: Target,   label: "Atleta / Livre",      sub: "Metas & Movimento",      tema: "metas"            },
  { icon: Zap,      label: "Criador",             sub: "Criatividade & Impacto", tema: "ambição"          },
  { icon: BookOpen, label: "Disciplinado",         sub: "Foco & Consistência",    tema: "disciplina"       },
  { icon: Shield,   label: "Responsável",          sub: "Estrutura & Visão",      tema: "responsabilidade" },
] as const;

type Props = {
  onComplete: (tema: string) => void;
};

export default function OnboardingSonho({ onComplete }: Props) {
  const { user } = useAuth();
  const [picked, setPicked] = useState<string | null>(null);

  const handlePick = async (tema: string) => {
    if (picked) return;
    setPicked(tema);
    localStorage.setItem(TEMA_KEY, tema);
    localStorage.setItem(DONE_KEY, "1");

    if (user) {
      await supabase.auth.updateUser({ data: { dreams_tema: tema } });
    }

    setTimeout(() => onComplete(tema), 280);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
      {/* marca d'água / fundo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 40%, #D4AF37 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm flex flex-col items-center gap-8">
        {/* cabeçalho */}
        <div className="text-center space-y-2">
          <p className="text-neon-primary/50 text-[10px] uppercase tracking-[0.3em]">
            Monument of Dreams
          </p>
          <h1 className="font-cinzel text-2xl sm:text-3xl text-white leading-snug">
            O que queres ser?
          </h1>
          <p className="text-neon-secondary/50 text-[13px]">
            Escolhe o teu caminho
          </p>
        </div>

        {/* cards */}
        <div className="w-full grid grid-cols-2 gap-3">
          {OPTIONS.map(({ icon: Icon, label, sub, tema }, i) => {
            const isLast = i === OPTIONS.length - 1;
            const isActive = picked === tema;
            return (
              <button
                key={label}
                onClick={() => handlePick(tema)}
                disabled={!!picked}
                className={[
                  "flex flex-col items-center justify-center gap-2 py-6 px-3 rounded-2xl border transition-all duration-200 focus:outline-none",
                  isLast ? "col-span-2" : "",
                  isActive
                    ? "border-neon-primary bg-neon-primary/10 text-neon-primary scale-[0.97]"
                    : "border-neon-primary/20 bg-white/[0.03] text-neon-secondary/70 hover:border-neon-primary/40 hover:bg-white/[0.05] active:scale-[0.97]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Icon size={28} strokeWidth={1.6} />
                <span className="font-cinzel text-[13px] font-semibold">
                  {label}
                </span>
                <span className="text-[10px] opacity-55 text-center leading-tight">
                  {sub}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-neon-secondary/25 text-[11px] text-center">
          Pode ser alterado mais tarde
        </p>
      </div>
    </div>
  );
}
