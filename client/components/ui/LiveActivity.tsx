import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Activity = {
  country?: string | null;
  created_at?: string | null;
};

export default function LiveActivity() {
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("live-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dreams" },
        (payload) => {
          setActivity(payload.new as Activity);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!activity) return null;

  return (
    <p className="text-neon-secondary text-sm text-center">
      🌍 Someone from {activity.country || "Somewhere"} submitted a dream just now
    </p>
  );
}
