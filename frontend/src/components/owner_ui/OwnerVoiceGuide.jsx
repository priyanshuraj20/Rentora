import React, { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, Sparkles, ChevronDown, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "English", native: "English", flag: "🌐" },
  { code: "hi-IN", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
];

export default function OwnerVoiceGuide() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("rentora_voice_lang") || "en-IN";
  });

  const audioRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const playOwnerGuide = async (langCode) => {
    const lang = langCode || selectedLang;
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
    const audioUrl = `${baseUrl}/voice/dashboard-guide?role=owner&lang=${lang}`;

    try {
      setIsLoading(true);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = audioUrl;

      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        toast.error("Audio playback error");
      };

      await audioRef.current.play();
      setIsPlaying(true);
      toast.success(`🔊 Playing Owner AI Guide in ${currentLangObj.native}`, {
        id: "owner-guide-toast",
      });
    } catch (err) {
      console.warn("Owner guide play error:", err);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playOwnerGuide(selectedLang);
    }
  };

  const switchLanguage = (code) => {
    setSelectedLang(code);
    localStorage.setItem("rentora_voice_lang", code);
    setLangDropdownOpen(false);
    playOwnerGuide(code);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="mb-6 p-4 rounded-2xl bg-surface border border-primary/25 shadow-md flex flex-wrap items-center justify-between gap-3"
      ref={dropdownRef}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span>Owner Dashboard AI Audio Guide</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-md">
              Sarvam Indic Voice
            </span>
          </h4>
          <p className="text-xs text-text-secondary">
            Learn how to list items, verify 15-second dynamic PIN at handover, and track earnings.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-app hover:bg-white/5 border border-divider text-xs text-text-secondary cursor-pointer"
          >
            <span>{currentLangObj.flag}</span>
            <span className="font-semibold text-xs">{currentLangObj.native}</span>
            <ChevronDown size={12} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-surface border border-divider p-1 shadow-2xl z-50">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLanguage(l.code)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer text-left ${
                    l.code === selectedLang
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-text-secondary hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </span>
                  <span className="text-[10px] text-text-muted">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Play / Pause Button with Dancing Equalizer */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
            isPlaying
              ? "bg-primary/20 border border-primary text-primary shadow-primary/20"
              : "bg-primary hover:bg-primary-hover text-text-primary"
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Loading...</span>
            </>
          ) : isPlaying ? (
            <>
              <span className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-3 bg-primary animate-[bounce_0.8s_infinite_100ms] rounded-full" />
                <span className="w-0.5 h-2 bg-primary animate-[bounce_0.8s_infinite_300ms] rounded-full" />
                <span className="w-0.5 h-3.5 bg-primary animate-[bounce_0.8s_infinite_200ms] rounded-full" />
              </span>
              <span>Pause Guide</span>
              <Pause size={13} className="fill-primary" />
            </>
          ) : (
            <>
              <Volume2 size={14} />
              <span>Listen to Owner Guide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
