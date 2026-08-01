import { useState, useEffect } from "react";
import { MapPin, Navigation, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";

const POPULAR_CITIES = [
  "Patna",
  "Ranchi",
  "Ahmedabad",
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Hyderabad",
  "Chennai",
  "Pune"
];

const RADIUS_OPTIONS = [5, 10, 20, 50, 100];

export default function ExploreLocationBar({ onLocationChange, selectedRadius = 50, onRadiusChange }) {
  const [locationState, setLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem("rentora_user_location");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      type: "none",
      city: "",
      lat: null,
      lng: null,
      label: "Select Location"
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
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.suburb ||
              data.address.county ||
              "";
            const state = data.address.state || "";
            if (city && state) {
              resolvedLabel = `📍 ${city}, ${state}`;
            } else if (city) {
              resolvedLabel = `📍 ${city}`;
            }
            resolvedCity = city;
          }
        } catch (err) {
          console.warn("Reverse geocoding failed, falling back to raw GPS label:", err);
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
      { timeout: 10000, maximumAge: 600000 }
    );
  };

  const handleSelectCity = (city) => {
    const newLoc = {
      type: "manual",
      city,
      lat: null,
      lng: null,
      label: city
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
    <div className="mb-6 max-w-3xl mx-auto bg-surface/90 border border-app/80 rounded-2xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Current Location Indicator & City Selector */}
      <div className="relative flex items-center gap-2 flex-1 min-w-[240px]">
        <div className="flex items-center gap-1.5 bg-card px-3 py-2 rounded-xl border border-divider text-bright font-bold">
          <MapPin className="size-4 shrink-0 text-bright" />
          <span className="truncate max-w-[180px]">
            {locationState.label || "Select Location"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowCityMenu(!showCityMenu)}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-text-primary px-3 py-2 rounded-xl transition-all cursor-pointer font-semibold border border-divider"
        >
          Change City
          <ChevronDown className="size-3.5" />
        </button>

        {/* Dropdown Menu for Manual City Selection */}
        {showCityMenu && (
          <div className="absolute top-12 left-0 z-50 w-72 bg-surface border border-divider rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between font-bold text-text-primary text-sm border-b border-divider pb-2">
              <span>Select City</span>
              <button
                onClick={() => setShowCityMenu(false)}
                className="text-text-secondary hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomCitySubmit} className="flex gap-2">
              <input
                type="text"
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                placeholder="Enter city (e.g. Patna)..."
                className="w-full bg-card border border-divider rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-bright"
              />
              <button
                type="submit"
                className="bg-bright text-app font-bold px-3 py-1.5 rounded-xl shrink-0"
              >
                Set
              </button>
            </form>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider mb-1">
                Popular Cities
              </p>
              <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleSelectCity(c)}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      locationState.city?.toLowerCase() === c.toLowerCase()
                        ? "bg-bright/20 text-bright font-bold"
                        : "hover:bg-card text-text-primary"
                    }`}
                  >
                    <span>{c}</span>
                    {locationState.city?.toLowerCase() === c.toLowerCase() && (
                      <Check className="size-3" />
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
          className="flex items-center gap-1.5 bg-bright/10 hover:bg-bright/20 text-bright border border-bright/30 px-3 py-2 rounded-xl transition-all cursor-pointer font-bold disabled:opacity-50"
        >
          <Navigation className={`size-3.5 ${isLocating ? "animate-spin" : ""}`} />
          {isLocating ? "Locating..." : "Use My Location"}
        </button>

        {/* Radius Selector */}
        <div className="flex items-center gap-1 bg-card px-2.5 py-1.5 rounded-xl border border-divider">
          <span className="text-text-secondary text-[11px] font-medium">Radius:</span>
          <select
            value={selectedRadius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="bg-transparent text-text-primary font-bold outline-none cursor-pointer text-xs"
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
