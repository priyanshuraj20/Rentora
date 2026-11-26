import { Link, NavLink, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ShieldCheck, Mic } from "lucide-react";
import toast from "react-hot-toast";
import AuthController from "../auth/AuthController";
import VoiceWelcomeWidget from "../common/VoiceWelcomeWidget";
import VoiceBookingAgentModal from "../common/VoiceBookingAgentModal";
import useAuth from "../../hooks/authHook";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchParams, setSearchParams] = useSearchParams();
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const [homeMode, setHomeMode] = useState(() => {
    return localStorage.getItem("rentora_home_mode") || "owner";
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Keep homeMode synchronized with Hero tab and tour switches
  useEffect(() => {
    const handleMode = (e) => {
      const mode = e.detail?.mode;
      if (mode && (mode === "owner" || mode === "renter")) {
        setHomeMode(mode);
      }
    };
    window.addEventListener("rentora:mode-change", handleMode);
    return () => window.removeEventListener("rentora:mode-change", handleMode);
  }, []);

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const mode = searchParams.get("mode");

    if (authStatus === "success" && mode) {
      setAuthMode(mode);
      setAuthOpen(true);
    }
  }, [searchParams]);

  const handleAuthClose = () => {
    setAuthOpen(false);
    if (searchParams.has("auth") || searchParams.has("mode")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("auth");
      newParams.delete("mode");
      setSearchParams(newParams, { replace: true });
    }
  };

  const navItemClass = (isActive, mode = homeMode) =>
    [
      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium",
      isActive
        ? mode === "renter"
          ? "bg-emerald-600 text-white font-semibold shadow-sm"
          : "bg-primary text-text-primary font-semibold shadow-sm"
        : "text-text-secondary hover:text-text-primary hover:bg-white/5",
    ].join(" ");

  return (
    <header className="sticky top-0 w-full z-50 border-b border-divider bg-app/95 shadow-md">
      <div className="max-w-[1450px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="logo" width="34px" height="34px" className="rounded-xl transition-transform group-hover:scale-105 shadow-sm" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Rentora
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={({ isActive }) => navItemClass(isActive, homeMode)}>
              Home
            </NavLink>

            {homeMode === "owner" ? (
              <NavLink
                to="/explore?tab=owner"
                className={({ isActive }) =>
                  navItemClass(
                    isActive || (location.pathname === "/explore" && searchParams.get("tab") !== "renter"),
                    "owner"
                  )
                }
              >
                <span>List & Earn</span>
                <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-0.5">
                  Owner
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/explore?tab=renter"
                className={({ isActive }) =>
                  navItemClass(
                    isActive || (location.pathname === "/explore" && searchParams.get("tab") === "renter"),
                    "renter"
                  )
                }
              >
                <span>Explore Gear</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-0.5">
                  Renter
                </span>
              </NavLink>
            )}

            <NavLink to="/features" className={({ isActive }) => navItemClass(isActive, homeMode)}>
              <span>Features</span>
              <span className="text-[10px] bg-gradient-to-r from-primary to-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm ml-0.5">
                All-in-One
              </span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Autonomous Voice-to-Booking Agent: Renter-specific feature, shown ONLY when in Renter mode */}
          {homeMode === "renter" && (
            <button
              onClick={() => {
                if (!user) {
                  toast("Please sign in as a Renter to use Voice Booking", { icon: "🎙" });
                  setAuthMode("login");
                  setAuthOpen(true);
                } else if (user.role === "owner" || user.roles === "owner") {
                  toast.error("Voice Booking is built for Renters. Please switch to a Renter account.");
                } else {
                  setVoiceAgentOpen(true);
                }
              }}
              title="Autonomous Voice Booking (Renter Feature)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Mic size={13} className="animate-pulse text-emerald-400" />
              <span className="hidden sm:inline">Voice Agent</span>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-bold hidden md:inline">
                Renter AI
              </span>
            </button>
          )}

          {/* Multilingual Voice Tour (Sarvam AI) - Follows current active home page mode */}
          <VoiceWelcomeWidget />

          <button
            className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2 rounded-xl transition-all cursor-pointer"
            onClick={() => {
              setAuthMode("login");
              setAuthOpen(true);
            }}
          >
            Login
          </button>
          <button
            className={`px-5 py-2 rounded-xl font-semibold transition-all cursor-pointer shadow-sm active:scale-95 text-sm ${
              homeMode === "renter"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-primary hover:bg-primary-hover text-text-primary"
            }`}
            onClick={() => {
              setAuthMode("register");
              setAuthOpen(true);
            }}
          >
            Register
          </button>

          <AuthController open={authOpen} onClose={handleAuthClose} defaultMode={authMode} initialRole={homeMode} />
          <VoiceBookingAgentModal
            open={voiceAgentOpen}
            onClose={() => setVoiceAgentOpen(false)}
            onOpenAuth={(mode) => {
              setAuthMode(mode);
              setAuthOpen(true);
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
