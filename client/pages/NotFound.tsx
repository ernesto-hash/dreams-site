import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 pt-20">
        <div className="text-center">
          <h1 className="font-orbitron text-6xl sm:text-7xl font-bold text-neon-primary mb-4">
            404
          </h1>
          <p className="text-xl sm:text-2xl text-neon-secondary font-exo2 mb-2">
            Page Not Found
          </p>
          <p className="text-neon-secondary/70 font-exo2 mb-8">
            The dream you're looking for doesn't exist in this monument.
          </p>
          <Link to="/" className="neon-button">
            Return to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
