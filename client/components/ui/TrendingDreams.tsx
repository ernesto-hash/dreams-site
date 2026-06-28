import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type Dream = {
  id: string;
  description: string;
};

export default function TrendingDreams() {
  const [dreams, setDreams] = useState<Dream[]>([]);

  useEffect(() => {
    async function fetchTrending() {
      const { data } = await supabase
        .from("dreams")
        .select("id, description")
        .order("likes", { ascending: false })
        .limit(3);

      setDreams(data || []);
    }

    fetchTrending();
  }, []);

  return (
    <div>
      <h2 className="font-orbitron text-2xl mb-4">Trending Dreams</h2>

      <div className="grid gap-4">
        {dreams.map((d) => (
          <Link
            key={d.id}
            to={`/dream/${d.id}`}
            className="card-dark p-4 rounded-xl"
          >
            "{d.description}"
          </Link>
        ))}
      </div>
    </div>
  );
}
