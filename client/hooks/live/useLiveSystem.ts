// src/hooks/live/useLiveSystem.ts
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useLiveSystem() {
  useEffect(() => {
    const channel = supabase
      .channel("global-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dreams" },
        (payload) => {
          console.log("Live Event:", payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
