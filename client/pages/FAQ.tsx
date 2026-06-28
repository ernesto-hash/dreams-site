import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

export default function FAQ() {
  const faqs = [
    {
      question: "How much does it cost to submit a dream?",
      answer: "There's a $1 optional contribution to support the platform. You can also submit for free."
    },
    {
      question: "Are my dreams anonymous?",
      answer: "Yes, unless you choose to include your name. Only the information you provide is displayed."
    },
    {
      question: "Can I edit or delete my dream?",
      answer: "Currently, dreams cannot be edited or deleted once submitted to maintain integrity."
    },
    {
      question: "How are dreams moderated?",
      answer: "All dreams are automatically published. Inappropriate content may be removed."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="FAQ — Monument of Dreams"
        description="Frequently asked questions about submitting dreams, moderation, and Monument of Dreams."
        canonical="https://monumentofdreams.com/faq"
      />
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-8">
            Frequently Asked Questions
          </h1>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-dark-card/50 p-6 rounded-lg">
                <h3 className="font-bold text-neon-primary mb-2">{faq.question}</h3>
                <p className="text-neon-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}