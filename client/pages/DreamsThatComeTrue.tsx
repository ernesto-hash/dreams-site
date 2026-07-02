import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import Reveal from "@/components/ui/Reveal";

export default function DreamsThatComeTrue() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Seo
        title="Dreams That Come True — How Dreams Become Reality | Monument of Dreams"
        description="Stories and reflections on how dreams transform into reality. Discover the power of belief, persistence, and shared aspiration."
        canonical="https://monumentofdreams.com/dreams-that-come-true"
      />
      <Header />

      <main className="relative z-10 px-6 pt-32 pb-28 max-w-5xl mx-auto">
        {/* HERO */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-orbitron text-3xl sm:text-5xl font-bold mb-14 text-center"
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 20px rgba(212,175,55,0.3)",
                "0 0 40px rgba(212,175,55,0.6)",
                "0 0 20px rgba(212,175,55,0.3)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Dreams That Come True
          </motion.span>
        </motion.h1>

        {/* INTRO */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="card-dark backdrop-blur-xl border border-neon-primary/20 rounded-3xl p-8 sm:p-12 mb-20"
        >
          <div className="space-y-6 text-neon-secondary/90 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto text-center">
            <p>
              Every dream begins quietly. Sometimes as a thought, sometimes as a
              feeling — often unnoticed by the world.
            </p>
            <p>
              Yet throughout history, many of the most meaningful changes began
              with a dream that someone chose to believe in.
            </p>
          </div>
        </motion.div>

        {/* SECTIONS */}
        {[
          {
            title: "From Thought to Possibility",
            text: [
              "Dreams that come true rarely appear suddenly. They evolve over time, shaped by persistence, belief, and moments of doubt.",
              "What transforms a dream into reality is not certainty, but the decision to keep it alive.",
            ],
          },
          {
            title: "Belief as the First Step",
            text: [
              "Before a dream becomes visible, it must first be believed. Belief gives direction, even when the path is unclear.",
              "Every fulfilled dream once faced uncertainty, fear, and hesitation.",
            ],
          },
          {
            title: "The Silent Power of Shared Dreams",
            text: [
              "Some dreams grow stronger when shared. When spoken, written, or preserved, they gain weight and meaning.",
              "Sharing a dream is often the moment it stops being fragile and starts becoming real.",
            ],
          },
        ].map((section, index) => (
          <Reveal
            key={index}
            delay={index * 0.05}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="card-dark backdrop-blur-lg border border-neon-primary/20 rounded-3xl p-8 sm:p-12 mb-16 cursor-default"
          >
            <h2 className="font-orbitron text-xl sm:text-2xl mb-4">
              {section.title}
            </h2>
            <div className="space-y-4 text-neon-secondary/90">
              {section.text.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        ))}

        {/* MICRO COPY – LINK BETWEEN PAGES */}
        <Reveal className="text-center mt-24 mb-24">
          <p className="text-neon-secondary/70 mb-4">
            Want to understand why dreams matter in the first place?
          </p>
          <Link
            to="/dreams-about-dreams"
            className="text-neon-primary hover:text-neon-secondary transition underline underline-offset-4"
          >
            Explore the meaning of dreams →
          </Link>
        </Reveal>

        {/* CALL TO REFLECTION */}
        <Reveal className="mt-24 text-center">
          <div className="card-dark border border-neon-primary/30 rounded-3xl p-10 sm:p-14 max-w-3xl mx-auto shadow-glow-neon">
            <p className="text-neon-secondary/90 text-lg sm:text-xl leading-relaxed mb-6">
              Some dreams come true quietly. Others change everything.
            </p>
            <p className="text-neon-secondary/70">
              Which dream are you carrying with you right now?
            </p>
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}