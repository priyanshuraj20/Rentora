import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
import AuthController from "../../auth/AuthController";
import useAuth from "../../../hooks/authHook";

export default function CTA({ homeMode = "owner" }) {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwner = homeMode === "owner";

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
        <div
          className={`max-w-4xl mx-auto rounded-3xl p-10 md:p-14 text-center relative overflow-hidden bg-surface border shadow-xl ${
            isOwner ? "border-primary/25" : "border-emerald-500/25"
          }`}
        >
          {/* Main Content */}
          <div className="relative z-10 py-2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-5 leading-[1.15] tracking-tight">
              {isOwner ? (
                <>
                  Ready to Make More <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-[#ff8c53] via-primary to-amber-400 bg-clip-text text-transparent font-extrabold">
                    of What You Own?
                  </span>
                </>
              ) : (
                <>
                  Ready to Rent What You Need <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent font-extrabold">
                    Without Buying?
                  </span>
                </>
              )}
            </h2>

            <p className="text-base md:text-lg text-text-secondary mb-8 max-w-xl mx-auto font-normal leading-relaxed">
              {isOwner
                ? "Start sharing your cameras, tools, or gear safely. Set your own pricing, lock 100% security deposits in escrow, and take home 90% net earnings directly to your bank account."
                : "Borrow verified cameras, drones, tools, and bikes from trusted people in your city. 100% refundable security deposit and 6-digit PIN delivery protection."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
              {isOwner ? (
                <>
                  <button
                    onClick={handleStartEarning}
                    className="flex-1 bg-primary text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>List Your First Item</span>
                    <ArrowRight size={18} />
                  </button>
                  <Link
                    to="/explore"
                    className="flex-1 bg-card px-8 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Explore Catalog</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/explore"
                    className="flex-1 bg-emerald-600 text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-emerald-500 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Browse All Equipment</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={handleStartEarning}
                    className="flex-1 bg-card px-8 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>List Gear & Earn</span>
                  </button>
                </>
              )}
            </div>

            {/* Benefit Indicators */}
            <div className="mt-10 pt-6 border-t border-divider flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <ShieldCheck size={16} className={isOwner ? "text-primary" : "text-emerald-400"} />
                100% Escrow Protection
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <KeyRound size={16} className={isOwner ? "text-primary" : "text-emerald-400"} />
                Verified 6-Digit PIN Handover
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
                <Sparkles size={16} className={isOwner ? "text-primary" : "text-emerald-400"} />
                {isOwner ? "90% Net Bank Payout" : "Inspected Equipment"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthController
        open={authOpen}
        defaultMode="register"
        initialRole={isOwner ? "owner" : "renter"}
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}
