import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Terms of Service — Monument of Dreams"
        description="Terms of service for Monument of Dreams. Read the rules for submitting and displaying dreams."
        canonical="https://monumentofdreams.com/terms"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-8">
            Terms of Service
          </h1>
          
          <div className="space-y-8 text-neon-secondary">

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">1. Site Usage</h2>
              <p>Dreams allows you to submit your dreams (text). Users must provide <strong>name, country, language, and dream text</strong>. Illegal, offensive, or copyrighted content is not allowed. The site reserves the right to remove content that violates these terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">3. Intellectual Property</h2>
              <p>Users retain rights to their dreams. By submitting, you grant Dreams a non-exclusive license to display your content on the site and for internal promotions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">4. Limitation of Liability</h2>
              <p>Dreams is not responsible for the accuracy or consequences of submitted content. Users are responsible for their own submissions. The site is not liable for financial losses or indirect damages.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">5. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">6. Contact</h2>
              <p>For any questions, please email: <strong>contact@dreams.com</strong></p>
            </section>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
