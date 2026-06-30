import { createContext, useContext, useEffect, useRef, useState } from "react";

type AudioCtxType = {
  isPlaying: boolean;
  toggle: () => void;
};

const AudioContext = createContext<AudioCtxType>({ isPlaying: false, toggle: () => {} });

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/audio/ambient.mp3");
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const pref = localStorage.getItem("ambient-music");
    if (pref === "on") {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          fadeIn(audio);
        })
        .catch(() => {});
    }

    return () => {
      audio.pause();
      audio.src = "";
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    };
  }, []);

  function fadeIn(audio: HTMLAudioElement) {
    const target = 0.3;
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    fadeTimerRef.current = window.setInterval(() => {
      const next = parseFloat((audio.volume + 0.02).toFixed(2));
      if (next < target) {
        audio.volume = next;
      } else {
        audio.volume = target;
        clearInterval(fadeTimerRef.current!);
        fadeTimerRef.current = null;
      }
    }, 100);
  }

  function toggle() {
    const audio = audioRef.current;
    console.log("toggle chamado, audio =", audioRef.current);
    if (!audio) {
      console.log("toggle: audio é null, clique ignorado");
      return;
    }

    if (isPlaying) {
      audio.pause();
      audio.volume = 0;
      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      setIsPlaying(false);
      if (typeof window !== "undefined") localStorage.setItem("ambient-music", "off");
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          fadeIn(audio);
          if (typeof window !== "undefined") localStorage.setItem("ambient-music", "on");
        })
        .catch((e) => {
          console.log("play rejeitado:", e.name, e.message);
        });
    }
  }

  return (
    <AudioContext.Provider value={{ isPlaying, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
