import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import useAuth from "../../hooks/authHook";
import logo from "../../assets/logo.svg";
import toast from "react-hot-toast";

import NotificationBell from "../common/NotificationBell";

const OwnerNavbar = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetching user details and logout method from useAuth()
    const { user, logout } = useAuth();
    const name = user?.name;
    const avatarUrl = user?.profileImage;

    const handleSignOut = async () => {
        try {
            await logout();
            toast.success("Signed out successfully 👋");
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Clear all tokens/storage
            localStorage.clear();
            sessionStorage.clear();
            setIsDropdownOpen(false);
        }
    };

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
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium",
            isActive
                ? "bg-primary text-text-primary font-semibold shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5",
        ].join(" ");

    return (
        <header className="sticky top-0 w-full z-50 border-b border-divider bg-app/95 shadow-md">
            <div className="max-w-[1450px] mx-auto px-6 h-[72px] flex items-center justify-between">

                {/* Left: Brand + Nav */}
                <div className="flex items-center gap-10">
                    <Link to="/owner" className="flex items-center gap-2.5 group">
                        <img src={logo} alt="logo" width="34px" height="34px" className="rounded-xl transition-transform group-hover:scale-105 shadow-sm" />
                        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                            Rent<span className="text-primary">ora</span>
                        </h2>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
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

                        <NavLink to="/features" className={navItemClass}>
                            Features
                        </NavLink>
                    </nav>
                </div>

                {/* Right: User Section */}
                <div className="flex items-center gap-4 relative" ref={dropdownRef}>
                    <NotificationBell />

                    {/* Profile Button */}
                    <button
                        className="flex items-center gap-3 text-left hover:bg-white/5 p-1.5 px-2.5 rounded-xl transition-all border border-transparent hover:border-divider cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm text-text-primary font-semibold">
                                {name || "Owner"}
                            </span>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-card border border-divider overflow-hidden flex items-center justify-center">
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
                        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-divider rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden animate-[modalIn_150ms_ease-out]">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
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
