import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { TRANSITION_FAST } from "@/lib/motion";

type Props = {
  dreamId: string;
};

export default function RelateButton({ dreamId }: Props) {
  const handleRelate = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.button
      onClick={handleRelate}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={TRANSITION_FAST}
      className="mt-3 px-4 py-2 border border-neon-primary/40 rounded-lg hover:border-neon-primary hover:text-neon-primary transition-colors"
    >
      ⭐ I Relate to This
    </motion.button>
  );
}
