import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/slugify";

function getErrorMessage(field: string, value: string): string {
  switch (field) {
    case "wish":
      if (!value.trim()) return "Your dream cannot be empty.";
      if (value.trim().length < 10) return "Your dream needs at least 10 characters.";
      if (value.length > 5000) return "Your dream is too long (max 5000 characters).";
      return "";
    case "author":
      if (!value.trim()) return "Please share your name or a creative pseudonym.";
      if (value.length > 100) return "Name is too long (max 100 characters).";
      if (/[<>{}[\]\\]/.test(value)) return "Invalid characters in name.";
      return "";
    case "country":
      if (!value.trim()) return "Which corner of the world do you dream from?";
      if (value.length > 60) return "Country name is too long (max 60 characters).";
      return "";
    default:
      return "";
  }
}

function generateTitle(description: string, authorName: string): string {
  if (!description.trim()) return `Dream from ${authorName}`;
  const words = description.trim().split(/\s+/);
  if (words.length <= 5) return description.slice(0, 60);
  return words.slice(0, 4).join(" ") + "...";
}

export default function SubmitWish() {
  const navigate = useNavigate();

  const [wish, setWish] = useState("");
  const [author, setAuthor] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validate = (): string => {
    const wishErr = getErrorMessage("wish", wish);
    if (wishErr) return wishErr;
    const authorErr = getErrorMessage("author", author);
    if (authorErr) return authorErr;
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
      const title = generateTitle(wish, author);
      const slug = generateSlug(title);

      const { data, error: insertError } = await supabase
        .from("dreams")
        .insert([{
          title,
          description: wish.trim(),
          author: author.trim(),
          country: country.trim(),
          language: language.trim() || null,
          contact: contact.trim() || null,
          slug,
          likes: 0,
          views: 0,
          created_at: new Date().toISOString(),
        }])
        .select("id, slug")
        .single();

      if (insertError) {
        console.error({
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        setError(`[${insertError.code}] ${insertError.message}${insertError.hint ? " — " + insertError.hint : ""}`);
        return;
      }

      navigate(`/success?dream_id=${data.id}&slug=${data.slug || data.id}`);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Seo
        title="Submit Your Dream — Monument of Dreams"
        description="Share your dream with the world for free. Join thousands of people from 50+ countries who have preserved their dreams forever."
        canonical="https://monumentofdreams.com/submit"
      />
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-2xl mx-auto">

          <div className="mb-12 text-center">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
              Submit Your Dream
            </h1>
            <p className="text-neon-secondary">
              Share your wish and make it part of the monument — free, forever.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card-dark p-8 rounded-xl space-y-6">

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Name or Pseudonym *
              </label>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="How should we call you?"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Country *
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
                Language <span className="text-neon-secondary/50">(optional)</span>
              </label>
              <input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="In which language do you dream?"
              />
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                Your Dream *
              </label>
              <textarea
                rows={6}
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                disabled={isSubmitting}
                minLength={10}
                maxLength={5000}
                className="input-dark w-full p-4 rounded-lg resize-none"
                placeholder="Describe your dream in detail. What makes it special? What do you hope for?"
                required
              />
              {wish.length >= 4500 && (
                <p className={`text-xs mt-1 font-exo2 ${wish.length >= 5000 ? "text-violet-400" : "text-violet-500/70"}`}>
                  {wish.length >= 5000
                    ? "Atingiste o máximo de 5000 caracteres."
                    : `Estás perto do limite — ${5000 - wish.length} caracteres restantes`}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-neon-secondary mb-2">
                How people can reach you{" "}
                <span className="text-neon-secondary/50">(optional — will be public)</span>
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={isSubmitting}
                className="input-dark w-full p-4 rounded-lg"
                placeholder="e.g. @yourinstagram, x.com/handle, or email"
                maxLength={200}
              />
              <p className="text-xs text-neon-secondary/40 mt-1">
                People who share this dream may want to connect. Only fill this in if you are comfortable making it public.
              </p>
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
              {isSubmitting ? "Submitting your dream..." : "Submit My Dream — Free"}
            </button>

          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
