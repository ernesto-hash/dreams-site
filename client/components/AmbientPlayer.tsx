import { useAudio } from "@/context/AudioContext";

export default function AmbientPlayer() {
  const { isPlaying, toggle } = useAudio();

  return (
    <button
      onClick={toggle}
      aria-label={isPlaying ? "Parar música ambiente" : "Tocar música ambiente"}
      title={isPlaying ? "Parar música ambiente" : "Tocar música ambiente"}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-dark-card border border-neon-primary/30 flex items-center justify-center text-neon-primary/60 hover:border-neon-primary/70 hover:text-neon-primary transition-all duration-300 shadow-lg backdrop-blur-sm"
    >
      {isPlaying ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}
