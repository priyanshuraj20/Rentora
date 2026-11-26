import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Coins, Search } from "lucide-react";
import LoginBanner from "../../components/guest_ui/explore/LoginBanner";
import ExploreSearchBar from "../../components/renter_ui/explore/ExploreSearchBar";
import ExploreLocationBar from "../../components/renter_ui/explore/ExploreLocationBar";
import ExploreGrid from "../../components/renter_ui/explore/ExploreGrid";
import ExploreEmptyState from "../../components/renter_ui/explore/ExploreEmptyState";
import ExplorePagination from "../../components/renter_ui/explore/ExplorePagination";
import OwnerExploreView from "../../components/guest_ui/explore/OwnerExploreView";
import useAuth from "../../hooks/authHook";

const Explore = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode state: synchronized with URL param ?tab=owner|renter and localStorage
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() => {
    if (urlTab === "owner" || urlTab === "renter") return urlTab;
    return localStorage.getItem("rentora_home_mode") || "owner";
  });

  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locationState, setLocationState] = useState(null);
  const [radius, setRadius] = useState(50);

  const ITEMS_PER_PAGE = 16;

  // Keep tab synchronized when URL param changes
  useEffect(() => {
    if (urlTab && (urlTab === "owner" || urlTab === "renter")) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Listen to external mode change events (e.g. from Hero or Voice tour)
  useEffect(() => {
    const handleMode = (e) => {
      const mode = e.detail?.mode;
      if (mode && (mode === "owner" || mode === "renter")) {
        setActiveTab(mode);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("tab", mode);
        setSearchParams(newParams, { replace: true });
      }
    };
    window.addEventListener("rentora:mode-change", handleMode);
    return () => window.removeEventListener("rentora:mode-change", handleMode);
  }, [searchParams, setSearchParams]);

  const handleModeSwitch = (mode) => {
    setActiveTab(mode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", mode);
    setSearchParams(newParams);
    localStorage.setItem("rentora_home_mode", mode);
    window.dispatchEvent(new CustomEvent("rentora:mode-change", { detail: { mode } }));
  };

  const fetchRentals = useCallback(
    async (p = 1, searchQuery = search, loc = locationState, rad = radius) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append("page", p);
        queryParams.append("limit", ITEMS_PER_PAGE);

        if (loc) {
          if (loc.type === "gps" && loc.lat && loc.lng) {
            queryParams.append("lat", loc.lat);
            queryParams.append("lng", loc.lng);
            queryParams.append("radius", rad);
          } else if (loc.city) {
            queryParams.append("city", loc.city);
          }
        }

        let queryUrl = "";
        if (searchQuery && searchQuery.trim().length > 0) {
          queryParams.append("q", searchQuery.trim());
          queryUrl = `${import.meta.env.VITE_BACKEND_URL}/explore/search?${queryParams.toString()}`;
        } else {
          queryUrl = `${import.meta.env.VITE_BACKEND_URL}/explore?${queryParams.toString()}`;
        }

        const res = await fetch(queryUrl);
        const data = await res.json();

        if (data.status === "success" || data.success) {
          const itemsList = data.items || data.data || [];
          setRentals(itemsList);
          const totalCount = data.total ?? itemsList.length;
          const computedTotalPages = data.totalPages || Math.ceil(totalCount / ITEMS_PER_PAGE);
          setTotalPages(computedTotalPages || 1);
          setPage(p || 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (error) {
        console.error("Error fetching rentals:", error);
      } finally {
        setLoading(false);
      }
    },
    [search, locationState, radius]
  );

  // Fetch rentals only when in renter mode
  useEffect(() => {
    if (activeTab === "renter") {
      fetchRentals(page, search, locationState, radius);
    }
  }, [activeTab, page, locationState, radius, fetchRentals]);

  const handleSearchSubmit = (text) => {
    setPage(1);
    fetchRentals(1, text, locationState, radius);
  };

  const handleSearchChange = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setPage(1);
      fetchRentals(1, "", locationState, radius);
    }
  };

  const handleLocationChange = (newLoc) => {
    setLocationState(newLoc);
    setPage(1);
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-20 py-8 min-h-screen">
      {/* ================= ROLE SEGMENTED SWITCHER ================= */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-surface border border-divider shadow-md">
          <button
            onClick={() => handleModeSwitch("owner")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "owner"
                ? "bg-primary text-text-primary shadow-md shadow-primary/20"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <Coins size={16} />
            <span>List Gear & Earn</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                activeTab === "owner" ? "bg-black/25 text-white" : "bg-app text-primary"
              }`}
            >
              Owner Mode
            </span>
          </button>

          <button
            onClick={() => handleModeSwitch("renter")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === "renter"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5"
            }`}
          >
            <Search size={16} />
            <span>Browse & Rent Gear</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase ${
                activeTab === "renter" ? "bg-black/25 text-white" : "bg-app text-emerald-400"
              }`}
            >
              Renter Mode
            </span>
          </button>
        </div>
      </div>

      {/* ================= TAB CONTENT ================= */}
      {activeTab === "owner" ? (
        <OwnerExploreView />
      ) : (
        <div className="space-y-8 renter-theme">
          {!user && <LoginBanner />}
          <ExploreSearchBar
            value={search}
            onChange={handleSearchChange}
            onSubmit={handleSearchSubmit}
          />

          <ExploreLocationBar
            onLocationChange={handleLocationChange}
            selectedRadius={radius}
            onRadiusChange={handleRadiusChange}
          />

          {rentals.length === 0 && !loading ? (
            <ExploreEmptyState />
          ) : (
            <div className="flex flex-col gap-10">
              <ExploreGrid rentals={rentals} loading={loading} linkPrefix="/item" />

              <ExplorePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;
