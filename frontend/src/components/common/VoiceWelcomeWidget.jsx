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
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuth from "../../hooks/authHook";
import { useNavigate, useLocation } from "react-router-dom";

// 100% verified languages with native text scripts and Sarvam Indic TTS support
export const SUPPORTED_LANGUAGES = [
  { code: "en-IN", label: "English", native: "English", flag: "🌐" },
  { code: "hi-IN", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "gu-IN", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "mr-IN", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
];

// Continuous Multi-Tab Portal Tours (Navigates through all navbar buttons)
export const PORTAL_TOURS = {
  owner_portal: [
    {
      step: 1,
      tabName: "Dashboard",
      route: "/owner",
      navId: "owner-nav-dashboard",
      sectionId: "owner-tour-listings-stat",
      title: "1. Owner Dashboard & Performance",
      desc: "Welcome to your Owner Dashboard! Here you monitor your listed inventory, upcoming renter handovers, and net earnings deposited directly into your bank account.",
    },
    {
      step: 2,
      tabName: "Listings",
      route: "/listings",
      navId: "owner-nav-listings",
      sectionId: "owner-listings-header",
      title: "2. Listings & Equipment Inventory",
      desc: "In the Listings tab, publish new gear with photo appraisal, set daily prices and escrow deposits, or pause items whenever you need them personally.",
    },
    {
      step: 3,
      tabName: "Bookings",
      route: "/bookings",
      navId: "owner-nav-bookings",
      sectionId: "owner-bookings-header",
      title: "3. Bookings: Photo Gate & 15s PIN Verification",
      desc: "In Bookings, once the renter uploads pickup photos, click 'Verify Renter PIN' to enter their 15-second dynamic code. On return, upload return condition photos first, then click 'Show Return PIN' so the renter can finalize the return.",
    },
    {
      step: 4,
      tabName: "Earnings",
      route: "/earnings",
      navId: "owner-nav-earnings",
      sectionId: "owner-earnings-header",
      title: "4. Earnings & Post-Return Escrow Payouts",
      desc: "Track your income in Earnings. Rentora holds all funds in Admin Escrow until verified return and AI inspection, then deducts only a 10% platform fee and credits 90% net earnings to your account.",
    },
    {
      step: 5,
      tabName: "Messages",
      route: "/messages",
      navId: "owner-nav-messages",
      sectionId: "owner-messages-header",
      title: "5. Messages & Handover Coordination",
      desc: "Coordinate directly with confirmed renters in Messages to arrange pickup locations, verify condition, and answer any equipment questions.",
    },
  ],
  renter_portal: [
    {
      step: 1,
      tabName: "Browse Gear",
      route: "/renter",
      navId: "renter-nav-explore",
      title: "1. Explore: Discover Gear Nearby",
      desc: "Welcome to Rentora! Search cameras, drones, tools, and bikes in your area using GPS radius filters, with refundable escrow deposits.",
    },
    {
      step: 2,
      tabName: "My Rentals",
      route: "/rentals",
      navId: "renter-nav-rentals",
      sectionId: "renter-rentals-header",
      title: "2. My Rentals: Photo Gate, 15s PIN & Escrow Refund",
      desc: "In My Rentals, upload pickup condition photos first to unlock your 15-second Handover PIN. When returning gear, the owner uploads return photos and gives you their Return PIN to trigger AI inspection and your Razorpay deposit refund.",
    },
    {
      step: 3,
      tabName: "Wishlist",
      route: "/wishlist",
      navId: "renter-nav-wishlist",
      sectionId: "renter-wishlist-header",
      title: "3. Wishlist: Save Equipment for Projects",
      desc: "Bookmark high-end gear in Wishlist to rent later for upcoming film shoots, trips, or home projects with 1-click booking.",
    },
    {
      step: 4,
      tabName: "Messages",
      route: "/messages",
      navId: "renter-nav-messages",
      sectionId: "owner-messages-header",
      title: "4. Messages: Chat with Owners",
      desc: "Coordinate gear collection with verified owners, confirm meeting times, and ask equipment questions directly.",
    },
  ],
};

// Fallback/Landing Page Tours
const TOUR_CONFIG = {
  owner: [
    {
      step: 1,
      sectionId: "owner-tour-listings-stat",
      altSectionId: "tour-hero",
      title: "Owner Tour: Turn Unused Items into Steady Income",
      desc: "You are currently taking the Owner Tour. Set your own daily prices, lock 100% security deposits in escrow, and start earning passive income from cameras, tools, or gear sitting at home.",
    },
    {
      step: 2,
      sectionId: "owner-tour-active-rentals",
      altSectionId: "tour-spotlight",
      title: "6-Digit PIN Handover & Escrow Protection",
      desc: "Gear is released only when you verify the renter's 15-second dynamic PIN in person. 100% payment guaranteed with Razorpay escrow.",
    },
    {
      step: 3,
      sectionId: "owner-tour-quick-actions",
      altSectionId: "tour-owner-income",
      title: "Owner Income Calculator & 90% Net Payout",
      desc: "Calculate how much your gear can earn per month. Rentora takes only a 10% platform fee — you take home 90% net earnings directly to your bank account.",
    },
    {
      step: 4,
      sectionId: "owner-tour-earnings-stat",
      altSectionId: "tour-cta",
      title: "Owner Tour Complete: Start Earning Today",
      desc: "Click 'List Your First Item' below to create your listing in seconds with photo appraisal and start earning passive income.",
    },
  ],
  renter: [
    {
      step: 1,
      sectionId: "renter-tour-search",
      altSectionId: "tour-hero",
      title: "Renter Tour: Rent What You Need & Skip Buying",
      desc: "You are currently taking the Renter Tour. Borrow 4K cameras, drones, tools, or bikes from verified neighbors in your city at a fraction of retail price.",
    },
    {
      step: 2,
      sectionId: "renter-tour-gear",
      altSectionId: "tour-spotlight",
      title: "Autonomous Voice Booking & 100% Escrow",
      desc: "Speak naturally in Hindi, Hinglish, or English to find gear without typing. Your security deposit is locked safely in escrow until you return the gear.",
    },
    {
      step: 3,
      sectionId: "renter-tour-location",
      altSectionId: "tour-categories",
      title: "Explore Popular Rental Categories",
      desc: "Browse curated collections across Electronics, Tools, Furniture, and Vehicles available from trusted people around your neighborhood.",
    },
    {
      step: 4,
      sectionId: "renter-tour-actions",
      altSectionId: "tour-cta",
      title: "Renter Tour Complete: Browse & Book Gear",
      desc: "Tour finished! Click 'Browse All Equipment' below to see gear in your city or use hands-free Voice Booking.",
    },
  ],
};

const tourBlobCache = new Map();

export default function VoiceWelcomeWidget({ defaultPersona = null, hidePersonaSwitch = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  // Determine portal mode
  const isOwnerPortal =
    defaultPersona === "owner" ||
    user?.role === "owner" ||
    currentPath.startsWith("/owner") ||
    currentPath === "/listings" ||
    currentPath === "/bookings" ||
    currentPath === "/earnings";

  const isRenterPortal =
    defaultPersona === "renter" ||
    user?.role === "renter" ||
    currentPath.startsWith("/renter") ||
    currentPath === "/rentals" ||
    currentPath === "/wishlist";

  const [landingPersona, setLandingPersona] = useState(() => {
    return localStorage.getItem("rentora_home_mode") || "owner";
  });

  const effectivePersona = isOwnerPortal
    ? "owner_portal"
    : isRenterPortal
    ? "renter_portal"
    : landingPersona;

  // Read saved tour state so route transitions don't close active tours
  const savedTourState = (() => {
    try {
      const raw = sessionStorage.getItem("rentora_active_tour");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [isTourOpen, setIsTourOpen] = useState(() => !!savedTourState?.active);
  const [currentStep, setCurrentStep] = useState(() => savedTourState?.step || 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown states
  const [bubbleLangOpen, setBubbleLangOpen] = useState(false);
  const [hudLangOpen, setHudLangOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("rentora_voice_lang") || "en-IN";
  });

  const audioRef = useRef(null);
  const bubbleRef = useRef(null);
  const playRequestIdRef = useRef(0);

  // Auto-dismiss intro bubble after 4.5 seconds so it never blocks dashboard cards
  useEffect(() => {
    if (!isTourOpen) {
      setBubbleDismissed(false);
      const timer = setTimeout(() => {
        setBubbleDismissed(true);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isTourOpen]);

  // Sync mode changes on guest landing page
  useEffect(() => {
    const handleModeChange = (e) => {
      const newMode = e.detail?.mode;
      if (newMode && (newMode === "owner" || newMode === "renter")) {
        setLandingPersona(newMode);
      }
    };
    window.addEventListener("rentora:mode-change", handleModeChange);
    return () => window.removeEventListener("rentora:mode-change", handleModeChange);
  }, []);

  // Steps definition based on active portal or landing
  const currentSteps =
    PORTAL_TOURS[effectivePersona] ||
    TOUR_CONFIG[effectivePersona] ||
    TOUR_CONFIG.owner;

  const totalSteps = currentSteps.length;
  const activeStepConfig = currentSteps[currentStep - 1] || currentSteps[0];
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  // Highlight active section on page
  const highlightSection = (stepConfig) => {
    document.querySelectorAll(".tour-active-highlight").forEach((el) => {
      el.classList.remove(
        "tour-active-highlight",
        "ring-4",
        "ring-primary",
        "ring-emerald-500",
        "shadow-[0_0_80px_rgba(232,115,74,0.45)]",
        "shadow-[0_0_80px_rgba(16,185,129,0.45)]",
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
        effectivePersona.includes("owner") ? "ring-primary" : "ring-emerald-500",
        effectivePersona.includes("owner")
          ? "shadow-[0_0_80px_rgba(232,115,74,0.45)]"
          : "shadow-[0_0_80px_rgba(16,185,129,0.45)]",
        "rounded-3xl"
      );
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Play audio for a given tour step
  const playStepAudio = async (personaKey, stepNumber, langCode) => {
    const reqId = ++playRequestIdRef.current;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const baseUrl = backendUrl.endsWith("/api/v1") ? backendUrl : `${backendUrl}/api/v1`;
    const audioUrl = `${baseUrl}/voice/tour?persona=${personaKey}&step=${stepNumber}&lang=${langCode}&v=7`;
    const cacheKey = `v7_${personaKey}_${stepNumber}_${langCode}`;

    try {
      let objectUrl = tourBlobCache.get(cacheKey);

      if (!objectUrl) {
        setIsLoading(true);
        const response = await fetch(audioUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Failed to load audio (${response.status})`);
        }
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        tourBlobCache.set(cacheKey, objectUrl);
      }

      if (reqId !== playRequestIdRef.current) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.pause();
      audioRef.current.src = objectUrl;
      audioRef.current.currentTime = 0;

      audioRef.current.onended = () => {
        setIsPlaying(false);
        // Automatically progress to next tab after brief 900ms pause
        if (stepNumber < totalSteps) {
          setTimeout(() => {
            setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
          }, 900);
        }
      };

      audioRef.current.onerror = () => setIsPlaying(false);

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Tour voice fallback to browser speech synthesis:", err);
      if (window.speechSynthesis) {
        const stepObj = currentSteps[stepNumber - 1];
        const textToSpeak = stepObj ? `${stepObj.title}. ${stepObj.desc}` : "";
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langCode;
        utterance.onend = () => {
          setIsPlaying(false);
          if (stepNumber < totalSteps) {
            setTimeout(() => {
              setCurrentStep((prev) => (prev < totalSteps ? prev + 1 : prev));
            }, 900);
          }
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step change trigger & tab auto-navigation
  useEffect(() => {
    if (!isTourOpen) return;

    const stepObj = currentSteps[currentStep - 1] || currentSteps[0];
    if (!stepObj) return;

    // 1. If step has a dedicated route, navigate to that tab immediately
    if (stepObj.route && location.pathname !== stepObj.route) {
      navigate(stepObj.route);
    }

    // 2. Highlight active navbar tab with pulsating indicator ring
    document.querySelectorAll(".tour-nav-highlight").forEach((el) => {
      el.classList.remove(
        "tour-nav-highlight",
        "ring-2",
        "ring-offset-2",
        "ring-primary",
        "ring-emerald-400",
        "ring-offset-app",
        "animate-pulse"
      );
    });

    if (stepObj.navId) {
      const navEl = document.getElementById(stepObj.navId);
      if (navEl) {
        navEl.classList.add(
          "tour-nav-highlight",
          "ring-2",
          "ring-offset-2",
          effectivePersona.includes("owner") ? "ring-primary" : "ring-emerald-400",
          "ring-offset-app",
          "animate-pulse"
        );
      }
    }

    // 3. Highlight in-page section (if on that page)
    highlightSection(stepObj);

    // 4. Play audio
    playStepAudio(effectivePersona, currentStep, selectedLang);

    // 5. Persist state across navigations
    try {
      sessionStorage.setItem(
        "rentora_active_tour",
        JSON.stringify({ active: true, persona: effectivePersona, step: currentStep, lang: selectedLang })
      );
    } catch {}
  }, [currentStep, isTourOpen, effectivePersona, selectedLang]);

  const closeTour = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsTourOpen(false);

    try {
      sessionStorage.removeItem("rentora_active_tour");
    } catch {}

    // Clean up highlights
    document.querySelectorAll(".tour-active-highlight, .tour-nav-highlight").forEach((el) => {
      el.classList.remove(
        "tour-active-highlight",
        "tour-nav-highlight",
        "ring-4",
        "ring-2",
        "ring-offset-2",
        "ring-primary",
        "ring-emerald-400",
        "ring-emerald-500",
        "shadow-[0_0_80px_rgba(232,115,74,0.45)]",
        "shadow-[0_0_80px_rgba(16,185,129,0.45)]",
        "rounded-3xl",
        "animate-pulse"
      );
    });
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      playStepAudio(effectivePersona, currentStep, selectedLang);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => playStepAudio(effectivePersona, currentStep, selectedLang));
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (stepNum) => {
    const targetStep = currentSteps[stepNum - 1];
    if (targetStep?.route && location.pathname !== targetStep.route) {
      navigate(targetStep.route);
    }
    setCurrentStep(stepNum);
  };

  const switchLanguage = (code) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);

    setSelectedLang(code);
    localStorage.setItem("rentora_voice_lang", code);
    setBubbleLangOpen(false);
    setHudLangOpen(false);

    if (isTourOpen) {
      playStepAudio(effectivePersona, currentStep, code);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target)) {
        setBubbleLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bubbleBadge = isOwnerPortal
    ? "Owner Portal AI Tour"
    : isRenterPortal
    ? "Renter Portal AI Tour"
    : effectivePersona === "owner"
    ? "Owner AI Audio Tour"
    : "Renter AI Audio Tour";

  const bubbleTitle = isOwnerPortal
    ? "Complete 5-Tab Guided Walkthrough"
    : isRenterPortal
    ? "Complete 4-Tab Guided Walkthrough"
    : effectivePersona === "owner"
    ? "Earn Passive Income From Your Idle Gear"
    : "Borrow Premium Gear in Your Neighborhood";

  const bubbleDesc = isOwnerPortal
    ? "Let the AI guide automatically take you through your Dashboard, Listings, Bookings, Earnings, and Messages."
    : isRenterPortal
    ? "Let the AI guide automatically take you through Browse Gear, My Rentals, Wishlist, and Messages."
    : effectivePersona === "owner"
    ? "Take the 60-second interactive voice tour to see how 100% security escrow, 6-digit PIN handover, and 90% net payouts protect you."
    : "Take the 60-second interactive voice tour to see how instant gear search, autonomous voice booking, and escrow protection work.";

  const bubbleButtonLabel = isOwnerPortal
    ? "Start Full Owner Tour (5 Tabs)"
    : isRenterPortal
    ? "Start Full Renter Tour (4 Tabs)"
    : "Start Voice Tour";

  const launcherLabel = isOwnerPortal
    ? "Owner Portal Tour"
    : isRenterPortal
    ? "Renter Portal Tour"
    : effectivePersona === "owner"
    ? "Owner AI Tour"
    : "Renter AI Tour";

  return (
    <>
      {/* ================= FLOATING AI TOUR CHATBOT ASSISTANT (BOTTOM RIGHT) ================= */}
      {!isTourOpen && (
        <div
          ref={bubbleRef}
          className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto"
        >
          {/* Interactive Intro Speech Bubble / Popover Card */}
          {!bubbleDismissed && (
            <div
              className={`w-84 sm:w-96 rounded-3xl p-5 shadow-2xl backdrop-blur-xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
                effectivePersona.includes("owner")
                  ? "bg-surface/95 border-primary/40 shadow-[0_16px_50px_rgba(232,115,74,0.3)]"
                  : "bg-surface/95 border-emerald-500/40 shadow-[0_16px_50px_rgba(16,185,129,0.3)]"
              }`}
            >
              {/* Header: Badge & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-divider">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={13}
                    className={`animate-pulse ${
                      effectivePersona.includes("owner") ? "text-primary" : "text-emerald-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wider ${
                      effectivePersona.includes("owner") ? "text-primary" : "text-emerald-400"
                    }`}
                  >
                    {bubbleBadge}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBubbleDismissed(true)}
                  title="Minimize Assistant"
                  className="h-6 w-6 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Bubble Body: Explaining continuous multi-tab walkthrough */}
              <div className="py-3 space-y-1.5">
                <h4 className="text-sm font-bold text-text-primary leading-snug">
                  {bubbleTitle}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {bubbleDesc}
                </p>
              </div>

              {/* Action Controls & Language Picker inside bubble */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setIsTourOpen(true);
                  }}
                  className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    effectivePersona.includes("owner")
                      ? "bg-primary hover:bg-primary-hover shadow-primary/30"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
                  }`}
                >
                  <Play size={12} className="fill-white" />
                  <span>{bubbleButtonLabel}</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBubbleLangOpen(!bubbleLangOpen)}
                    className="py-2 px-2.5 rounded-xl bg-app hover:bg-white/10 border border-divider text-xs font-semibold text-text-primary flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{currentLangObj.flag}</span>
                    <span className="text-[11px]">{currentLangObj.native}</span>
                    <ChevronDown size={11} className={bubbleLangOpen ? "rotate-180" : ""} />
                  </button>
                  {bubbleLangOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-44 rounded-2xl bg-surface border border-divider p-1.5 shadow-2xl z-50">
                      <div className="space-y-0.5">
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => switchLanguage(l.code)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                              l.code === selectedLang
                                ? effectivePersona.includes("owner")
                                  ? "bg-primary/20 text-primary font-bold"
                                  : "bg-emerald-500/20 text-emerald-400 font-bold"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{l.flag}</span>
                              <span>{l.native}</span>
                            </span>
                            <span className="text-[10px] text-text-muted">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Floating Minimized Pill Button */}
          <button
            type="button"
            onClick={() => {
              if (bubbleDismissed && !isTourOpen) {
                setBubbleDismissed(false);
              } else {
                setCurrentStep(1);
                setIsTourOpen(true);
              }
            }}
            className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border transition-all duration-300 cursor-pointer active:scale-95 ${
              effectivePersona.includes("owner")
                ? "bg-surface/95 border-primary/50 hover:border-primary text-primary shadow-primary/25"
                : "bg-surface/95 border-emerald-500/50 hover:border-emerald-500 text-emerald-400 shadow-emerald-500/25"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-white shadow-md ${
                effectivePersona.includes("owner") ? "bg-primary" : "bg-emerald-600"
              }`}
            >
              <Sparkles size={14} className="animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                Guided Tour
              </span>
              <span className="text-xs font-bold text-text-primary">
                {launcherLabel}
              </span>
            </div>
            <Volume2
              size={14}
              className={effectivePersona.includes("owner") ? "text-primary ml-1" : "text-emerald-400 ml-1"}
            />
          </button>
        </div>
      )}

      {/* ================= FLOATING GUIDED TOUR HUD (BOTTOM CENTER) ================= */}
      {isTourOpen && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 transition-all duration-300"
          style={{ zIndex: 9999 }}
        >
          <div
            className={`bg-surface/95 backdrop-blur-2xl border-2 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-3.5 transition-all ${
              effectivePersona.includes("owner")
                ? "border-primary/40 shadow-primary/20"
                : "border-emerald-500/40 shadow-emerald-500/20"
            }`}
          >
            {/* Top Row: Context Badge + Interactive Language Switcher + Close */}
            <div className="flex items-center justify-between border-b border-divider pb-2.5">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${
                  effectivePersona.includes("owner")
                    ? "bg-primary/15 border-primary/25 text-primary"
                    : "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                }`}
              >
                <Sparkles size={13} className="animate-pulse" />
                <span>
                  {bubbleBadge} (Tab {currentStep} of {totalSteps})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setHudLangOpen(!hudLangOpen)}
                    className="text-[11px] font-semibold text-text-primary flex items-center gap-1.5 bg-app hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-divider cursor-pointer transition-colors"
                  >
                    <span>{currentLangObj.flag}</span>
                    <span>{currentLangObj.native}</span>
                    <ChevronDown size={11} className={hudLangOpen ? "rotate-180" : ""} />
                  </button>
                  {hudLangOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-44 rounded-2xl bg-surface border border-divider p-1.5 shadow-2xl z-50">
                      <div className="space-y-0.5">
                        {SUPPORTED_LANGUAGES.map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => switchLanguage(l.code)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                              l.code === selectedLang
                                ? effectivePersona.includes("owner")
                                  ? "bg-primary/20 text-primary font-bold"
                                  : "bg-emerald-500/20 text-emerald-400 font-bold"
                                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{l.flag}</span>
                              <span>{l.native}</span>
                            </span>
                            <span className="text-[10px] text-text-muted">{l.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeTour}
                  title="Close Tour"
                  className="h-7 w-7 rounded-full bg-app hover:bg-white/10 border border-divider text-text-muted hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Tab Quick-Jump Chips (Dashboard, Listings, Bookings, Earnings, Messages) */}
            {currentSteps[0]?.tabName && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
                {currentSteps.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => jumpToStep(s.step)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      currentStep === s.step
                        ? effectivePersona.includes("owner")
                          ? "bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary"
                          : "bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400"
                        : "bg-app text-text-muted hover:text-text-primary hover:bg-white/5 border border-divider"
                    }`}
                  >
                    <span>{s.tabName}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Middle Row: Step Progress, Title & Soundwave */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    effectivePersona.includes("owner") ? "text-primary" : "text-emerald-400"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>{activeStepConfig?.title}</span>
                </span>

                <span className="flex items-center gap-1">
                  {isLoading ? (
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <RefreshCw
                        size={11}
                        className={`animate-spin ${
                          effectivePersona.includes("owner") ? "text-primary" : "text-emerald-400"
                        }`}
                      />{" "}
                      Speaking...
                    </span>
                  ) : isPlaying ? (
                    <span className="flex items-center gap-0.5 h-3">
                      <span
                        className={`w-0.5 h-3 animate-[bounce_0.8s_infinite_100ms] rounded-full ${
                          effectivePersona.includes("owner") ? "bg-primary" : "bg-emerald-400"
                        }`}
                      />
                      <span
                        className={`w-0.5 h-2 animate-[bounce_0.8s_infinite_300ms] rounded-full ${
                          effectivePersona.includes("owner") ? "bg-primary" : "bg-emerald-400"
                        }`}
                      />
                      <span
                        className={`w-0.5 h-3.5 animate-[bounce_0.8s_infinite_200ms] rounded-full ${
                          effectivePersona.includes("owner") ? "bg-primary" : "bg-emerald-400"
                        }`}
                      />
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-muted">Paused</span>
                  )}
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {activeStepConfig?.desc}
              </p>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-app rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    effectivePersona.includes("owner")
                      ? "bg-gradient-to-r from-primary to-amber-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-400"
                  }`}
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Bottom Row: Controls */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-app hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed border border-divider text-xs text-text-secondary font-medium transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev Tab</span>
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                  effectivePersona.includes("owner")
                    ? "bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
                    : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause
                      size={13}
                      className={effectivePersona.includes("owner") ? "fill-primary" : "fill-emerald-400"}
                    />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play
                      size={13}
                      className={effectivePersona.includes("owner") ? "fill-primary" : "fill-emerald-400"}
                    />
                    <span>Play Audio</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === totalSteps}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-app hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed border border-divider text-xs text-text-secondary font-medium transition-colors cursor-pointer"
              >
                <span>Next Tab</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
