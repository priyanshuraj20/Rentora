import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  IndianRupee,
  MapPin,
  Mic,
  CheckCircle2,
} from "lucide-react";
import AuthController from "../../auth/AuthController";
import VoiceBookingAgentModal from "../../common/VoiceBookingAgentModal";
import useAuth from "../../../hooks/authHook";

import cameraImg from "../../../assets/hero/camera.jpg";
import droneImg from "../../../assets/hero/drone.jpg";
import bikeImg from "../../../assets/hero/bike.jpg";
import drillImg from "../../../assets/hero/drill.jpg";

// Curated high-quality community assets with Owner and Renter metrics
const curatedFeaturedItems = [
  {
    id: "featured-camera",
    title: "Sony Alpha A7 IV Mirrorless Camera",
    category: "Electronics",
    image: cameraImg,
    dailyPrice: 1400,
    deposit: 8000,
    monthlyEarnings: 11200,
    escrowProtection: 25000,
    rating: 4.9,
    reviewsCount: 38,
    locality: "Indiranagar, Bangalore",
    renterHighlight: "Creator Ready",
    ownerHighlight: "Earns ~₹11,200/mo (8 days rented)",
    link: "/explore?category=Electronics",
  },
  {
    id: "featured-drone",
    title: "DJI Mini 3 Pro 4K Drone Combo",
    category: "Electronics",
    image: droneImg,
    dailyPrice: 1800,
    deposit: 12000,
    monthlyEarnings: 14400,
    escrowProtection: 30000,
    rating: 4.9,
    reviewsCount: 42,
    locality: "Alkapuri, Vadodara",
    renterHighlight: "4K HDR Video",
    ownerHighlight: "Earns ~₹14,400/mo (8 days rented)",
    link: "/explore?category=Electronics",
  },
  {
    id: "featured-bike",
    title: "Royal Enfield Classic 350 — Stealth Black",
    category: "Vehicles",
    image: bikeImg,
    dailyPrice: 750,
    deposit: 10000,
    monthlyEarnings: 6000,
    escrowProtection: 10000,
    rating: 4.8,
    reviewsCount: 56,
    locality: "Bandra West, Mumbai",
    renterHighlight: "Verified Documents",
    ownerHighlight: "Earns ~₹6,000/mo (weekend rentals)",
    link: "/explore?category=Vehicles",
  },
  {
    id: "featured-drill",
    title: "DeWalt 20V Cordless Hammer Drill Kit",
    category: "Tools",
    image: drillImg,
    dailyPrice: 350,
    deposit: 5000,
    monthlyEarnings: 3200,
    escrowProtection: 5000,
    rating: 4.9,
    reviewsCount: 19,
    locality: "Koramangala, Bangalore",
    renterHighlight: "Heavy Duty Kit",
    ownerHighlight: "Earns ~₹3,200/mo (DIY projects)",
    link: "/explore?category=Tools",
  },
];

const Hero = ({ activeTab: externalTab = null, onTabChange = null }) => {
  // Owner mode active initially on landing as requested
  const [internalTab, setInternalTab] = useState(() => {
    return localStorage.getItem("rentora_home_mode") || "owner";
  });
  const activeTab = externalTab || internalTab;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("register");
  const [authRole, setAuthRole] = useState("owner");
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Listen for mode changes triggered across components (e.g., from Voice Tour)
  useEffect(() => {
    const handleMode = (e) => {
      const mode = e.detail?.mode;
      if (mode && (mode === "owner" || mode === "renter")) {
        setInternalTab(mode);
        if (externalTab !== mode) {
          onTabChange?.(mode);
        }
      }
    };
    const handleOpenAuth = (e) => {
      setAuthMode(e.detail?.mode || "register");
      setAuthRole(e.detail?.role || "owner");
      setAuthOpen(true);
    };

    window.addEventListener("rentora:mode-change", handleMode);
    window.addEventListener("rentora:open-auth", handleOpenAuth);
    return () => {
      window.removeEventListener("rentora:mode-change", handleMode);
      window.removeEventListener("rentora:open-auth", handleOpenAuth);
    };
  }, [externalTab, onTabChange]);

  const handleTabSwitch = (newTab) => {
    setInternalTab(newTab);
    localStorage.setItem("rentora_home_mode", newTab);
    onTabChange?.(newTab);
    window.dispatchEvent(new CustomEvent("rentora:mode-change", { detail: { mode: newTab } }));
  };

  const activeItem = curatedFeaturedItems[currentSlide % curatedFeaturedItems.length];

  // Auto-advance slideshow
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % curatedFeaturedItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % curatedFeaturedItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + curatedFeaturedItems.length) % curatedFeaturedItems.length);
  };

  const handleOwnerAction = () => {
    if (user) {
      if (user.role === "owner" || user.roles === "owner") {
        navigate("/listings");
      } else {
        navigate("/role-redirect");
      }
    } else {
      setAuthMode("register");
      setAuthRole("owner");
      setAuthOpen(true);
    }
  };

  return (
    <section className="relative min-h-[640px] flex items-center bg-app py-10 lg:py-16 overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">

        {/* ================= Dual Mode Switcher (No emojis, clean modern corners) ================= */}
        <div className="flex justify-center sm:justify-start mb-8">
          <div className="inline-flex p-1 rounded-xl bg-surface border border-divider shadow-sm">
            
            {/* 1. Owner Tab (Orange Theme, Default Active) */}
            <button
              type="button"
              onClick={() => handleTabSwitch("owner")}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "owner"
                  ? "bg-primary text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <span>List & Earn</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                Owner
              </span>
            </button>

            {/* 2. Renter Tab (Green Theme) */}
            <button
              type="button"
              onClick={() => handleTabSwitch("renter")}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "renter"
                  ? "bg-emerald-600 text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5"
              }`}
            >
              <span>Browse & Rent</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                Renter
              </span>
            </button>
          </div>
        </div>

        {/* ================= Main Grid: Clean & Balanced ================= */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">

          {/* ================= Left Column ================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-left flex flex-col justify-between">
            
            {/* Top Text Content */}
            <div>
              {activeTab === "owner" ? (
                <>
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.12] mb-5 tracking-tight text-text-primary">
                    Turn Unused Items into Income. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-[#ff8c53] via-[#e8734a] to-[#f59e0b] bg-clip-text text-transparent font-extrabold">
                      Rent Safely to People in Your City.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-text-secondary mb-7 leading-relaxed font-normal max-w-xl">
                    Have cameras, drones, or power tools lying around at home? Rent them safely to verified people in your neighborhood. You set your own daily price, security deposits are held in escrow, and rental payouts go straight to your bank account.
                  </p>

                  {/* Owner Action (Orange Theme, Clean rounded-xl) */}
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={handleOwnerAction}
                      className="group bg-primary hover:bg-primary-hover text-text-primary px-8 py-3.5 rounded-xl font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer font-display"
                    >
                      <span>List Your First Item</span>
                      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                  {/* Owner Clean Value Points (No AI badges / spam) */}
                  <div className="space-y-3 pt-6 border-t border-divider/60 w-full max-w-lg">
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span>Full control over your daily pricing, availability schedule, and rental rules.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span>100% security deposit locked safely in escrow before gear is handed over.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <span>Verified 6-digit PIN handover protects against false non-delivery claims.</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.12] mb-5 tracking-tight text-text-primary">
                    Rent What You Need for a Few Days. <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent font-extrabold">
                      Why Buy When You Can Borrow Nearby?
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-text-secondary mb-7 leading-relaxed font-normal max-w-xl">
                    Need a 4K camera, power drill, or bike for a weekend shoot or project? Borrow verified equipment from trusted people in your neighborhood at a fraction of the cost of buying new.
                  </p>

                  {/* Renter Actions (Green Theme, Clean rounded-xl) */}
                  <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-8">
                    <Link
                      to="/explore"
                      className="group bg-emerald-600 hover:bg-emerald-500 text-text-primary px-7 py-3.5 rounded-xl font-bold text-base active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md font-display"
                    >
                      <span>Browse All Equipment</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setVoiceAgentOpen(true)}
                      className="bg-surface px-6 py-3.5 rounded-xl font-semibold text-sm border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/5 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm font-display"
                    >
                      <Mic className="size-4" />
                      <span>Try Voice Booking (11 Langs)</span>
                    </button>
                  </div>

                  {/* Renter Clean Value Points */}
                  <div className="space-y-3 pt-6 border-t border-divider/60 w-full max-w-lg">
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Borrow inspected, verified equipment from neighbors in your city.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>100% refundable security deposits automatically returned upon return.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-text-secondary">
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Speak naturally in Hindi, Hinglish, or English to find and book gear instantly.</span>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* ================= Right Column: Showcase Card (Orange for Owner, Green for Renter) ================= */}
          <div className="lg:col-span-6 xl:col-span-6">
            
            {/* Header: Clean Title + Link */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeTab === "owner" ? "bg-primary" : "bg-emerald-400"}`} />
                <span className="text-xs font-bold text-text-primary tracking-wide">
                  {activeTab === "owner" ? "Community Owner Earnings" : "Equipment in Your City"}
                </span>
              </div>

              {activeTab === "owner" ? (
                <button
                  type="button"
                  onClick={handleOwnerAction}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  List Your Gear →
                </button>
              ) : (
                <Link
                  to="/explore"
                  className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View Catalog →
                </Link>
              )}
            </div>

            {/* Showcase Container (Clean rounded-2xl, no bubble pills) */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative rounded-2xl bg-surface border border-divider overflow-hidden shadow-xl transition-all duration-300"
            >
              {/* Image Display */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-black/40">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-black/60 backdrop-blur-md text-text-primary text-xs font-semibold px-3 py-1 rounded-md border border-white/10">
                    {activeItem.category}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-sm ${
                    activeTab === "owner"
                      ? "bg-primary text-white"
                      : "bg-emerald-600 text-white"
                  }`}>
                    {activeTab === "owner" ? activeItem.ownerHighlight : activeItem.renterHighlight}
                  </span>
                </div>

                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer shadow-md active:scale-95"
                  aria-label="Previous Item"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer shadow-md active:scale-95"
                  aria-label="Next Item"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Location Tag */}
                <div className="absolute bottom-3 left-4">
                  <span className="bg-black/70 backdrop-blur-md text-text-secondary text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                    <MapPin size={12} className={activeTab === "owner" ? "text-primary" : "text-emerald-400"} />
                    {activeItem.locality}
                  </span>
                </div>
              </div>

              {/* Bottom Details Panel */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-text-primary tracking-tight truncate">
                      {activeItem.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-warning flex items-center gap-1 font-bold">
                        <Star className="size-3.5 fill-warning" />
                        {activeItem.rating}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({activeItem.reviewsCount} verified rentals)
                      </span>
                    </div>
                  </div>

                  {/* Pricing Box (Orange for Owner, Green for Renter) */}
                  <div className="text-left sm:text-right shrink-0">
                    {activeTab === "owner" ? (
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-primary flex items-center sm:justify-end">
                          <IndianRupee className="size-5" />
                          {activeItem.monthlyEarnings.toLocaleString()}
                          <span className="text-xs text-text-muted font-normal ml-1">/month</span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          ₹{activeItem.escrowProtection.toLocaleString()} deposit escrow protected
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center sm:justify-end">
                          <IndianRupee className="size-5" />
                          {activeItem.dailyPrice}
                          <span className="text-xs text-text-muted font-normal ml-1">/day</span>
                        </div>
                        <p className="text-[11px] text-text-muted">
                          ₹{activeItem.deposit.toLocaleString()} refundable deposit
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Bar */}
                {activeTab === "owner" ? (
                  <div className="pt-2 border-t border-divider">
                    <button
                      type="button"
                      onClick={handleOwnerAction}
                      className="w-full bg-primary hover:bg-primary-hover text-text-primary py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer font-display"
                    >
                      <span>List Your Gear & Earn</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pt-2 border-t border-divider">
                    <Link
                      to={activeItem.link}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-text-primary py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 font-display"
                    >
                      <span>Rent This Gear</span>
                      <ArrowRight size={15} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setVoiceAgentOpen(true)}
                      className="px-4 py-3 rounded-xl bg-app hover:bg-white/5 border border-divider text-xs font-semibold text-text-primary transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Mic size={14} className="text-emerald-400" />
                      <span>Voice Book</span>
                    </button>
                  </div>
                )}

                {/* Thumbnail Strip (Quick Switcher) */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {curatedFeaturedItems.map((item, idx) => {
                    const isSelected = activeItem.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        className={`relative rounded-lg overflow-hidden aspect-[4/3] border transition-all cursor-pointer ${
                          isSelected
                            ? activeTab === "owner"
                              ? "border-primary ring-2 ring-primary/40 scale-100"
                              : "border-emerald-400 ring-2 ring-emerald-400/40 scale-100"
                            : "border-divider/70 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-1 left-1 right-1 text-center">
                          <span className="text-[9px] font-bold text-white bg-black/75 px-1 py-0.5 rounded truncate block">
                            {activeTab === "owner" ? `₹${(item.monthlyEarnings / 1000).toFixed(1)}k/mo` : `₹${item.dailyPrice}/day`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      <AuthController
        open={authOpen}
        defaultMode={authMode}
        initialRole={authRole}
        onClose={() => setAuthOpen(false)}
      />

      <VoiceBookingAgentModal
        open={voiceAgentOpen}
        onClose={() => setVoiceAgentOpen(false)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthRole("renter");
          setAuthOpen(true);
        }}
      />
    </section>
  );
};

export default Hero;
