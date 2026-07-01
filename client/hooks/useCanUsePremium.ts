import { useAuth } from "@/context/AuthContext";
import { PREMIUM_ENABLED } from "@/lib/premium";

export function useCanUsePremium(): boolean {
  const { profile } = useAuth();
  return !PREMIUM_ENABLED || !!profile?.is_premium;
}
