import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, LogOut, UserCheck } from "lucide-react";
import useAuth from "../../hooks/authHook";
import logo from "../../assets/logo.svg";
import toast from "react-hot-toast";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Admin session terminated successfully 👋");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 w-full z-50 border-b border-divider bg-app/95 backdrop-blur-md shadow-md">
      <div className="max-w-[1450px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Left: Brand + Governance Identity */}
        <div className="flex items-center gap-4">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <img
              src={logo}
              alt="Rentora"
              width="34px"
              height="34px"
              className="rounded-xl transition-transform group-hover:scale-105 shadow-sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-text-primary tracking-tight">
                  Rent<span className="text-primary">ora</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Admin Governance
                </span>
              </div>
              <span className="text-[10px] text-text-muted font-medium">
                Executive Control, Escrow Treasury & Risk Management
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Admin Account & Actions */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* Admin Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-divider text-xs">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-text-secondary font-medium">System Online</span>
          </div>

          {/* Profile Dropdown */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 text-left hover:bg-white/5 p-1.5 px-2.5 rounded-xl transition-all border border-transparent hover:border-divider cursor-pointer"
          >
            <div className="flex flex-col text-right">
              <span className="text-sm text-text-primary font-bold">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[10px] text-primary font-semibold">
                Super Admin
              </span>
            </div>

            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 overflow-hidden flex items-center justify-center text-primary font-bold text-sm shadow-sm">
              🛡️
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-divider rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden animate-[modalIn_150ms_ease-out]">
              <div className="px-4 py-2.5 border-b border-divider">
                <p className="text-xs font-bold text-text-primary truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-text-muted truncate">
                  {user?.email || "admin@rentora.com"}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30">
                  Role: Platform Administrator
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-error hover:bg-error/10 transition-colors cursor-pointer font-semibold"
              >
                <LogOut size={14} />
                <span>Terminate Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
