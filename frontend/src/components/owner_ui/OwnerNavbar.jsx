import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import useAuth from "../../hooks/authHook";
import logo from "../../assets/logo.png";
import toast from "react-hot-toast";


import NotificationBell from "../common/NotificationBell";

const OwnerNavbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSignOut = async () => {
        try {
            // Call backend logout
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Clear all tokens/storage
            localStorage.clear();
            sessionStorage.clear();
            // Redirect to home
            toast.success("Signed out successfully 👋");
            navigate("/");
            setIsDropdownOpen(false);
        }
    };

    // Fetching user names and profileImage from useAuth()
    const { user } = useAuth();
    const name = user?.name;
    const avatarUrl = user?.profileImage;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const navItemClass = ({ isActive }) =>
        [
            "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200",
            "text-sm font-medium",
            isActive
                ? "bg-bright text-app"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5",
        ].join(" ");

    return (
        <header className="sticky top-0 w-full z-50 border-b border-divider bg-app">
            <div className="max-w-[1450px] mx-auto px-6 h-20 flex items-center justify-between">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-10">
                    <Link to="/owner" className="flex items-center gap-2">
                        <img src={logo} alt="logo" width="35px" />
                        <h2 className="text-2xl font-bold text-text-primary">
                            Rent<span className="text-bright">ora</span>
                        </h2>
                    </Link>


                    <nav className="hidden md:flex items-center gap-4">
                        <NavLink to="/owner" className={navItemClass}>
                            Dashboard
                        </NavLink>

                        <NavLink to="/listings" className={navItemClass}>
                            Listings
                        </NavLink>

                        <NavLink to="/bookings" className={navItemClass}>
                            Bookings
                        </NavLink>

                        <NavLink to="/earnings" className={navItemClass}>
                            Earnings
                        </NavLink>

                        <NavLink to="/messages" className={navItemClass}>
                            Messages
                        </NavLink>
                    </nav>
                </div>

                {/* Right: User Section */}
                <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                    <NotificationBell />

                    {/* Profile Button */}
                    <button
                        className="flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded-2xl transition-all"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex flex-col">
                            <span className="text-md text-text-primary font-medium">
                                {name || "Guest"}
                            </span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-card border border-divider overflow-hidden flex items-center justify-center">
                            {avatarUrl && avatarUrl !== "undefined" ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-text-secondary text-sm">👤</span>
                            )}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-divider rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </header>
    );
};

export default OwnerNavbar;
