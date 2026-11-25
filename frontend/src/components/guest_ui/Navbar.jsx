import { Link, NavLink, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ShieldCheck, Mic } from "lucide-react";
import AuthController from "../auth/AuthController";
import VoiceWelcomeWidget from "../common/VoiceWelcomeWidget";
import VoiceBookingAgentModal from "../common/VoiceBookingAgentModal";
import logo from "../../assets/logo.svg";
import useAuth from "../../hooks/authHook";
import toast from "react-hot-toast";

const Navbar = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const demoDropdownRef = useRef(null);

  const { demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const mode = searchParams.get("mode");

    if (authStatus === "success" && mode) {
      setAuthMode(mode);
      setAuthOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (demoDropdownRef.current && !demoDropdownRef.current.contains(e.target)) {
        setIsDemoDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAuthClose = () => {
    setAuthOpen(false);
    if (searchParams.has("auth") || searchParams.has("mode")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("auth");
      newParams.delete("mode");
      setSearchParams(newParams, { replace: true });
    }
  };

  const handleDemoPersonaLogin = async (persona) => {
    setDemoLoading(true);
    setIsDemoDropdownOpen(false);
    try {
      const result = await demoLogin(persona);
      if (result.success) {
        toast.success(`Logged in as Demo ${persona.toUpperCase()} 🚀`);
        if (persona === "admin") {
          navigate("/admin");
        } else if (persona === "owner") {
          navigate("/owner");
        } else {
          navigate("/renter");
        }
      } else {
        toast.error(result.message || "Demo login failed");
      }
    } catch (err) {
      console.error("Demo login error:", err);
      toast.error("Could not switch demo persona");
    } finally {
      setDemoLoading(false);
    }
  };

  const navItemClass = ({ isActive }) =>
    [
      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium",
      isActive
        ? "bg-primary text-text-primary font-semibold shadow-sm"
        : "text-text-secondary hover:text-text-primary hover:bg-white/5",
    ].join(" ");

  return (
    <header className="sticky top-0 w-full z-50 border-b border-divider bg-app/95 shadow-md">
      <div className="max-w-[1450px] mx-auto px-6 h-[72px] flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="logo" width="34px" height="34px" className="rounded-xl transition-transform group-hover:scale-105 shadow-sm" />
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Rent<span className="text-primary">ora</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end className={navItemClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navItemClass}>
              Explore
            </NavLink>
            <NavLink to="/features" className={navItemClass}>
              <span>Features</span>
              <span className="text-[10px] bg-gradient-to-r from-primary to-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm ml-0.5">
                All-in-One
              </span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Autonomous Voice-to-Booking Agent */}
          <button
            onClick={() => setVoiceAgentOpen(true)}
            title="Autonomous Voice Booking (Sarvam Indic AI)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Mic size={13} className="animate-pulse" />
            <span className="hidden sm:inline">Voice Agent</span>
            <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded text-primary font-bold hidden md:inline">
              🔒 Renter AI
            </span>
          </button>

          {/* Multilingual Voice Tour (Sarvam AI) */}
          <VoiceWelcomeWidget />

          {/* Single Main-Page Demo Button with 1-Click Dropdown */}
          <div className="relative" ref={demoDropdownRef}>
            <button
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all cursor-pointer shadow-sm active:scale-95"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              disabled={demoLoading}
              title="1-Click Demo Login"
            >
              <span>⚡</span>
              <span>{demoLoading ? "Logging in..." : "1-Click Demo"}</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${isDemoDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDemoDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-divider rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden animate-[modalIn_150ms_ease-out]">
                <div className="px-3.5 py-1.5 border-b border-divider text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  Instant Recruiter Access
                </div>
                <button
                  onClick={() => handleDemoPersonaLogin("renter")}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span className="text-base">🧑‍💼</span>
                  <div>
                    <p className="font-bold">Demo Renter</p>
                    <p className="text-[10px] text-text-muted">Explore & rent gear</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoPersonaLogin("owner")}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span className="text-base">💼</span>
                  <div>
                    <p className="font-bold">Demo Owner</p>
                    <p className="text-[10px] text-text-muted">Listings & earnings</p>
                  </div>
                </button>
                <button
                  onClick={() => handleDemoPersonaLogin("admin")}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-text-primary hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <span className="text-base">🛡️</span>
                  <div>
                    <p className="font-bold text-primary">Demo Admin</p>
                    <p className="text-[10px] text-text-muted">Governance & escrow</p>
                  </div>
                </button>
              </div>
            )}
          </div>

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
            className="bg-primary text-text-primary px-5 py-2 rounded-xl font-semibold hover:bg-primary-hover transition-all cursor-pointer shadow-sm active:scale-95 text-sm"
            onClick={() => {
              setAuthMode("register");
              setAuthOpen(true);
            }}
          >
            Register
          </button>

          <AuthController open={authOpen} onClose={handleAuthClose} defaultMode={authMode} />
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
