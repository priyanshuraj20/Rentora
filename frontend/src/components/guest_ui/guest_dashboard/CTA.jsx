import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import AuthController from "../../auth/AuthController";
import useAuth from "../../../hooks/authHook";

export default function CTA() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartEarning = () => {
    if (user) {
      if (user.role === "owner" || user.roles === "owner") {
        navigate("/listings");
      } else {
        navigate("/role-redirect");
      }
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden border-t border-divider bg-app">
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 md:p-14 text-center relative overflow-hidden bg-surface border border-divider shadow-xl">

          {/* Main Content */}
          <div className="relative z-10 py-2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-5 leading-[1.15] tracking-tight">
              Ready to Make More <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-[#f59e0b] to-secondary-accent bg-clip-text text-transparent font-extrabold">
                of What You Own?
              </span>
            </h2>

            <p className="text-base md:text-lg text-text-secondary mb-8 max-w-xl mx-auto font-normal leading-relaxed">
              Start sharing what you have, discover what you need, and become part of a smarter community built around access, opportunity, and trust.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/explore"
                className="group flex-1 bg-primary text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
              >
                Explore Items
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={handleStartEarning}
                className="flex-1 bg-card px-8 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Start Earning
                <ArrowRight size={16} className="text-text-muted" />
              </button>
            </div>

            {/* Benefit Indicators */}
            <div className="mt-10 pt-6 border-t border-divider flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <ShieldCheck size={16} className="text-primary" />
                Platform Escrow Security
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <KeyRound size={16} className="text-primary" />
                Verified PIN Handovers
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Sparkles size={16} className="text-primary" />
                AI Condition Audits
              </div>
            </div>
          </div>
        </div>
      </div>

      {authOpen && (
        <AuthController
          isOpen={authOpen}
          initialMode="register"
          onClose={() => setAuthOpen(false)}
        />
      )}
    </section>
  );
}
