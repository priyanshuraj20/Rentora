import { useState, useEffect } from "react";
import RentalsHeader from "../../components/renter_ui/rentals/RentalsHeader";
import RentalsTabs from "../../components/renter_ui/rentals/RentalsTabs";
import RentalsGrid from "../../components/renter_ui/rentals/RentalsGrid";
import RentalsEmptyState from "../../components/renter_ui/rentals/RentalsEmptyState";

export default function Rentals() {
  const [activeTab, setActiveTab] = useState("active");
  const [rentals, setRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      try {
        const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
          method: "GET",
          credentials: "include"
        });
        const csrfData = await csrf.json();

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken
          },
          credentials: "include"
        });
        
        const data = await response.json();
        if (data.success) {
          // Map backend response to match UI format if needed
          const mappedRentals = data.bookings.map(b => ({
            id: b.id,
            status: b.status,
            title: b.item?.title || "Unknown Item",
            startDate: new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            endDate: new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            price: b.totalAmount,
            image: b.item?.image || "https://via.placeholder.com/400x300?text=No+Image",
            badge: b.status.charAt(0).toUpperCase() + b.status.slice(1)
          }));
          setRentals(mappedRentals);
        }
      } catch (error) {
        console.error("Failed to fetch rentals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRentals();
  }, []);

  const filteredRentals = rentals.filter((r) => {
    const status = r.status.toLowerCase();
    if (activeTab === "active") {
      return status === "ongoing" || status === "confirmed" || status === "approved" || status === "pending";
    }
    if (activeTab === "upcoming") {
      return status === "approved" || (status === "confirmed" && new Date(r.startDate) > new Date());
    }
    return status === activeTab;
  });

  return (
    <main className="px-8 lg:px-40 py-10 max-w-[1440px] mx-auto w-full min-h-screen">
      <RentalsHeader />

      <RentalsTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        counts={{
          active: rentals.filter(r => ["ongoing", "confirmed", "approved", "pending"].includes(r.status.toLowerCase())).length,
          upcoming: rentals.filter(r => ["approved", "confirmed"].includes(r.status.toLowerCase())).length,
        }}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
        </div>
      ) : filteredRentals.length > 0 ? (
        <RentalsGrid rentals={filteredRentals} />
      ) : (
        <RentalsEmptyState />
      )}
    </main>
  );
}
