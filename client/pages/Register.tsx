import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { TRANSITION_FAST } from "@/lib/motion";

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

type FieldName = "username" | "country" | "email" | "password" | "confirmPassword";

export default function Register() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [checkEmail, setCheckEmail] = useState(false);

  const values: Record<FieldName, string> = {
    username,
    country,
    email,
    password,
    confirmPassword,
  };

  const fieldError = (field: FieldName) =>
    touched[field] ? getErrorMessage(field, values[field], password) : "";

  const markTouched = (field: FieldName) => setTouched((t) => ({ ...t, [field]: true }));

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
    setTouched({ username: true, country: true, email: true, password: true, confirmPassword: true });

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setShakeKey((k) => k + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            country: country.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setShakeKey((k) => k + 1);
        return;
      }

      if (!data.user) {
        setError("Could not create your account. Please try again.");
        setShakeKey((k) => k + 1);
        return;
      }

      if (!data.session) {
        // confirmação de email ativa — sem sessão ainda; o perfil já foi
        // criado pelo trigger handle_new_user, só falta confirmar o email
        setCheckEmail(true);
        return;
      }

      await refreshProfile();
      navigate("/");
    } catch (err: any) {
      console.error("Register error:", err);
      setError("An unexpected error occurred. Please try again.");
      setShakeKey((k) => k + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field: FieldName) =>
    `input-dark w-full p-4 rounded-lg transition-colors ${
      fieldError(field) ? "border-red-500/60 focus:border-red-500" : ""
    }`;

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

          {checkEmail ? (
            <div className="card-dark p-8 rounded-xl text-center space-y-4">
              <p className="font-orbitron text-xl text-neon-primary">Check your email</p>
              <p className="text-neon-secondary">
                We sent a confirmation link to <span className="text-white">{email.trim()}</span>.
                Confirm your email to log in.
              </p>
              <Link to="/login" className="neon-button inline-block px-6 py-2 mt-2">
                Go to Login
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} noValidate className="card-dark p-8 rounded-xl space-y-6">
            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => markTouched("username")}
                disabled={isSubmitting}
                className={fieldClass("username")}
                placeholder="How should we call you?"
                required
              />
              {fieldError("username") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("username")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => markTouched("country")}
                disabled={isSubmitting}
                className={fieldClass("country")}
                placeholder="Where are you dreaming from?"
                required
              />
              {fieldError("country") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("country")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                disabled={isSubmitting}
                className={fieldClass("email")}
                placeholder="you@example.com"
                required
              />
              {fieldError("email") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("email")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
                disabled={isSubmitting}
                className={fieldClass("password")}
                placeholder="At least 6 characters"
                required
              />
              {fieldError("password") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("password")}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => markTouched("confirmPassword")}
                disabled={isSubmitting}
                className={fieldClass("confirmPassword")}
                placeholder="Repeat your password"
                required
              />
              {fieldError("confirmPassword") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("confirmPassword")}</p>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="p-4 border border-red-500/40 bg-red-900/20 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              transition={TRANSITION_FAST}
              className={`w-full py-4 font-bold rounded-lg flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "neon-button hover:shadow-glow-neon"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>

            <p className="text-center text-sm text-neon-secondary/70">
              Already have an account?{" "}
              <Link to="/login" className="text-neon-primary hover:underline">
                Log In
              </Link>
            </p>
          </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
