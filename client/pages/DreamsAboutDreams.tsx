import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function DreamsAboutDreams() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Seo
        title="Dreams About Dreams — The Meaning & History of Dreaming | Monument of Dreams"
        description="Explore why dreams have shaped human history, identity, and purpose. Discover the role of dreams across cultures and generations."
        canonical="https://monumentofdreams.com/dreams-about-dreams"
      />
      <Header />

      <main className="relative z-10 px-6 pt-32 pb-28 max-w-5xl mx-auto">
        {/* HERO TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-orbitron text-3xl sm:text-5xl font-bold mb-14 text-center"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 20px rgba(127,90,240,0.3)",
                "0 0 40px rgba(127,90,240,0.6)",
                "0 0 20px rgba(127,90,240,0.3)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Dreams About Dreams
          </motion.span>
        </motion.h1>

        {/* INTRO CARD */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="card-dark backdrop-blur-xl border border-neon-primary/20 rounded-3xl p-8 sm:p-12 mb-20"
        >
          <div className="space-y-6 text-neon-secondary/90 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto text-center">
            <p>
              Dreams have always been an essential part of the human experience.
              Long before technology, nations, or written language, people dreamed.
              Dreams shaped beliefs, guided decisions, and inspired hope.
            </p>
            <p>
              Across cultures and generations, dreams have represented more than
              imagination. They reflect our desires, fears, purpose, and the
              direction we wish our lives to take.
            </p>
          </div>
        </motion.div>

        {/* CONTENT SECTIONS */}
        {[
          {
            title: "The Role of Dreams in Human History",
            text: [
              "Throughout history, dreams have influenced religions, art, science, and personal identity. Ancient civilizations believed dreams carried messages, guidance, and meaning beyond the visible world.",
              "Even today, dreams continue to shape ambitions, life goals, and the stories people tell about who they are and who they want to become.",
            ],
          },
          {
            title: "Dreams as Identity and Purpose",
            text: [
              "A dream is often the purest expression of identity. It reveals what matters deeply to a person, beyond expectations or external pressure.",
              "Without dreams, progress slows. With them, people find motivation, resilience, and a reason to move forward even in uncertain times.",
            ],
          },
          {
            title: "Why Modern Dreams Are Often Forgotten",
            text: [
              "In a fast-paced digital world, dreams are easily overlooked. They become fleeting thoughts, lost between notifications, routines, and constant distractions.",
              "Many dreams are never written, shared, or remembered — not because they lack value, but because there is no place to preserve them.",
            ],
          },
          {
            title: "Preserving Dreams in a Digital World",
            text: [
              "Monument of Dreams was created to give dreams permanence. Not as temporary thoughts, but as digital monuments that reflect human aspirations across cultures and generations.",
              "By preserving dreams, we preserve stories, values, and the shared hope that connects people everywhere.",
            ],
          },
        ].map((section, index) => (
          <motion.section
            key={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="card-dark backdrop-blur-lg border border-neon-primary/20 rounded-3xl p-8 sm:p-12 mb-16 transition cursor-default"
          >
            <h2 className="font-orbitron text-xl sm:text-2xl mb-4">
              {section.title}
            </h2>
            <div className="space-y-4 text-neon-secondary/90">
              {section.text.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.section>
        ))}

        {/* CONCLUSION */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mt-24 text-center"
        >
          <div className="card-dark border border-neon-primary/30 rounded-3xl p-10 sm:p-14 max-w-3xl mx-auto shadow-glow-neon">
            <p className="text-neon-secondary/90 text-lg sm:text-xl leading-relaxed">
              Every dream matters. Some remain personal, others shape the world —
              but all deserve to be remembered.
            </p>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}