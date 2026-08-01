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
      })

      const csrfData = await csrf.json();

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.csrfToken
        },
        credentials: "include"
      })

      const data = await response.json();
      console.log("data", data.data)

      setActiveRentals(data.data.activeRentals);
      setTotalListings(data.data.totalListings);
      setTotalEarnings(data.data.totalEarnings);
      setRentals(data.data.rentals || []);

    }
    catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    fetchStats();
  }, []);

  // Fetching user names from useAuth()
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
      value: totalEarnings,
      icon: ""
    }
  ];


  /* ===============================
     HANDLERS (Connect Router Later)
  ================================ */

  const quickActions = [
    { id: 1, icon: "add_circle", label: "Add New Item", to: "listings" },
    { id: 2, icon: "receipt_long", label: "View Bookings", to: "bookings" },
    { id: 3, icon: "inventory_2", label: "Manage Listings", to: "listings" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto px-8 py-10">

        <WelcomeSection user={user} />


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

    
        <div className="grid grid-cols-12 gap-8">

          <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
            {rentals?.length > 0 ? (
              <RentalsSection rentals={rentals} />
            ) : (
              <div className="flex-1 bg-surface border border-app/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-full">
                <div className="w-24 h-24 bg-bright/10 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-bright/20 to-transparent blur-xl"></div>
                  <span className="material-symbols-outlined text-6xl text-bright relative">
                    inventory_2
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-text-primary mb-2 tracking-tight">
                  No Active Rentals Yet
                </h3>
                
                <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed font-medium">
                  Your rental dashboard looks a bit empty. List your items and watch the rentals roll in!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link
                    to="/listings"
                    className="flex items-center justify-center gap-2 bg-bright text-surface px-8 py-4 rounded-[1.25rem] font-black hover:scale-[1.01] active:scale-99 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined font-bold">add_circle</span>
                    List New Item
                  </Link>
                </div>
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
