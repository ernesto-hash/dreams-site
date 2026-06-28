import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Privacy Policy — Monument of Dreams"
        description="Monument of Dreams privacy policy. Learn how we collect and protect your information."
        canonical="https://monumentofdreams.com/privacy"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-8">
            Privacy Policy
          </h1>
          
          <div className="space-y-8 text-neon-secondary">
            
            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">1. Information We Collect</h2>
              <p>We collect only the information necessary for Dreams to function and display dreams:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Name</li>
                <li>Country</li>
                <li>Language</li>
                <li>Dream content (text submitted)</li>
                <li>Browsing data (cookies, analytics)</li>
              </ul>
              <p className="mt-2">Note: We do not store financial or banking data — payments are securely processed through Stripe.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">2. How We Use Your Information</h2>
              <p>We use your data to:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Create and manage user accounts</li>
                <li>Allow dream submissions</li>
                <li>Process payments via Stripe</li>
                <li>Enhance the user experience on the site</li>
                <li>Send notifications and information (if authorized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">3. Sharing of Information</h2>
              <p>We do not sell or share your data with third parties, except when necessary to process payments or required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">4. Security</h2>
              <p>We implement technical and organizational measures to protect your data:</p>
              <ul className="list-disc list-inside mt-2">
                <li>SSL/HTTPS encryption</li>
                <li>Secure password storage</li>
                <li>Restricted access to data</li>
                <li>Regular backups</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">5. Cookies</h2>
              <p>We use cookies to improve user experience and analyze traffic. You can manage cookies through your browser.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">6. User Rights</h2>
              <p>You can access, correct, or delete your data and withdraw consent at any time. To exercise these rights, contact us at <strong>contact@dreams.com</strong>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neon-primary mb-3">7. Changes to this Policy</h2>
              <p>We may update this policy at any time. The last update date will always be indicated on this page.</p>
            </section>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
