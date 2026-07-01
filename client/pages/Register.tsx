import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(field: string, value: string, password?: string): string {
  switch (field) {
    case "email":
      if (!value.trim()) return "Please enter your email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email.";
      return "";
    case "password":
      if (!value) return "Please enter a password.";
      if (value.length < 6) return "Password must be at least 6 characters.";
      return "";
    case "confirmPassword":
      if (value !== password) return "Passwords do not match.";
      return "";
    case "username":
      if (!value.trim()) return "Please choose a username.";
      if (value.length > 50) return "Username is too long (max 50 characters).";
      if (/[<>{}[\]\\]/.test(value)) return "Invalid characters in username.";
      return "";
    case "country":
      if (!value.trim()) return "Please tell us your country.";
      if (value.length > 60) return "Country name is too long (max 60 characters).";
      return "";
    default:
      return "";
  }
}

export default function Register() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string => {
    const emailErr = getErrorMessage("email", email);
    if (emailErr) return emailErr;
    const passwordErr = getErrorMessage("password", password);
    if (passwordErr) return passwordErr;
    const confirmErr = getErrorMessage("confirmPassword", confirmPassword, password);
    if (confirmErr) return confirmErr;
    const usernameErr = getErrorMessage("username", username);
    if (usernameErr) return usernameErr;
    const countryErr = getErrorMessage("country", country);
    if (countryErr) return countryErr;
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        setError("Could not create your account. Please try again.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: username.trim(),
          country: country.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        setError(
          `[${profileError.code}] ${profileError.message}${profileError.hint ? " — " + profileError.hint : ""}`
        );
        return;
      }

      await refreshProfile();
      navigate("/");
    } catch (err: any) {
      console.error("Register error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Register — Monument of Dreams"
        description="Create your Monument of Dreams account."
        canonical="https://monumentofdreams.com/register"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-12 text-center">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
              Register
            </h1>
            <p className="text-neon-secondary">
              Join Monument of Dreams.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-dark p-8 rounded-xl space-y-6">
            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="How should we call you?"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="Where are you dreaming from?"
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="Repeat your password"
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
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-neon-secondary/70">
              Already have an account?{" "}
              <Link to="/login" className="text-neon-primary hover:underline">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
