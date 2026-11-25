import { useState, useEffect } from "react";
import { MapPin, Navigation, ChevronDown, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const POPULAR_CITIES = [
  "All Cities",
  "Ahmedabad",
  "Vadodara",
  "Bengaluru",
  "Mumbai",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
  "Patna",
  "Ranchi",
  "Lucknow",
  "Chandigarh"
];

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];

export default function ExploreLocationBar({ userCity, onLocationChange, selectedRadius = 50, onRadiusChange }) {
  const [locationState, setLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem("rentora_user_location");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    if (userCity && userCity.trim()) {
      return {
        type: "profile",
        city: userCity.trim(),
        lat: null,
        lng: null,
        label: `📍 ${userCity.trim()}`
      };
    }
    return {
      type: "none",
      city: "",
      lat: null,
      lng: null,
      label: "All Locations"
    };
  });

  const [customCityInput, setCustomCityInput] = useState("");
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange(locationState);
    }
  }, [locationState]);

  // If user profile city arrives later and user hasn't selected a location yet
  useEffect(() => {
    if (userCity && userCity.trim() && locationState.type === "none" && !locationState.city) {
      const saved = localStorage.getItem("rentora_user_location");
      if (!saved) {
        const profileLoc = {
          type: "profile",
          city: userCity.trim(),
          lat: null,
          lng: null,
          label: `📍 ${userCity.trim()}`
        };
        setLocationState(profileLoc);
      }
    }
  }, [userCity]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        let resolvedLabel = "Current Location (GPS)";
        let resolvedCity = "";

        // Automatic Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`
          );
          const data = await res.json();
          if (data && data.address) {
            const area =
              data.address.suburb ||
              data.address.neighbourhood ||
              data.address.residential ||
              data.address.subdistrict ||
              "";
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county ||
              "";
            const state = data.address.state || "";

            if (area && city) {
              resolvedLabel = `📍 ${area}, ${city}`;
              resolvedCity = city;
            } else if (city) {
              resolvedLabel = `📍 ${city}`;
              resolvedCity = city;
            } else if (state) {
              resolvedLabel = `📍 Near ${state}`;
              resolvedCity = state;
            }
          }
        } catch (err) {
          console.warn("Reverse geocoding failed, using raw coordinates:", err);
          resolvedLabel = `📍 GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
        }

        const newLoc = {
          type: "gps",
          city: resolvedCity,
          lat: latitude,
          lng: longitude,
          label: resolvedLabel
        };

        setLocationState(newLoc);
        localStorage.setItem("rentora_user_location", JSON.stringify(newLoc));
        setIsLocating(false);
        toast.success(`Location set to ${resolvedLabel} 🛰️`);
      },
      (err) => {
        setIsLocating(false);
        toast.error("Could not access GPS. Please select your city manually.");
        console.warn("GPS Permission error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleClearLocation = () => {
    const newLoc = {
      type: "none",
      city: "",
      lat: null,
      lng: null,
      label: "All Locations"
    };
    setLocationState(newLoc);
    localStorage.removeItem("rentora_user_location");
    setShowCityMenu(false);
    toast.success("Location filter cleared - showing all items 🌍");
  };

  const handleSelectCity = (city) => {
    if (city === "All Cities") {
      handleClearLocation();
      return;
    }

    const newLoc = {
      type: "manual",
      city,
      lat: null,
      lng: null,
      label: `📍 ${city}`
    };
    setLocationState(newLoc);
    localStorage.setItem("rentora_user_location", JSON.stringify(newLoc));
    setShowCityMenu(false);
    toast.success(`Location set to ${city} 📍`);
  };

  const handleCustomCitySubmit = (e) => {
    e.preventDefault();
    if (!customCityInput.trim()) return;
    handleSelectCity(customCityInput.trim());
    setCustomCityInput("");
  };

  return (
    <div className="mb-6 max-w-2xl mx-auto bg-surface border border-divider rounded-2xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Current Location Indicator & City Selector */}
      <div className="relative flex items-center gap-2 flex-1 min-w-[240px]">
        <div className="flex items-center gap-1.5 bg-card px-3 py-2 rounded-xl border border-divider text-primary font-semibold">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="truncate max-w-[170px]">
            {locationState.label || "All Locations"}
          </span>
          {locationState.type !== "none" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearLocation();
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Clear location filter"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCityMenu(!showCityMenu)}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-text-primary px-3 py-2 rounded-xl transition-all cursor-pointer font-medium border border-divider"
        >
          Change City
          <ChevronDown className="size-3.5 text-text-muted" />
        </button>

        {/* Dropdown Menu for Manual City Selection */}
        {showCityMenu && (
          <div className="absolute top-12 left-0 z-50 w-72 bg-surface border border-divider rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between font-bold text-text-primary text-sm border-b border-divider pb-2">
              <span>Select City</span>
              <button
                onClick={() => setShowCityMenu(false)}
                className="text-text-muted hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomCitySubmit} className="flex gap-2">
              <input
                type="text"
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                placeholder="Enter city (e.g. Vadodara)..."
                className="w-full bg-app border border-divider rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="bg-primary text-text-primary font-semibold px-3 py-1.5 rounded-xl shrink-0 cursor-pointer hover:brightness-110"
              >
                Set
              </button>
            </form>

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] uppercase font-semibold text-text-muted tracking-wider">
                  Select Location
                </p>
                {locationState.type !== "none" && (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-[10px] text-primary hover:underline cursor-pointer font-medium"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      (c === "All Cities" && locationState.type === "none") ||
                      locationState.city?.toLowerCase() === c.toLowerCase()
                        ? "bg-primary/15 text-primary font-bold"
                        : "hover:bg-app text-text-primary"
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    {((c === "All Cities" && locationState.type === "none") ||
                      locationState.city?.toLowerCase() === c.toLowerCase()) && (
                      <Check className="size-3 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls: GPS & Radius Selector */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isLocating}
          className="flex items-center gap-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 px-3 py-2 rounded-xl transition-all cursor-pointer font-semibold disabled:opacity-50"
          title="Find items near your device's exact location"
        >
          <Navigation className={`size-3.5 ${isLocating ? "animate-spin" : ""}`} />
          {isLocating ? "Locating..." : "Use My Location"}
        </button>

        {/* Radius Selector */}
        <div className="flex items-center gap-1 bg-card px-2.5 py-1.5 rounded-xl border border-divider">
          <span className="text-text-muted text-[11px] font-medium">Radius:</span>
          <select
            value={selectedRadius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="bg-transparent text-text-primary font-semibold outline-none cursor-pointer text-xs"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r} className="bg-surface text-text-primary">
                {r} km
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
