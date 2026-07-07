import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { TRANSITION_FAST } from "@/lib/motion";

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

type Status = "idle" | "submitting" | "success";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  const fieldError = (field: "email" | "password") =>
    touched[field] ? getErrorMessage(field, field === "email" ? email : password) : "";

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
    setTouched({ email: true, password: true });

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setShakeKey((k) => k + 1);
      return;
    }

    setStatus("submitting");

    try {
      const { error: signInError } = await signIn(email.trim(), password);

      if (signInError) {
        setError(signInError.message);
        setShakeKey((k) => k + 1);
        setStatus("idle");
        return;
      }

      setStatus("success");
      setTimeout(() => navigate("/"), 600);
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setShakeKey((k) => k + 1);
      setStatus("idle");
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

          <form onSubmit={handleSubmit} noValidate className="card-dark p-8 rounded-xl space-y-6">
            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                disabled={isSubmitting || isSuccess}
                className={`input-dark w-full p-4 rounded-lg transition-colors ${
                  fieldError("email") ? "border-red-500/60 focus:border-red-500" : ""
                }`}
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
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                disabled={isSubmitting || isSuccess}
                className={`input-dark w-full p-4 rounded-lg transition-colors ${
                  fieldError("password") ? "border-red-500/60 focus:border-red-500" : ""
                }`}
                placeholder="Your password"
                required
              />
              {fieldError("password") && (
                <p className="mt-1.5 text-xs text-red-400">{fieldError("password")}</p>
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
              disabled={isSubmitting || isSuccess}
              whileHover={!isSubmitting && !isSuccess ? { scale: 1.02 } : {}}
              whileTap={!isSubmitting && !isSuccess ? { scale: 0.98 } : {}}
              transition={TRANSITION_FAST}
              className={`w-full py-4 font-bold rounded-lg flex items-center justify-center gap-2 ${
                isSuccess
                  ? "bg-emerald-600/80 text-white"
                  : isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "neon-button hover:shadow-glow-neon"
              }`}
            >
              {isSuccess ? (
                <>
                  <Check size={18} />
                  Welcome back
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </motion.button>

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
