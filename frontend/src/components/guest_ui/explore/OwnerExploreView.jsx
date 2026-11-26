import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Calculator,
  Camera,
  Navigation,
  Wrench,
  Car,
  Tent,
  Gamepad2,
  Sparkles,
  TrendingUp,
  MapPin,
  Star,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthController from "../../auth/AuthController";
import useAuth from "../../../hooks/authHook";

import droneImg from "../../../assets/hero/drone.jpg";
import cameraImg from "../../../assets/hero/camera.jpg";
import drillImg from "../../../assets/hero/drill.jpg";
import bikeImg from "../../../assets/hero/bike.jpg";

export default function OwnerExploreView() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Calculator state
  const [calcRate, setCalcRate] = useState(1400);
  const [calcDays, setCalcDays] = useState(8);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const handleListAction = () => {
    if (user) {
      if (user.role === "owner" || user.roles === "owner") {
        navigate("/listings");
      } else {
        toast.error("Please log in with an Owner account to list equipment.");
        navigate("/role-redirect");
      }
    } else {
      setAuthMode("register");
      setAuthOpen(true);
    }
  };

  const handleLoginAction = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  const categories = [
    "All",
    "Cameras & Video",
    "Drones & Aerial",
    "Power Tools",
    "Bikes & Mobility",
    "Outdoors & Camping",
    "Gaming & Audio",
  ];

  const gearShowcase = [
    {
      id: "cam-1",
      title: "DSLR & Mirrorless Cameras (Sony / Canon)",
      category: "Cameras & Video",
      image: cameraImg,
      demandTag: "High Creator Demand",
      suggestedDailyRate: "₹1,200 – ₹1,600",
      calcRate: 1400,
      monthlyEstimate: "₹10,000 – ₹12,800",
      deposit: "₹20,000 – ₹25,000",
      useCase: "In demand on weekends for weddings, photoshoots, and travel vlogs.",
    },
    {
      id: "drone-1",
      title: "4K Drones & Action Cameras (DJI / GoPro)",
      category: "Drones & Aerial",
      image: droneImg,
      demandTag: "Top Weekend Earner",
      suggestedDailyRate: "₹1,500 – ₹2,200",
      calcRate: 1800,
      monthlyEstimate: "₹12,000 – ₹17,600",
      deposit: "₹25,000 – ₹30,000",
      useCase: "Rented frequently for aerial photography, events, and outdoor adventures.",
    },
    {
      id: "drill-1",
      title: "Power Tools & Cordless Drill Kits",
      category: "Power Tools",
      image: drillImg,
      demandTag: "Regular Weekend Rent",
      suggestedDailyRate: "₹350 – ₹500",
      calcRate: 400,
      monthlyEstimate: "₹2,800 – ₹4,000",
      deposit: "₹4,000 – ₹6,000",
      useCase: "Popular for home renovation, furniture assembly, and DIY weekend repairs.",
    },
    {
      id: "bike-1",
      title: "Cruisers & Two-Wheelers (Royal Enfield)",
      category: "Bikes & Mobility",
      image: bikeImg,
      demandTag: "Weekend Touring Demand",
      suggestedDailyRate: "₹650 – ₹900",
      calcRate: 750,
      monthlyEstimate: "₹5,200 – ₹7,200",
      deposit: "₹8,000 – ₹12,000",
      useCase: "High rental frequency for weekend getaways, road trips, and short stays.",
    },
    {
      id: "tent-1",
      title: "Camping Tents & Trekking Gear",
      category: "Outdoors & Camping",
      icon: <Tent className="size-8 text-primary" />,
      demandTag: "Seasonal & Holiday Trips",
      suggestedDailyRate: "₹300 – ₹450",
      calcRate: 350,
      monthlyEstimate: "₹2,400 – ₹3,600",
      deposit: "₹3,000 – ₹5,000",
      useCase: "Rented by students and trekkers for weekend camping expeditions.",
    },
    {
      id: "game-1",
      title: "Gaming Consoles (PS5 / Xbox)",
      category: "Gaming & Audio",
      icon: <Gamepad2 className="size-8 text-primary" />,
      demandTag: "Consistent Weekend Demand",
      suggestedDailyRate: "₹600 – ₹850",
      calcRate: 700,
      monthlyEstimate: "₹4,800 – ₹6,800",
      deposit: "₹15,000 – ₹20,000",
      useCase: "In demand for weekend house parties, tournaments, and holiday breaks.",
    },
  ];

  const filteredGear =
    selectedCategory === "All"
      ? gearShowcase
      : gearShowcase.filter((g) => g.category === selectedCategory);

  const presets = [
    { name: "Camera Kit", rate: 1400, days: 8, icon: <Camera className="size-4" /> },
    { name: "4K Drone", rate: 1800, days: 8, icon: <Navigation className="size-4" /> },
    { name: "Power Drill", rate: 400, days: 8, icon: <Wrench className="size-4" /> },
    { name: "Motorcycle", rate: 750, days: 8, icon: <Car className="size-4" /> },
  ];

  const selectPreset = (idx) => {
    setSelectedPresetIndex(idx);
    setCalcRate(presets[idx].rate);
    setCalcDays(presets[idx].days);
  };

  const grossEarnings = calcRate * calcDays;
  const platformFee = Math.round(grossEarnings * 0.1);
  const netEarnings = grossEarnings - platformFee;

  return (
    <div className="space-y-16 pb-12">
      {/* ================= HERO MONETIZATION BANNER ================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-surface via-app to-surface border border-primary/20 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
            <TrendingUp size={13} />
            <span>Owner Listing & Earnings Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.15]">
            Turn Unused Cameras, Tools & Gear into Monthly Income.
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed font-normal">
            Have equipment sitting idle on a shelf? Rent it safely to verified neighbors in your city.
            You set your own daily price, security deposits are held in escrow, and rental payouts
            go straight to your bank account.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleListAction}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-primary font-bold text-base transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>List Your First Item</span>
              <ArrowRight size={18} />
            </button>

            <a
              href="#earnings-calculator"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-surface hover:bg-white/5 border border-divider text-text-primary font-semibold text-sm transition-all"
            >
              <Calculator size={16} className="text-primary" />
              <span>Estimate Potential Earnings</span>
            </a>
          </div>

          {/* Quick Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-divider/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>100% Escrow Deposit</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <KeyRound size={16} className="text-primary shrink-0" />
              <span>6-Digit PIN Handover</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Verified Neighbors</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <TrendingUp size={16} className="text-amber-400 shrink-0" />
              <span>90% Net Bank Payout</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POPULAR GEAR EARNING POTENTIAL BENCHMARKS ================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Popular Equipment & Rental Earning Potential
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              Estimated benchmark earnings guide based on standard weekend rental rates (approx. 8 days/month) and 90% direct bank payout.
            </p>
          </div>

          <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/25 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start sm:self-auto">
            <span>Keep 90% of Every Booking</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-primary text-text-primary border-primary shadow-sm"
                  : "bg-surface border-divider text-text-secondary hover:text-text-primary hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Equipment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGear.map((item) => (
            <div
              key={item.id}
              className="group bg-surface rounded-2xl border border-divider hover:border-primary/40 transition-all shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image / Header */}
                <div className="relative aspect-video w-full bg-app/80 overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-16 rounded-2xl bg-surface border border-divider flex items-center justify-center">
                      {item.icon}
                    </div>
                  )}

                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white border border-white/10">
                    {item.demandTag}
                  </div>

                  <div className="absolute top-3 right-3 bg-emerald-500/95 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-white shadow-sm">
                    Est. {item.monthlyEstimate}/mo
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{item.category}</span>
                    <span className="text-[11px] font-semibold text-primary/80">Benchmark Guide</span>
                  </div>

                  <h3 className="font-bold text-text-primary text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {item.useCase}
                  </p>

                  {/* Financial Breakdown */}
                  <div className="p-3 rounded-xl bg-app border border-divider/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Typical Daily Price:</span>
                      <span className="font-bold text-text-primary">{item.suggestedDailyRate} / day</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Security Deposit (Escrow):</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Lock size={11} /> {item.deposit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-divider/60 font-semibold">
                      <span className="text-text-secondary">Est. Net Take-Home (8 days):</span>
                      <span className="font-extrabold text-primary">{item.monthlyEstimate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={handleListAction}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-text-primary font-bold text-xs transition-all border border-primary/30 cursor-pointer active:scale-95"
                >
                  <span>List This Type of Gear</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= INTERACTIVE EARNINGS CALCULATOR ================= */}
      <section
        id="earnings-calculator"
        className="rounded-3xl bg-surface border border-primary/20 p-8 sm:p-12 shadow-xl space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Calculator size={14} />
              <span>Interactive Net Payout Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Calculate Your Monthly Passive Income
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto">
            90% Net Bank Settlement
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Gear Type Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Select Gear Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => selectPreset(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedPresetIndex === idx
                        ? "bg-primary/15 border-primary text-text-primary shadow-sm"
                        : "bg-app border-divider text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <div className="size-7 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0">
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{p.name}</p>
                      <p className="text-[10px] text-text-muted">₹{p.rate}/day</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Your Daily Rental Price:
                </label>
                <span className="text-base font-extrabold text-primary">₹{calcRate} / day</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={calcRate}
                onChange={(e) => {
                  setCalcRate(Number(e.target.value));
                  setSelectedPresetIndex(-1);
                }}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>₹200 (Tools/DIY)</span>
                <span>₹1,500 (DSLR/Drones)</span>
                <span>₹5,000 (Cinema Gear)</span>
              </div>
            </div>

            {/* Rental Days Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Estimated Rental Days Per Month:
                </label>
                <span className="text-base font-extrabold text-primary">{calcDays} Days</span>
              </div>
              <input
                type="range"
                min="2"
                max="24"
                step="1"
                value={calcDays}
                onChange={(e) => setCalcDays(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted">
                <span>2 Days (1 Weekend)</span>
                <span>8 Days (2 Weekends - Average)</span>
                <span>20+ Days (Frequent)</span>
              </div>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-app border border-primary/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-1">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Net Estimated Payout
                </p>
                <div className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight">
                  ₹{netEarnings.toLocaleString()}
                  <span className="text-base font-semibold text-text-muted"> / month</span>
                </div>
              </div>

              {/* Payout Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-divider text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Gross Rental Revenue ({calcDays} days @ ₹{calcRate}):</span>
                  <span className="font-semibold text-text-primary">₹{grossEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Platform & Escrow Fee (10%):</span>
                  <span className="font-semibold text-rose-400">-₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-divider/60 font-bold text-sm text-text-primary">
                  <span>Take-Home Direct Deposit (90%):</span>
                  <span className="text-emerald-400 font-extrabold">₹{netEarnings.toLocaleString()}</span>
                </div>
              </div>

              <div className="rounded-xl bg-surface/80 border border-divider p-3 text-[11px] text-text-muted flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Payout is transferred straight to your bank account via Razorpay once the item is
                  returned and inspected.
                </span>
              </div>

              <button
                onClick={handleListAction}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-text-primary font-bold text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>List at This Rate & Start Earning</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4-STEP HOW IT WORKS FOR OWNERS ================= */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            How Renting Out Works
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Safe, verified, and escrow-protected at every step.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-surface border border-divider space-y-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-extrabold flex items-center justify-center text-base">
              1
            </div>
            <h3 className="font-bold text-text-primary text-base">Snap & Set Price</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload 2-3 clear photos of your equipment, specify your daily rental price and required security deposit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-divider space-y-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-extrabold flex items-center justify-center text-base">
              2
            </div>
            <h3 className="font-bold text-text-primary text-base">Approve Verified Neighbors</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Review rental requests. See the borrower's verified profile, ratings, and requested rental dates before accepting.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-divider space-y-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-extrabold flex items-center justify-center text-base">
              3
            </div>
            <h3 className="font-bold text-text-primary text-base">6-Digit PIN Handover</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Release your item only after verifying the renter's unique 6-digit PIN. The deposit remains safely locked in escrow.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-divider space-y-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-base">
              4
            </div>
            <h3 className="font-bold text-text-primary text-base">Direct Bank Settlement</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Once your gear is safely returned, 90% net earnings are immediately transferred to your registered bank account.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FINAL REGISTRATION CALL TO ACTION ================= */}
      <section className="rounded-3xl bg-gradient-to-r from-surface via-app to-surface border border-primary/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight max-w-xl mx-auto">
          Have Equipment Sitting Idle on a Shelf Right Now?
        </h2>

        <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto">
          Join thousands of equipment owners earning steady monthly passive income with 100% escrow protection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={handleListAction}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-primary hover:bg-primary-hover text-text-primary font-bold text-base transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <span>Register as Owner & List Gear</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={handleLoginAction}
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-surface hover:bg-white/5 border border-divider text-text-primary font-semibold text-sm transition-all cursor-pointer"
          >
            Already an Owner? Sign In
          </button>
        </div>
      </section>

      {/* Auth Controller Modal configured for Owner */}
      <AuthController
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
        initialRole="owner"
      />
    </div>
  );
}
