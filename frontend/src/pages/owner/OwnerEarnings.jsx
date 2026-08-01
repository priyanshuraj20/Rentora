import { useState, useEffect } from "react";
import { DollarSign, ArrowUpRight, TrendingUp, ShieldCheck, CreditCard, Clock, CheckCircle2 } from "lucide-react";

export default function OwnerEarnings() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalListings: 0,
    activeRentals: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const csrfRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/csrf-token`, {
          method: "GET",
          credentials: "include",
        });
        const csrfData = await csrfRes.json();

        // 1. Fetch Owner Dashboard Stats from backend
        const dashRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          credentials: "include",
        });
        const dashData = await dashRes.json();
        if (dashData.success && dashData.data) {
          setStats(dashData.data);
        }

        // 2. Fetch Owner Bookings from backend
        const bookingRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/booking`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfData.csrfToken,
          },
          credentials: "include",
        });
        const bookingData = await bookingRes.json();
        if (bookingData.success) {
          setBookings(bookingData.bookings || []);
        }
      } catch (err) {
        console.error("Failed to load owner earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // Filter completed/paid bookings from real database records
  const paidBookings = bookings.filter(
    (b) => b.paymentStatus === "paid" || b.status === "completed" || b.status === "confirmed" || b.status === "ongoing"
  );

  const grossEarnings = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const platformFee = Math.round(grossEarnings * 0.1);
  const netPayout = grossEarnings - platformFee;

  return (
    <main className="min-h-screen bg-app px-6 md:px-12 py-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Earnings & Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">
            Real-time revenue metrics, platform fee deductions, and payout history.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-divider px-4 py-2 rounded-xl">
          <ShieldCheck className="text-primary size-4" />
          <span className="text-xs font-semibold text-text-primary">Razorpay Direct Bank Transfers</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-divider rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-text-primary">₹{grossEarnings.toLocaleString()}</p>
          <p className="text-xs text-primary mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp size={13} /> From {paidBookings.length} paid rentals
          </p>
        </div>

        <div className="bg-surface border border-divider rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Net Owner Payout (90%)</span>
            <div className="size-9 rounded-xl bg-success/15 flex items-center justify-center text-success">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-success">₹{netPayout.toLocaleString()}</p>
          <p className="text-xs text-success/80 mt-2 font-medium">Net earnings transferred</p>
        </div>

        <div className="bg-surface border border-divider rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Platform Fee (10%)</span>
            <div className="size-9 rounded-xl bg-warning/15 flex items-center justify-center text-warning">
              <CreditCard size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-warning">₹{platformFee.toLocaleString()}</p>
          <p className="text-xs text-warning/80 mt-2 font-medium">Platform commission</p>
        </div>

        <div className="bg-surface border border-divider rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">Active Inventory</span>
            <div className="size-9 rounded-xl bg-secondary-accent/15 flex items-center justify-center text-secondary-accent">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-text-primary">{stats.totalListings || 0}</p>
          <p className="text-xs text-text-muted mt-2 font-medium">Listings generating income</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-surface border border-divider rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-divider pb-4">
          <h2 className="text-lg font-bold text-text-primary">Live Transaction & Settlement Log</h2>
          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider">
            Database Synchronized
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-muted font-medium text-sm">Fetching database records...</div>
        ) : paidBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-text-muted uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Item Title</th>
                  <th className="pb-3 font-semibold">Renter Name</th>
                  <th className="pb-3 font-semibold">Rental Dates</th>
                  <th className="pb-3 font-semibold">Gross Price</th>
                  <th className="pb-3 font-semibold">Net Payout</th>
                  <th className="pb-3 font-semibold">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {paidBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-bold text-text-primary flex items-center gap-3">
                      {b.item?.image && (
                        <img src={b.item.image} alt={b.item.title} className="size-9 rounded-xl object-cover border border-divider" />
                      )}
                      <span>{b.item?.title || "Rental Item"}</span>
                    </td>
                    <td className="py-3.5 text-text-primary font-medium">{b.renterInfo?.name || "Renter"}</td>
                    <td className="py-3.5 text-text-secondary">
                      {new Date(b.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
                      {new Date(b.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 font-bold text-text-primary">₹{b.totalAmount}</td>
                    <td className="py-3.5 font-bold text-success">₹{Math.round(b.totalAmount * 0.9)}</td>
                    <td className="py-3.5">
                      <span className="bg-success/15 text-success border border-success/30 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 size={11} /> {b.paymentStatus?.toUpperCase() || "PAID"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Clock className="size-10 text-text-muted mx-auto" />
            <p className="text-base font-bold text-text-primary">No Paid Rentals Found</p>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Once renters complete payments for your item requests, your dynamic earnings log will update here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
