import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Success() {
  const [searchParams] = useSearchParams();
  const dreamId = searchParams.get("dream_id");
  const slug = searchParams.get("slug");

  const dreamUrl = slug ? `/dream/${slug}` : dreamId ? `/dream/${dreamId}` : "/gallery";

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">

          <div className="bg-green-900/20 border border-green-500/40 rounded-xl p-8 mb-8">
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h1 className="font-orbitron text-3xl font-bold text-white mb-4">
              Your Dream Is Now Part of the Monument
            </h1>
            <p className="text-neon-secondary mb-6">
              Your dream has been published and is now visible to the world. Others who share it may find and connect with you.
            </p>
            {dreamId && (
              <Link
                to={dreamUrl}
                className="neon-button inline-block px-6 py-3 mb-4"
              >
                View My Dream →
              </Link>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/gallery" className="px-6 py-3 bg-neon-primary text-dark-bg font-bold rounded-lg text-center">
              Explore the Gallery
            </Link>
            <Link to="/" className="px-6 py-3 border border-neon-primary text-neon-primary font-bold rounded-lg text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
