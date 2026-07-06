import { useState } from "react";
import { Flame, Target, Zap, BookOpen, Shield, Bell, BellOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { usePushSubscription } from "@/hooks/usePushSubscription";

const DONE_KEY = "dreams_onboarding_done";
const TEMA_KEY = "dreams_user_tema";

const OPTIONS = [
  { icon: Flame,    label: "Wealth",       sub: "Ambition & Money",     tema: "money"      },
  { icon: Target,   label: "Achiever",     sub: "Goals & Momentum",     tema: "goals"      },
  { icon: Zap,      label: "Builder",      sub: "Creativity & Impact",  tema: "ambition"   },
  { icon: BookOpen, label: "Disciplined",  sub: "Focus & Consistency",  tema: "discipline" },
  { icon: Shield,   label: "Grounded",     sub: "Mindset & Family",     tema: "mindset"    },
] as const;

type Step = "tema" | "push";

type Props = {
  onComplete: (tema: string) => void;
};

export default function OnboardingSonho({ onComplete }: Props) {
  const { user } = useAuth();
  const { status: pushStatus, subscribe } = usePushSubscription();

  const [step, setStep] = useState<Step>("tema");
  const [chosenTema, setChosenTema] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const handlePick = async (tema: string) => {
    if (picked) return;
    setPicked(tema);
    setChosenTema(tema);
    localStorage.setItem(TEMA_KEY, tema);
    localStorage.setItem(DONE_KEY, "1");

    if (user) {
      await supabase.auth.updateUser({ data: { dreams_tema: tema } });
    }

    // mostra passo push após breve delay (feedback visual do card seleccionado)
    setTimeout(() => setStep("push"), 350);
  };

  const handlePushYes = async () => {
    console.log("[Onboarding] handlePushYes chamado, chosenTema:", chosenTema);
    await subscribe();
    console.log("[Onboarding] subscribe() concluido, a chamar onComplete...");
    onComplete(chosenTema!);
  };

  const handlePushSkip = () => {
    onComplete(chosenTema!);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
      {/* fundo dourado subtil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 40%, #D4AF37 0%, transparent 70%)",
        }}
      />

      {/* ── PASSO 1: escolha de tema ── */}
      {step === "tema" && (
        <div className="relative w-full max-w-sm flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <p className="text-neon-primary/50 text-[10px] uppercase tracking-[0.3em]">
              Monument of Dreams
            </p>
            <h1 className="font-cinzel text-2xl sm:text-3xl text-white leading-snug">
              What do you want to become?
            </h1>
            <p className="text-neon-secondary/50 text-[13px]">
              Choose your path
            </p>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            {OPTIONS.map(({ icon: Icon, label, sub, tema }, i) => {
              const isLast  = i === OPTIONS.length - 1;
              const isActive = picked === tema || (picked && picked !== tema && picked === tema);
              return (
                <button
                  key={label}
                  onClick={() => handlePick(tema)}
                  disabled={!!picked}
                  className={[
                    "flex flex-col items-center justify-center gap-2 py-6 px-3 rounded-2xl border transition-all duration-200 focus:outline-none",
                    isLast ? "col-span-2" : "",
                    picked === tema
                      ? "border-neon-primary bg-neon-primary/10 text-neon-primary scale-[0.97]"
                      : "border-neon-primary/20 bg-white/[0.03] text-neon-secondary/70 hover:border-neon-primary/40 hover:bg-white/[0.05] active:scale-[0.97]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon size={28} strokeWidth={1.6} />
                  <span className="font-cinzel text-[13px] font-semibold">{label}</span>
                  <span className="text-[10px] opacity-55 text-center leading-tight">{sub}</span>
                </button>
              );
            })}
          </div>

          <p className="text-neon-secondary/25 text-[11px] text-center">
            You can change this later
          </p>
        </div>
      )}

      {/* ── PASSO 2: push notifications (opcional) ── */}
      {step === "push" && (
        <div className="relative w-full max-w-sm flex flex-col items-center gap-8 text-center">
          <div className="w-20 h-20 rounded-full border border-neon-primary/30 bg-neon-primary/5 flex items-center justify-center">
            <Bell size={36} strokeWidth={1.4} className="text-neon-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="font-cinzel text-xl text-white">
              Turn on daily reminders?
            </h2>
            <p className="text-neon-secondary/50 text-[13px] leading-relaxed max-w-xs">
              Get one dose of inspiration a day — straight to your screen, no spam.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handlePushYes}
              disabled={pushStatus === "loading" || pushStatus === "subscribed"}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-neon-primary bg-neon-primary/10 text-neon-primary font-cinzel text-[13px] uppercase tracking-[0.12em] hover:bg-neon-primary/20 transition-all disabled:opacity-50"
            >
              {pushStatus === "loading" ? (
                <span className="w-4 h-4 rounded-full border-2 border-neon-primary/40 border-t-neon-primary animate-spin" />
              ) : (
                <Bell size={16} strokeWidth={1.8} />
              )}
              {pushStatus === "subscribed" ? "Enabled!" : "Yes, notify me"}
            </button>

            <button
              onClick={handlePushSkip}
              className="w-full py-3 text-neon-secondary/35 font-cinzel text-[11px] uppercase tracking-[0.12em] hover:text-neon-secondary/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <BellOff size={13} strokeWidth={1.5} />
              Not now
            </button>
          </div>

          {pushStatus === "denied" && (
            <p className="text-amber-400/70 text-[11px]">
              Notifications are blocked in your browser. You can enable them later in your browser settings.
            </p>
          )}
          {pushStatus === "unsupported" && (
            <p className="text-neon-secondary/40 text-[11px]">
              Your browser doesn't support push notifications.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
