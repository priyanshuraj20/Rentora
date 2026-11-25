import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthController from "../../auth/AuthController";
import { ArrowRight, Star, ShieldCheck, IndianRupee, KeyRound, Sparkles, MapPin } from "lucide-react";

import cameraImg from "../../../assets/hero/camera.jpg";
import droneImg from "../../../assets/hero/drone.jpg";
import bikeImg from "../../../assets/hero/bike.jpg";
import drillImg from "../../../assets/hero/drill.jpg";

// Curated high-quality community assets bundled locally (100% immune to Unsplash downtime)
const curatedFeaturedItems = [
  {
    id: "featured-camera",
    title: "Sony Alpha A7 IV Mirrorless Camera",
    category: "Electronics",
    image: cameraImg,
    dailyPrice: 1400,
    rating: 4.9,
    reviewsCount: 38,
    locality: "Indiranagar",
    link: "/explore?category=Electronics",
  },
  {
    id: "featured-drone",
    title: "DJI Mini 3 Pro Drone Combo",
    category: "Electronics",
    image: droneImg,
    dailyPrice: 1800,
    rating: 4.9,
    reviewsCount: 42,
    locality: "Alkapuri",
    link: "/explore?category=Electronics",
  },
  {
    id: "featured-bike",
    title: "Royal Enfield Classic 350 — Stealth Black",
    category: "Vehicles",
    image: bikeImg,
    dailyPrice: 750,
    rating: 4.8,
    reviewsCount: 56,
    locality: "Bandra West",
    link: "/explore?category=Vehicles",
  },
  {
    id: "featured-drill",
    title: "DeWalt 20V Cordless Hammer Drill Kit",
    category: "Tools",
    image: drillImg,
    dailyPrice: 350,
    rating: 4.9,
    reviewsCount: 19,
    locality: "Koramangala",
    link: "/explore?category=Tools",
  },
];

const Hero = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <section className="relative min-h-[620px] flex items-center bg-app py-12 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* ================= Left Column: Hero Text ================= */}
          <div className="lg:col-span-6 xl:col-span-6 text-left flex flex-col items-start">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-black leading-[1.08] mb-6 tracking-[-0.035em] text-text-primary">
              Make More of <br className="hidden sm:inline" />
              What You Own.
              <span className="block mt-2 bg-gradient-to-r from-[#f08558] via-[#e8734a] to-[#d4a24c] bg-clip-text text-transparent font-black tracking-[-0.035em] pb-1">
                Turn Your Unused Assets Into Income.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed font-normal max-w-xl">
              Your unused belongings can be more valuable than you think. List what you own, earn by sharing it with people nearby, or discover and rent the things you need without the cost of ownership.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-10">
              <Link
                to="/explore"
                className="group bg-primary text-text-primary px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md"
              >
                Explore Items
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => openAuth('register')}
                className="bg-surface px-7 py-3.5 rounded-xl font-semibold text-base border border-divider hover:bg-white/5 transition-all text-text-primary active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Start Earning
                <ArrowRight className="size-4 text-text-muted" />
              </button>
            </div>

            {/* Trust Pill Indicators */}
            <div className="flex items-center gap-6 pt-6 border-t border-divider w-full flex-wrap">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <ShieldCheck className="size-4 text-success" />
                <span>Platform Escrow Protection</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <KeyRound className="size-4 text-primary" />
                <span>Verified 6-Digit PIN Handover</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                <Sparkles className="size-4 text-warning" />
                <span>AI Condition Inspection</span>
              </div>
            </div>

          </div>

          {/* ================= Right Column: Curated Community Assets Grid ================= */}
          <div className="lg:col-span-6 xl:col-span-6">
            
            {/* Header Title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Featured Community Assets
                </span>
              </div>
              <Link to="/explore" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Explore All Items →
              </Link>
            </div>

            {/* Curated High-Quality Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curatedFeaturedItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="group bg-surface border border-divider rounded-2xl p-3 flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-sm hover:-translate-y-0.5"
                >
                  {/* Image Container with Local Asset Guarantee */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-card border border-divider">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="bg-app/85 backdrop-blur-xs text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-divider uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-2">
                      <span className="bg-app/80 backdrop-blur-xs text-text-secondary text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 border border-divider/60">
                        <MapPin size={9} className="text-primary" />
                        {item.locality}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <h4 className="text-xs font-bold text-text-primary tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-divider">
                      <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                        <Star className="size-3 text-warning fill-warning" />
                        {item.rating} <span className="text-[9px]">({item.reviewsCount})</span>
                      </span>

                      <span className="text-xs font-bold text-primary flex items-center">
                        <IndianRupee className="size-3" />
                        {item.dailyPrice}
                        <span className="text-[9px] text-text-muted font-normal ml-0.5">/day</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>

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