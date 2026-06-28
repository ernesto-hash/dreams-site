import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Milestones() {
  const [countries, setCountries] = useState(0);
  const [totalDreams, setTotalDreams] = useState(0);

  useEffect(() => {
    async function fetchMilestones() {
      const { data } = await supabase.from("dreams").select("country");

      const unique = new Set(
        data?.map((d) => d.country).filter(Boolean)
      );

      setCountries(unique.size);

      const { count } = await supabase
        .from("dreams")
        .select("*", { count: "exact", head: true });

      setTotalDreams(count || 0);
    }

    fetchMilestones();
  }, []);

  return (
    <div className="card-dark p-6 rounded-xl">
      <h3 className="font-orbitron mb-4 text-lg">Milestones</h3>

      <p className="text-neon-secondary mb-2">
        🌍 Dreams from {countries} countries
      </p>

      <p className="text-neon-secondary">
        ✨ {totalDreams.toLocaleString()} dreams engraved
      </p>
    </div>
  );
}
