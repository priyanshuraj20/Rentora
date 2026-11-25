import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/authHook";
import { useNavigate, Link } from "react-router-dom";

export const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "en-IN", label: "English", native: "English", flag: "🌐" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "ta-IN", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "bn-IN", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "kn-IN", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "pa-IN", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "od-IN", label: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳" },
];

const TOUR_CONFIG = {
  renter: [
    {
      step: 1,
      sectionId: "renter-tour-search",
      altSectionId: "tour-hero",
      title: "Search Gear & Voice Booking Agent",
      desc: "Use the search bar to find cameras, drones, or equipment, or click Voice Agent to book by speaking.",
    },
    {
      step: 2,
      sectionId: "renter-tour-location",
      altSectionId: "tour-categories",
      title: "Filter by City & Distance Radius",
      desc: "Select your neighborhood city and adjust radius to find equipment closest to you.",
    },
    {
      step: 3,
      sectionId: "renter-tour-gear",
      altSectionId: "tour-how-it-works",
      title: "Browse Verified Equipment & Daily Rates",
      desc: "Compare daily rental rates, security deposits, and gear photos. Click any item card to book.",
    },
    {
      step: 4,
      sectionId: "renter-tour-actions",
      altSectionId: "tour-cta",
      title: "Razorpay Escrow & 6-Digit Handover PIN",
      desc: "Your funds stay locked in escrow until you inspect the gear and verify delivery with a 6-digit PIN.",
    },
  ],
  owner: [
    {
      step: 1,
      sectionId: "owner-tour-listings-stat",
      altSectionId: "tour-hero",
      title: "Total Listed Gear & Inventory",
      desc: "Track all cameras, drones, and equipment you currently have listed for rent on Rentora in the top-left stats card.",
    },
    {
      step: 2,
      sectionId: "owner-tour-quick-actions",
      altSectionId: "tour-owner-income",
      title: "Add New Item (Quick Actions)",
      desc: "Use the Quick Actions card on the right and click '+ Add New Item' to set daily rates, upload photos, and publish listings.",
    },
    {
      step: 3,
      sectionId: "owner-tour-active-rentals",
      altSectionId: "tour-trust",
      title: "Active Rentals & Handover Verification",
      desc: "Manage ongoing bookings here. When handing over gear, enter the renter's 6-digit PIN and voice consent.",
    },
    {
      step: 4,
      sectionId: "owner-tour-earnings-stat",
      altSectionId: "tour-cta",
      title: "Total Earnings & Escrow Payouts",
      desc: "Monitor your total earnings in the top-right card. Once verified, Razorpay escrow transfers funds directly to your account.",
    },
  ],
};

const tourBlobCache = new Map();

export default function VoiceWelcomeWidget({ defaultPersona = null, hidePersonaSwitch = false }) {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [persona, setPersona] = useState(defaultPersona || "renter"); // "renter" | "owner"
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("rentora_voice_lang") || "hi-IN";
  });

  const audioRef = useRef(null);
  const dropdownRef = useRef(null);
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (defaultPersona) {
      setPersona(defaultPersona);
    }
  }, [defaultPersona]);

  const currentSteps = TOUR_CONFIG[persona] || TOUR_CONFIG.renter;
  const activeStepConfig = currentSteps[currentStep - 1] || currentSteps[0];
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  // Helper to highlight active section on the page and smooth scroll
  const highlightSection = (stepConfig) => {
    // Remove previous highlights
    document.querySelectorAll(".tour-active-highlight").forEach((el) => {
      el.classList.remove(
        "tour-active-highlight",
        "ring-4",
        "ring-primary",
        "shadow-[0_0_80px_rgba(232,115,74,0.45)]",
        "rounded-3xl"
      );
    });

    if (!stepConfig) return;

    let el = stepConfig.sectionId ? document.getElementById(stepConfig.sectionId) : null;
    if (!el && stepConfig.altSectionId) {
      el = document.getElementById(stepConfig.altSectionId);
    }

    if (el) {
      el.classList.add(
        "tour-active-highlight",
        "ring-4",
        "ring-primary",
        "shadow-[0_0_80px_rgba(232,115,74,0.45)]",
        "rounded-3xl"
      );
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Play audio for a given tour step
  const playStepAudio = async (p, stepNum, lang) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
    const audioUrl = `${baseUrl}/voice/tour?persona=${p}&step=${stepNum}&lang=${lang}&v=3`;
    const cacheKey = `v3_${p}_${stepNum}_${lang}`;

    try {
      setIsLoading(true);

      let objectUrl = tourBlobCache.get(cacheKey);

      if (!objectUrl) {
        const response = await fetch(audioUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to load audio (${response.status})`);
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        tourBlobCache.set(cacheKey, objectUrl);
      }

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = objectUrl;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        // Auto-advance to next step
        setCurrentStep((prev) => {
          if (prev < 4) {
            return prev + 1;
          }
          return prev;
        });
      };

      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      };

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Step audio error:", err);
      toast.error("Could not load tour audio. Please try again.");
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Triggered when step or persona changes
  useEffect(() => {
    if (!isTourOpen) {
      highlightSection(null);
      return;
    }

    highlightSection(activeStepConfig);
    playStepAudio(persona, currentStep, selectedLang);
  }, [isTourOpen, persona, currentStep]);

  // Launch Tour when clicking "AI Voice Tour" in navbar
  const handleNavbarClick = () => {
    if (!isTourOpen) {
      setIsTourOpen(true);
      setCurrentStep(1);
    } else {
      togglePlayPause();
    }
  };

  const closeTour = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsTourOpen(false);
    highlightSection(null);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => playStepAudio(persona, currentStep, selectedLang));
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const switchPersona = (newPersona) => {
    setPersona(newPersona);
    setCurrentStep(1);
  };

  const switchLanguage = (code) => {
    setSelectedLang(code);
    localStorage.setItem("rentora_voice_lang", code);
    setDropdownOpen(false);
    if (isTourOpen) {
      playStepAudio(persona, currentStep, code);
    }
  };

  const handleDemoLaunch = async (targetRole) => {
    try {
      const res = await demoLogin(targetRole);
      if (res.success) {
        toast.success(`Welcome to ${targetRole.toUpperCase()} Dashboard! 🚀`);
        closeTour();
        navigate(targetRole === "admin" ? "/admin" : targetRole === "owner" ? "/owner" : "/rentals");
      }
    } catch (e) {
      toast.error("Demo login failed");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* ================= NAVBAR CONTROLS ================= */}
      <div className="relative inline-flex items-center gap-1.5" ref={dropdownRef}>
        {/* Voice Tour Button */}
        <button
          onClick={handleNavbarClick}
          title={isTourOpen ? (isPlaying ? "Pause Tour" : "Resume Tour") : "Start Guided AI Voice Tour"}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm select-none ${
            isTourOpen
              ? "bg-primary/20 border-primary text-primary shadow-primary/20"
              : "bg-surface hover:bg-surface-hover border-divider text-text-secondary hover:text-text-primary"
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw size={13} className="animate-spin text-primary" />
              <span className="text-[11px] font-medium">Loading Tour...</span>
            </>
          ) : isTourOpen && isPlaying ? (
            <>
              <span className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-3 bg-primary animate-[bounce_0.8s_infinite_100ms] rounded-full" />
                <span className="w-0.5 h-2 bg-primary animate-[bounce_0.8s_infinite_300ms] rounded-full" />
                <span className="w-0.5 h-3.5 bg-primary animate-[bounce_0.8s_infinite_200ms] rounded-full" />
              </span>
              <span className="text-[11px] font-bold tracking-wide">
                Tour Active ({currentLangObj.native})
              </span>
              <Volume2 size={13} className="text-primary" />
            </>
          ) : (
            <>
              <Volume2 size={13} className="text-text-muted" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {defaultPersona === "owner" ? "Owner AI Tour" : defaultPersona === "renter" ? "Renter AI Tour" : "AI Voice Tour"}
              </span>
            </>
          )}
        </button>

        {/* Language Selector Dropdown Button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          title="Select Language"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-divider text-text-secondary hover:text-text-primary text-xs transition-colors cursor-pointer select-none"
        >
          <span className="text-xs">{currentLangObj.flag}</span>
          <span className="text-[11px] font-semibold">{currentLangObj.native}</span>
          <ChevronDown
            size={11}
            className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl bg-surface border border-divider p-1.5 shadow-2xl z-50 max-h-72 overflow-y-auto">
            <div className="px-2.5 py-1.5 border-b border-divider/50 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase flex items-center gap-1">
                <Sparkles size={11} className="text-primary" /> Sarvam Indic Voices
              </span>
              <span className="text-[9px] text-text-muted bg-app px-1.5 py-0.5 rounded">11 Languages</span>
            </div>

            <div className="space-y-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isCurrent = lang.code === selectedLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer text-left ${
                      isCurrent
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span className="font-medium">{lang.native}</span>
                    </span>
                    <span className="text-[10px] text-text-muted">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= FLOATING GUIDED TOUR HUD (BOTTOM CENTER) ================= */}
      {isTourOpen && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 transition-all duration-300"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-surface/95 backdrop-blur-2xl border-2 border-primary/40 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-4">
            
            {/* Top Row: Persona Switcher (Renter vs Owner) + Language + Close */}
            <div className="flex items-center justify-between border-b border-divider pb-3">
              {!hidePersonaSwitch ? (
                <div className="inline-flex rounded-xl bg-app p-1 border border-divider">
                  <button
                    onClick={() => switchPersona("renter")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      persona === "renter"
                        ? "bg-primary text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    🧑‍💼 Renter Tour
                  </button>
                  <button
                    onClick={() => switchPersona("owner")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      persona === "owner"
                        ? "bg-primary text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    💼 Owner Tour
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/25 text-primary text-xs font-bold">
                  <Sparkles size={13} className="animate-pulse" />
                  <span>{persona === "owner" ? "Owner AI Audio Tour" : "Renter AI Audio Tour"}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1 bg-app px-2.5 py-1 rounded-lg border border-divider">
                  <span>{currentLangObj.flag}</span>
                  <span>{currentLangObj.native}</span>
                </span>

                <button
                  onClick={closeTour}
                  title="Close Tour"
                  className="h-7 w-7 rounded-full bg-app hover:bg-white/10 border border-divider text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Middle Row: Step Progress, Title & Soundwave */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Step {currentStep} of 4: {activeStepConfig.title}</span>
                </span>

                <span className="flex items-center gap-1">
                  {isLoading ? (
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <RefreshCw size={11} className="animate-spin text-primary" /> Synthesizing...
                    </span>
                  ) : isPlaying ? (
                    <span className="flex items-center gap-0.5 h-3">
                      <span className="w-0.5 h-3 bg-primary animate-[bounce_0.8s_infinite_100ms] rounded-full" />
                      <span className="w-0.5 h-2 bg-primary animate-[bounce_0.8s_infinite_300ms] rounded-full" />
                      <span className="w-0.5 h-3.5 bg-primary animate-[bounce_0.8s_infinite_200ms] rounded-full" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted">Paused</span>
                  )}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {activeStepConfig.desc}
              </p>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-app rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-[#d4a24c] transition-all duration-500 rounded-full"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-app hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed border border-divider text-xs text-text-secondary font-medium transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <button
                onClick={togglePlayPause}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/50 text-primary text-xs font-bold hover:bg-primary/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause size={13} className="fill-primary" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-primary" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === 4}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-app hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed border border-divider text-xs text-text-secondary font-medium transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Step 4 Handoff */}
            {currentStep === 4 && (
              <div className="pt-2 border-t border-divider flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-text-primary">
                  {defaultPersona === "owner"
                    ? "Ready to earn?"
                    : defaultPersona === "renter"
                    ? "Ready to rent?"
                    : "Ready to explore?"}
                </span>
                <div className="flex items-center gap-2">
                  {defaultPersona === "owner" ? (
                    <>
                      <Link
                        to="/listings"
                        onClick={closeTour}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        <span>+ List New Item</span>
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={closeTour}
                        className="px-3 py-1.5 rounded-xl bg-app hover:bg-white/10 border border-divider text-text-secondary text-xs font-medium transition-all cursor-pointer"
                      >
                        <span>View Bookings</span>
                      </Link>
                    </>
                  ) : defaultPersona === "renter" ? (
                    <>
                      <Link
                        to="/renter"
                        onClick={closeTour}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        <span>🔍 Explore Gear</span>
                      </Link>
                      <Link
                        to="/rentals"
                        onClick={closeTour}
                        className="px-3 py-1.5 rounded-xl bg-app hover:bg-white/10 border border-divider text-text-secondary text-xs font-medium transition-all cursor-pointer"
                      >
                        <span>My Rentals</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDemoLaunch("renter")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        ⚡ Demo Renter
                      </button>
                      <button
                        onClick={() => handleDemoLaunch("owner")}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        💼 Demo Owner
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
