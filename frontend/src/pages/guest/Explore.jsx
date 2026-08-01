import { useEffect, useState, useCallback } from "react";
import LoginBanner from "../../components/guest_ui/explore/LoginBanner";
import ExploreSearchBar from "../../components/renter_ui/explore/ExploreSearchBar";
import ExploreLocationBar from "../../components/renter_ui/explore/ExploreLocationBar";
import ExploreGrid from "../../components/renter_ui/explore/ExploreGrid";
import ExploreEmptyState from "../../components/renter_ui/explore/ExploreEmptyState";
import ExplorePagination from "../../components/renter_ui/explore/ExplorePagination";

const Explore = () => {
  const [rentals, setRentals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [locationState, setLocationState] = useState(null);
  const [radius, setRadius] = useState(50);

  const ITEMS_PER_PAGE = 16;

  const fetchRentals = useCallback(async (p = 1, searchQuery = search, loc = locationState, rad = radius) => {
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
  }, [search, locationState, radius]);

  useEffect(() => {
    fetchRentals(page, search, locationState, radius);
  }, [page, locationState, radius, fetchRentals]);

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
      <LoginBanner />
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
  );
};

export default Explore;
