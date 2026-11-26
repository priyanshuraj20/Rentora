import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Mic,
  KeyRound,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import Hero from "../../components/guest_ui/guest_dashboard/Hero";
import Steps from "../../components/guest_ui/guest_dashboard/Steps";
import Categories from "../../components/guest_ui/guest_dashboard/Categories";
import Trust from "../../components/guest_ui/guest_dashboard/Trust";
import OwnerIncomeSection from "../../components/guest_ui/guest_dashboard/OwnerIncomeSection";
import CTA from "../../components/guest_ui/guest_dashboard/CTA";
import VoiceBookingAgentModal from "../../components/common/VoiceBookingAgentModal";
import AuthController from "../../components/auth/AuthController";
import useAuth from "../../hooks/authHook";
import homeRedirect from "../../hooks/homeRedirect";

const GuestHome = () => {
  homeRedirect();
  const location = useLocation();
  const navigate = useNavigate();

  const [homeMode, setHomeMode] = useState(() => {
    return localStorage.getItem("rentora_home_mode") || "owner";
  });
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Synchronize home mode with navbar voice tour or hero tab switches
  useEffect(() => {
    const handleModeChange = (e) => {
      if (e.detail?.mode && (e.detail.mode === "owner" || e.detail.mode === "renter")) {
        setHomeMode(e.detail.mode);
      }
    };
    const handleOpenVoice = () => {
      if (!user) {
        toast("Please sign in as a Renter to use Voice Booking", { icon: "🎙" });
        setAuthMode("login");
        setAuthOpen(true);
      } else if (user.role === "owner" || user.roles === "owner") {
        toast.error("Voice Booking is built for Renters. Please switch to a Renter account.");
      } else {
        setVoiceAgentOpen(true);
      }
    };

    window.addEventListener("rentora:mode-change", handleModeChange);
    window.addEventListener("rentora:open-voice-agent", handleOpenVoice);
    return () => {
      window.removeEventListener("rentora:mode-change", handleModeChange);
      window.removeEventListener("rentora:open-voice-agent", handleOpenVoice);
    };
  }, []);

  useEffect(() => {
    if (location.hash === "#how-it-works") {
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <>
      <main className="bg-app min-h-screen relative">
        {/* Step 1: Hero */}
        <div id="tour-hero" className="transition-all duration-700">
          <Hero activeTab={homeMode} onTabChange={(m) => setHomeMode(m)} />
        </div>

        {/* How it works: Steps */}
        <div id="tour-how-it-works" className="transition-all duration-700">
          <Steps />
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE SPOTLIGHT: AUTONOMOUS VOICE AI & CORE TRUST   */}
        {/* ========================================================= */}
        <div id="tour-spotlight" className="transition-all duration-700">
          <section className="max-w-[1400px] mx-auto px-6 my-12 space-y-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
              Speak to Rent in Seconds. <br />
              <span className="bg-gradient-to-r from-primary via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                Guaranteed by 100% Escrow Protection.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
              No forms. No typing. Speak naturally in Hinglish, Hindi, or English. Our AI matches neighborhood inventory, verifies calendar availability, and generates your instant booking card.
            </p>
          </div>

          {/* 3 Interactive Showcase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Autonomous Indic Voice Booking */}
            <div className="relative rounded-3xl bg-surface/90 border border-primary/35 p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full overflow-hidden group hover:border-primary/60 transition-all space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shadow-sm">
                    <Mic size={24} className="animate-pulse" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary px-2.5 py-1 rounded-full border border-primary/30">
                    Sarvam AI Voice
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text-primary">
                    Speak Naturally to Rent Anything
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Powered by Sarvam AI Saaras STT & Bulbul TTS in 11 Indian languages. Instant gear match without typing.
                  </p>
                </div>

                {/* Simulated Voice Waveform & Prompt */}
                <div className="p-3.5 rounded-2xl bg-app border border-divider space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Try Saying:</span>
                    <span className="text-primary font-bold">11 Indic Languages</span>
                  </div>
                  <div className="text-xs text-text-primary italic font-medium bg-surface/80 p-2.5 rounded-xl border border-divider/60">
                    "Bhai Sony camera chahiye weekend ke liye Indiranagar mein"
                  </div>
                  <div className="flex items-center gap-1 justify-center pt-1 h-5">
                    {[12, 24, 16, 28, 14, 22, 32, 18, 26, 12, 20].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-primary/70 rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Aligned Status Footer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/25 text-[11px] font-semibold text-primary">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Real-time Indic Voice Pipeline</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-text-muted bg-app px-2 py-0.5 rounded">Active</span>
              </div>
            </div>

            {/* Card 2: 15-Second Dynamic Rotating Handover PIN */}
            <div className="relative rounded-3xl bg-surface/90 border border-purple-500/35 p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full overflow-hidden group hover:border-purple-500/60 transition-all space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center shadow-sm">
                    <KeyRound size={24} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                    Zero-Fraud Handover
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text-primary">
                    15s Dynamic Rotating PIN
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Prevents screenshot theft and false non-delivery claims. TOTP code auto-rotates every 15 seconds.
                  </p>
                </div>

                {/* Interactive PIN Simulation Box */}
                <div className="p-3.5 rounded-2xl bg-app border border-divider space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Renter Live Delivery PIN:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>15s Dynamic</span>
                    </span>
                  </div>
                  <div className="flex justify-center gap-2 pt-1">
                    {["4", "8", "2", "9", "1", "7"].map((digit, i) => (
                      <span
                        key={i}
                        className="w-8 h-10 rounded-xl bg-surface border border-purple-500/40 text-text-primary font-mono font-black text-base flex items-center justify-center shadow-sm"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted text-center pt-0.5">
                    Owner enters renter's live 15s PIN before gear is released.
                  </p>
                </div>
              </div>

              {/* Aligned Status Footer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-[11px] font-semibold text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Dynamic Rotating TOTP Engine</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-text-muted bg-app px-2 py-0.5 rounded">Active</span>
              </div>
            </div>

            {/* Card 3: Razorpay Escrow Protection */}
            <div className="relative rounded-3xl bg-surface/90 border border-emerald-500/35 p-6 sm:p-7 shadow-xl flex flex-col justify-between h-full overflow-hidden group hover:border-emerald-500/60 transition-all space-y-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shadow-sm">
                    <CreditCard size={24} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Razorpay Escrow Vault
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-text-primary">
                    100% Escrow Protection
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Rent & refundable security deposits remain locked until inspection. Zero direct cash risk.
                  </p>
                </div>

                {/* Escrow Steps Timeline */}
                <div className="p-3.5 rounded-2xl bg-app border border-divider space-y-2 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>1. Renter Pays:</span>
                    <span className="font-bold text-text-primary">Locked in Escrow</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>2. PIN Verified:</span>
                    <span className="font-bold text-emerald-400">Owner Receives Rent</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>3. Gear Returned:</span>
                    <span className="font-bold text-blue-400">Deposit Refunded</span>
                  </div>
                </div>
              </div>

              {/* Aligned Status Footer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-semibold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Automated Escrow Smart Contracts</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-text-muted bg-app px-2 py-0.5 rounded">Secured</span>
              </div>
            </div>

          </div>

          {/* Bottom Features Banner: Link to Complete Features Hub */}
          <div className="rounded-2xl bg-surface border border-divider p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  Want to explore all 24+ platform features?
                </h4>
                <p className="text-xs text-text-secondary">
                  Detailed architectural breakdown of Renter tools, Owner monetization, and AI security.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>View Features Hub</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

        </section>
        </div>

        {/* Subtle Gradient Divider */}
        <div
          className="h-px w-full max-w-[1400px] mx-auto opacity-[0.15]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(232,115,74,0.4), transparent)" }}
        />

        {/* Step 3 (Renter): Categories & Gear - Shown only in Renter mode as requested */}
        {homeMode === "renter" && (
          <div id="tour-categories" className="transition-all duration-700">
            <Categories />
          </div>
        )}

        {/* Step 3 (Owner): Income Calculator & Monetization - Shown only in Owner mode as requested */}
        {homeMode === "owner" && (
          <div id="tour-owner-income" className="transition-all duration-700">
            <OwnerIncomeSection />
          </div>
        )}

        {/* Step Platform Protection: Trust & Security */}
        <div id="tour-trust" className="transition-all duration-700">
          <Trust />
        </div>

        {/* Step 4: CTA & Final Onboarding */}
        <div id="tour-cta" className="transition-all duration-700">
          <CTA homeMode={homeMode} />
        </div>
      </main>

      {/* Mount Live Voice Booking Agent & Auth Modals */}
      <VoiceBookingAgentModal
        open={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthOpen(true);
        }}
      />

      <AuthController
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
        initialRole={homeMode}
      />
    </>
  );
};

export default GuestHome;
