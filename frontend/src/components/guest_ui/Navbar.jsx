import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthController from "../auth/AuthController";
import logo from "../../assets/logo.svg";

const Navbar = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

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
            <NavLink to="/explore" className={navItemClass}>
              Explore
            </NavLink>
            <NavLink to="/features" className={navItemClass}>
              Features
            </NavLink>
            <a
              href="#how-it-works"
              className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname === "/") {
                  const el = document.getElementById("how-it-works");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  }
                } else {
                  window.location.href = "/#how-it-works";
                }
              }}
            >
              How it Works
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
};
export default Navbar;
