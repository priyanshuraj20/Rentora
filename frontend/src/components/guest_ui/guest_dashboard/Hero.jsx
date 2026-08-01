import { Link } from "react-router-dom";
import { useState } from "react";
import AuthController from "../../auth/AuthController";
import { IndianRupee, ArrowRight } from "lucide-react";

const Hero = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <section className="relative min-h-[670px] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-app">

      {/* Subtle radial glow to match the image vibe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* ================= Floating Cards (Left) ================= */}
      <div className="absolute top-[35%] -left-12 hidden xl:block animate-[float_4s_ease-in-out_infinite] z-0">
        <div className="bg-card p-4 rounded-[32px] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-64 -rotate-12 translate-x-10">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-black/40">
            <img
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600"
              alt="Camera Gear"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold text-text-primary tracking-wide">
              Camera Rig Pro
            </span>
            <span className="text-[11px] font-black text-white/90 flex items-center"><IndianRupee className="size-3" />500/day</span>
          </div>
        </div>
      </div>

      {/* ================= Floating Cards (Right) ================= */}
      <div className="absolute bottom-[20%] -right-8 hidden xl:block animate-[float_5s_ease-in-out_infinite] z-0">
        <div className="bg-card p-6 rounded-[32px] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] w-60 rotate-12 relative overflow-hidden">
          <div className="flex items-center space-x-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black shadow-[0_0_20px_rgba(126,252,232,0.4)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase font-black tracking-widest text-text-muted leading-tight mb-1">
                Trusted Owner
              </p>
              <p className="text-sm font-bold text-text-primary">Vivek Singh</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-divider rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[95%] shadow-[0_0_8px_rgba(126,252,232,0.6)]" />
          </div>
          {/* Bottom accent line from design */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20 blur-[2px]" />
        </div>
      </div>

      {/* ================= Hero Content ================= */}
      <div className="relative z-10 max-w-6xl mx-auto py-12 flex flex-col items-center">

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-[110px] font-[900] leading-[0.95] mb-10 tracking-tight text-text-primary">
          Rent Anything. <br />
          <span className="bg-gradient-to-r from-primary via-[#42a8f8] to-primary bg-clip-text text-transparent animate-gradient pb-4 block">
            Anytime. Locally.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl xl:text-2xl text-text-secondary max-w-3xl mx-auto mb-16 leading-relaxed font-medium px-4">
          The ultra-modern marketplace for high-end gear. Access premium equipment without the ownership burden. Curated by experts, trusted by locals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-xl px-4">

          {/* Primary Button */}
          <Link
            to="/explore"
            className="group flex-1 bg-primary text-app px-10 py-5 rounded-full font-black text-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Start Browsing
            <ArrowRight />
          </Link>

          {/* Secondary Button */}
          <button
            onClick={() => openAuth('register')}
            className="flex-1 bg-surface px-10 py-5 rounded-full font-black text-lg border border-white/10 hover:bg-white/10 transition-all text-text-primary active:scale-95 shadow-xl"
          >
            List Your Gear
          </button>

        </div>

      </div>

      <AuthController
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />

    </section>
  );
};

export default Hero;