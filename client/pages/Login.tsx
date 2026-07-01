import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(field: string, value: string): string {
  switch (field) {
    case "email":
      if (!value.trim()) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email.";
      return "";
    case "password":
      if (!value) return "Please enter your password.";
      return "";
    default:
      return "";
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string => {
    const emailErr = getErrorMessage("email", email);
    if (emailErr) return emailErr;
    const passwordErr = getErrorMessage("password", password);
    if (passwordErr) return passwordErr;
    return "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Login — Monument of Dreams"
        description="Log in to your Monument of Dreams account."
        canonical="https://monumentofdreams.com/login"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
              Login
            </h1>
            <p className="text-neon-secondary">
              Welcome back to Monument of Dreams.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-dark p-8 rounded-xl space-y-6">
            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <div className="p-4 border border-red-500/40 bg-red-900/20 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 font-bold rounded-lg transition-all ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "neon-button hover:shadow-glow-neon hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </button>

            <p className="text-center text-sm text-neon-secondary/70">
              Don't have an account?{" "}
              <Link to="/register" className="text-neon-primary hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
