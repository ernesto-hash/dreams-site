import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="About — Monument of Dreams"
        description="Learn about Monument of Dreams, a free digital archive where people worldwide share and preserve their dreams forever."
        canonical="https://monumentofdreams.com/about"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 text-center">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
              About the Digital Monument
            </h1>
            <p className="text-neon-secondary font-exo2 text-lg">
              Understanding our vision and mission
            </p>
          </div>

          {/* Vision Section */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-orbitron text-3xl font-bold text-neon-primary mb-4">
                  Our Vision
                </h2>
                <p className="text-neon-secondary font-exo2 leading-relaxed mb-4">
                  The Digital Monument of Dreams is a revolutionary platform that
                  celebrates human aspiration and creativity. We believe that every
                  dream matters, every wish deserves to be heard, and every person
                  should have the opportunity to leave their mark on a collective
                  monument of human hope.
                </p>
                <p className="text-neon-secondary/80 font-exo2 leading-relaxed">
                  In a world where dreams are often dismissed or forgotten, we created
                  a permanent digital space where they are preserved, shared, and
                  celebrated for generations to come.
                </p>
              </div>

              <div className="card-dark p-8 rounded-lg">
                <div className="text-6xl mb-4">✧</div>
                <h3 className="font-orbitron text-xl text-neon-primary mb-2">
                  A Monument to Hope
                </h3>
                <p className="text-sm text-neon-secondary/70 font-exo2">
                  Every wish submitted becomes an eternal part of our digital
                  monument, a testament to human dreams and aspirations.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="card-dark p-8 rounded-lg order-2 md:order-1">
                <div className="text-6xl mb-4">⬈</div>
                <h3 className="font-orbitron text-xl text-neon-primary mb-2">
                  Inspiring Future Generations
                </h3>
                <p className="text-sm text-neon-secondary/70 font-exo2">
                  We believe that shared dreams create a ripple effect, inspiring
                  others to chase their own aspirations and create positive change.
                </p>
              </div>

              <div className="order-1 md:order-2">
                <h2 className="font-orbitron text-3xl font-bold text-neon-primary mb-4">
                  Our Mission
                </h2>
                <p className="text-neon-secondary font-exo2 leading-relaxed mb-4">
                  Our mission is threefold: to create a safe space for dreams, to
                  foster a global community of dreamers, and to prove that in the
                  digital age, human connection and shared aspiration are more
                  valuable than ever.
                </p>

                <ul className="space-y-3 font-exo2 text-neon-secondary">
                  <li className="flex gap-2">
                    <span className="text-neon-primary">✓</span>
                    <span>Preserve dreams in a permanent digital form</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neon-primary">✓</span>
                    <span>Create a diverse global community of dreamers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-neon-primary">✓</span>
                    <span>Inspire action and positive change through shared vision</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="font-orbitron text-3xl font-bold text-white mb-8 text-center">
              How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { num: "1", title: "Write Your Dream", desc: "Articulate your deepest wish or aspiration" },
                { num: "2", title: "Submit Free", desc: "Submit your dream for free — no payment required" },
                { num: "3", title: "Share with World", desc: "Your dream becomes public and visible in the gallery" },
                { num: "4", title: "Inspire Others", desc: "Your wish may inspire others to chase their dreams" },
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-neon-primary text-dark-bg font-orbitron font-bold flex items-center justify-center mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-orbitron text-lg text-neon-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neon-secondary/70 font-exo2">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Values */}
          <section>
            <h2 className="font-orbitron text-3xl font-bold text-white mb-8 text-center">
              Our Core Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "🜄", title: "Inclusivity", desc: "Dreams from every corner of the world are welcome" },
                { icon: "🛡", title: "Privacy", desc: "We protect user data and maintain security" },
                { icon: "✦", title: "Inspiration", desc: "Every wish can inspire positive change" },
                { icon: "⋯", title: "Community", desc: "We foster a supportive global community" },
                { icon: "⟡", title: "Quality", desc: "We maintain high standards for the monument" },
                { icon: "∞", title: "Permanence", desc: "Dreams are preserved for future generations" },
              ].map((value, idx) => (
                <div key={idx} className="card-dark p-6 rounded-lg text-center">
                  <div className="text-4xl mb-2">{value.icon}</div>
                  <h3 className="font-orbitron text-lg text-neon-primary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-neon-secondary/70 font-exo2">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
