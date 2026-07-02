import { PREMIUM_ENABLED } from "@/lib/premium";

export default function PremiumSeal({ active }: { active?: boolean | null }) {
  if (!PREMIUM_ENABLED || !active) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-neon-primary border border-neon-primary/40 rounded-full px-2 py-0.5 animate-glow">
      ✦ Premium
    </span>
  );
}
