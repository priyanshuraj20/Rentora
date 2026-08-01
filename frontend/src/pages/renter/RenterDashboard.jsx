import { useState, useEffect } from "react";
import DashboardHeader from "../../components/renter_ui/renter_dashboard/DashboardHeader";
import StatsCard from "../../components/renter_ui/renter_dashboard/StatsCard";
import BookingCard from "../../components/renter_ui/renter_dashboard/BookingCard";
import QuickActions from "../../components/renter_ui/renter_dashboard/QuickActions";
import { Link, useNavigate } from "react-router-dom";
import homeRedirect from "../../hooks/homeRedirect";
import useAuth from "../../hooks/authHook";

import VerificationBadges from "../../components/common/VerificationBadges";

export default function RenterDashboard() {
  homeRedirect();
  const navigate = useNavigate();
  const [activeRentals, setActiveRentals] = useState(0);
  const [upcomingRentals, setUpcomingRentals] = useState(0);
  const [wishlist, setWishlist] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [verifications, setVerifications] = useState(null);
  const [trustScore, setTrustScore] = useState(50);

  const fetchVerifications = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/me/verifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data.verifications);
        setTrustScore(data.data.trustScore);
      }
    } catch (err) {
      console.log(err);
    }
  };

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
      setUpcomingRentals(data.data.upcomingRentals);
      setWishlist(data.data.wishlist);
      setBookings(data.data.bookings || []);

    } catch (error) {
      console.log(error);
    }
  };

  const { user } = useAuth();
  const name = user?.name;

  useEffect(() => {
    fetchStats();
    fetchVerifications();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Active Rentals",
      value: activeRentals,
      icon: "shopping_bag",
    },
    {
      id: 2,
      title: "Upcoming",
      value: upcomingRentals,
      icon: "event_upcoming",
    },
    {
      id: 3,
      title: "Wishlist",
      value: wishlist,
      icon: "bookmark",
    },
  ];

  const quickActions = [
    { id: 1, icon: "search_insights", label: "Discover New Gear", to: "/renter_explore" },
    { id: 2, icon: "receipt_long", label: "Manage Payments", to: "/rentals" },
    { id: 3, icon: "forum", label: "Contact Support", to: "/messages" },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-app min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        <DashboardHeader userName={name} />

        {/* Verification Badges */}
        <div className="mb-8">
          <VerificationBadges badges={verifications?.badges} onRefresh={fetchVerifications} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Bookings */}
          <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
            {bookings?.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-text-primary">Current Bookings</h3>
                  <Link to="/rentals" className="cursor-pointer text-primary text-xs font-semibold hover:underline">
                    View All History
                  </Link>
                </div>

                <div className="flex flex-col gap-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
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
                  Start your rental journey by exploring available items in your neighborhood.
                </p>
                
                <button
                  onClick={() => navigate('/renter_explore')}
                  className="flex items-center justify-center gap-2 bg-primary text-text-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Rent New Item
                </button>
              </div>
            )}
          </div>
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <QuickActions actions={quickActions} />
          </div>
        </div>
      </div>
    </main>
  );
}
