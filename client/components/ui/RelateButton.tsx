import { supabase } from "@/lib/supabase";

type Props = {
  dreamId: string;
};

export default function RelateButton({ dreamId }: Props) {
  const handleRelate = async () => {
    let session = localStorage.getItem("session_id");

    if (!session) {
      session = crypto.randomUUID();
      localStorage.setItem("session_id", session);
    }

    await supabase.from("dream_relations").insert({
      dream_id: dreamId,
      session_id: session,
    });
  };

  return (
    <button
      onClick={handleRelate}
      className="mt-3 px-4 py-2 border border-neon-primary/40 rounded-lg"
    >
      ⭐ I Relate to This
    </button>
  );
}
