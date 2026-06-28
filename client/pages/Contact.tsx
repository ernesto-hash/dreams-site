import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Contact — Monument of Dreams"
        description="Get in touch with Monument of Dreams. We respond within 24-48 hours."
        canonical="https://monumentofdreams.com/contact"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-card/50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-neon-primary mb-4">Get in Touch</h2>
              <p className="text-neon-secondary mb-6">
                Have questions about dreams, submissions, or payments? We're here to help.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white mb-1">Email</h3>
                  <p className="text-neon-secondary">dreamsmonument@gmail.com</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-white mb-1">Response Time</h3>
                  <p className="text-neon-secondary">Within 24-48 hours</p>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-card/50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-neon-primary mb-4">Common Questions</h2>
              <ul className="space-y-3">
                <li className="text-neon-secondary">• How do I submit a dream?</li>
                <li className="text-neon-secondary">• What happens after payment?</li>
                <li className="text-neon-secondary">• Can I edit my dream?</li>
                <li className="text-neon-secondary">• How are dreams moderated?</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}