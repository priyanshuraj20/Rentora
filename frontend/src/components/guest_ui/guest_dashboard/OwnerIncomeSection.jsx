import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Wrench,
  Navigation,
  Car,
  Sparkles,
  Zap,
  KeyRound,
  Calculator,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthController from "../../auth/AuthController";
import useAuth from "../../../hooks/authHook";

export default function OwnerIncomeSection() {
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(8);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleListClick = () => {
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

  const assetExamples = [
    {
      title: "Sony Alpha A7 IV Mirrorless",
      category: "Photography & Creator",
      ratePerDay: 1400,
      deposit: 25000,
      icon: <Camera className="size-5 text-primary" />,
      popular: "High Demand",
    },
    {
      title: "DJI Mini 3 Pro 4K Drone Kit",
      category: "Drones & Aerial Video",
      ratePerDay: 1800,
      deposit: 30000,
      icon: <Navigation className="size-5 text-emerald-400" />,
      popular: "Trending",
    },
    {
      title: "DeWalt 20V Cordless Hammer Kit",
      category: "Tools & Renovation",
      ratePerDay: 400,
      deposit: 5000,
      icon: <Wrench className="size-5 text-amber-400" />,
      popular: "Consistent Weekend Rent",
    },
    {
      title: "Royal Enfield Classic 350",
      category: "Motorcycles & Commute",
      ratePerDay: 750,
      deposit: 10000,
      icon: <Car className="size-5 text-purple-400" />,
      popular: "Weekend Touring",
    },
  ];

  const currentAsset = assetExamples[selectedAssetIndex];
  const grossEarnings = currentAsset.ratePerDay * selectedDays;
  const netEarnings = Math.round(grossEarnings * 0.9); // 90% payout to owner

  return (
    <section className="py-20 border-t border-divider bg-surface relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-12 items-center">

          {/* Left Column: Heading & Value Points */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary leading-[1.15] mb-5 tracking-tight">
              Your Unused Things Could Be Someone Else's Next Necessity.
            </h2>

            <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed font-normal max-w-xl">
              That camera sitting in your cupboard, the power tools in your garage, or the drone you only fly once a month could help someone nearby while generating steady monthly passive income for you.
            </p>

            {/* 4 Owner Guarantees */}
            <div className="space-y-4 mb-8 w-full max-w-xl">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-app/60 border border-divider">
                <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Gemini AI Snap-to-List (30 Seconds)
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Zero tedious typing. Snap 1 photo with your phone — Google Gemini AI auto-detects brand & model, writes specs, and recommends optimal rental pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-app/60 border border-divider">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    100% Security Deposit Escrow
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Renters pre-authorize a full refundable security deposit into platform escrow before touching your gear. Zero personal financial risk.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-app/60 border border-divider">
                <KeyRound className="size-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Cryptographic 6-Digit PIN Handover
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Gear is released only when you verify the renter's secret 1-time PIN + record acoustic consent. Eliminates non-delivery disputes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-app/60 border border-divider">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Guaranteed 90% Net Bank Payout
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Rentora takes only a modest 10% platform fee. All rental payouts are automatically settled straight into your bank account via Razorpay.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button: Single Bold Focused CTA */}
            <div className="pt-2 w-full max-w-md">
              <button
                type="button"
                onClick={handleListClick}
                className="group w-full sm:w-auto bg-primary text-text-primary px-8 py-4 rounded-xl font-bold text-base hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer font-display"
              >
                <span>List Your First Item</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Passive Income Calculator Card */}
          <div className="lg:col-span-6">
            <div className="bg-app border border-divider rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Card Header with Calculator Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-divider">
                <div>
                  <div className="flex items-center gap-2">
                    <Calculator className="size-4 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">
                      Passive Income Calculator
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Select equipment to estimate your monthly earnings
                  </p>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Live Simulator
                </span>
              </div>

              {/* Equipment Selector Chips */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Select Your Gear Type:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {assetExamples.map((item, idx) => {
                    const isSelected = selectedAssetIndex === idx;
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => setSelectedAssetIndex(idx)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-primary/10 border-primary text-text-primary shadow-sm"
                            : "bg-surface border-divider text-text-secondary hover:border-white/20"
                        }`}
                      >
                        <div className="size-8 rounded-lg bg-app flex items-center justify-center border border-divider shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-text-primary">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            ₹{item.ratePerDay}/day • {item.popular}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Days Rented Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Estimated Rental Days Per Month:
                  </p>
                  <span className="text-xs font-bold text-primary">
                    {selectedDays} Days / Month
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 8, 12, 16].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setSelectedDays(days)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        selectedDays === days
                          ? "bg-primary text-text-primary border-primary shadow-sm"
                          : "bg-surface border-divider text-text-secondary hover:border-white/20"
                      }`}
                    >
                      {days} Days {days === 8 && "(Avg)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Earnings Display Box */}
              <div className="p-5 rounded-2xl bg-surface border border-primary/20 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-text-secondary">
                    Your 90% Net Take-Home:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-primary">
                      ₹{netEarnings.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted font-medium"> / month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-divider text-xs">
                  <div>
                    <span className="text-text-muted text-[11px] block">Gross Daily Rate:</span>
                    <span className="font-bold text-text-primary">
                      ₹{currentAsset.ratePerDay} / day
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-text-muted text-[11px] block">Security Deposit Held:</span>
                    <span className="font-bold text-emerald-400">
                      ₹{currentAsset.deposit.toLocaleString()} (Escrow)
                    </span>
                  </div>
                </div>
              </div>

              {/* Guarantee Footer */}
              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <p className="text-xs text-text-secondary leading-snug">
                  <strong className="text-text-primary font-semibold">Zero Direct Cash Risk:</strong> Rentora collects deposit upfront and transfers net rent directly to your bank upon verified return.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      <AuthController
        open={authOpen}
        defaultMode="register"
        initialRole="owner"
        onClose={() => setAuthOpen(false)}
      />
    </section>
  );
}