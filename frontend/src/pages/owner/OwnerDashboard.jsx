import WelcomeSection from "../../components/owner_ui/dashboard/WelcomeSection";
import StatsCard from "../../components/owner_ui/dashboard/StatsCard";
import RentalsSection from "../../components/owner_ui/dashboard/RentalSection";
import QuickActions from "../../components/owner_ui/dashboard/QuickActions";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import homeRedirect from "../../hooks/homeRedirect";
import useAuth from "../../hooks/authHook";

const OwnerDashboard = () => {
  homeRedirect();

  const [totalListings, setTotalListings] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [rentals, setRentals] = useState([]);

  // Fetching Stats from Backend
  const fetchStats = async () => {
    try {
      const csrf = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
        method: "GET",
        credentials: "include"
      });

      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        credentials: "include"
      });

      const data = await response.json();

      setActiveRentals(data.data.activeRentals);
      setTotalListings(data.data.totalListings);
      setTotalEarnings(data.data.totalEarnings);
      setRentals(data.data.rentals || []);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const { user } = useAuth();

  const stats = [
    {
      id: 1,
      title: "Total Listings",
      value: totalListings,
      icon: ""
    },
    {
      id: 2,
      title: "Active Rentals",
      value: activeRentals,
      icon: ""
    },
    {
      id: 3,
      title: "Total Earnings",
      value: `₹${totalEarnings}`,
      icon: ""
    }
  ];

  const quickActions = [
    { id: 1, icon: "add_circle", label: "Add New Item", to: "listings" },
    { id: 2, icon: "receipt_long", label: "View Bookings", to: "bookings" },
    { id: 3, icon: "inventory_2", label: "Manage Listings", to: "listings" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-app min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        <WelcomeSection user={user} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
            {rentals?.length > 0 ? (
              <RentalsSection rentals={rentals} />
            ) : (
              <div className="flex-1 bg-surface border border-divider rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[320px] shadow-sm">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-primary">
                    inventory_2
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-text-primary mb-1">
                  No Active Rentals Yet
                </h3>
                
                <p className="text-text-secondary text-xs max-w-sm mb-6 leading-relaxed">
                  Your rental dashboard looks a bit empty. List your items and watch the rentals roll in!
                </p>
                
                <Link
                  to="/listings"
                  className="flex items-center justify-center gap-2 bg-primary text-text-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  List New Item
                </Link>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <QuickActions actions={quickActions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;
