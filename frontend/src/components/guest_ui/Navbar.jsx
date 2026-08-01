import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthController from "../auth/AuthController";
import logo from "../../assets/logo.png";

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
      "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200",
      "text-sm font-medium",
      isActive
        ? "bg-bright text-white"
        : "text-text-secondary hover:text-text-primary hover:bg-white/5",
    ].join(" ");


  return (


    <header className="sticky top-0 w-full z-50 border-b border-divider  bg-app">
      <div className="max-w-[1450px] mx-auto px-6 h-20 flex items-center justify-between">

        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="logo" width="35px" />
            <h2 className="text-2xl font-bold text-text-primary">
              RentIt<span className="text-bright">Right</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/explore"
              className={navItemClass}

            >
              Explore
            </NavLink>
            <a className="text-sm text-text-secondary hover:text-text-primary"
              onClick={() => {
                const el = document.getElementById("steps");
                el?.scrollIntoView({ behavior: "smooth" });
              }}>
              How it Works
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-sm cursor-pointer text-text-secondary hover:text-text-primary"
            onClick={() => {
              setAuthMode("login");
              setAuthOpen(true);
            }}>
            Login
          </button>
          <button className="bg-accent cursor-pointer text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-accent-hover" onClick={() => {
            setAuthMode("register");
            setAuthOpen(true);
          }}
          >
            Register
          </button>

          <AuthController
            open={authOpen}
            onClose={handleAuthClose}
            defaultMode={authMode}
          />
        </div>

      </div>
    </header>
  );
}
export default Navbar;
