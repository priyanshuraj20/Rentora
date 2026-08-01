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
    <main className="min-h-screen bg-app px-6 md:px-12 py-10 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Earnings & Analytics</h1>
          <p className="text-text-secondary text-lg mt-1 font-medium">
            Real-time revenue metrics, platform fee deductions, and payout history.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-divider/20 px-4 py-2.5 rounded-xl">
          <ShieldCheck className="text-bright size-5" />
          <span className="text-sm font-bold text-white">Razorpay Direct Bank Transfers</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-divider/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
            <div className="size-10 rounded-xl bg-bright/10 flex items-center justify-center text-bright">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">₹{grossEarnings.toLocaleString()}</p>
          <p className="text-xs text-bright mt-2 flex items-center gap-1 font-bold">
            <TrendingUp size={14} /> From {paidBookings.length} paid rentals
          </p>
        </div>

        <div className="bg-surface border border-divider/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Net Owner Payout (90%)</span>
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400">₹{netPayout.toLocaleString()}</p>
          <p className="text-xs text-emerald-400/80 mt-2 font-medium">Net earnings transferred</p>
        </div>

        <div className="bg-surface border border-divider/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Platform Fee (10%)</span>
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400">₹{platformFee.toLocaleString()}</p>
          <p className="text-xs text-amber-400/80 mt-2 font-medium">Platform commission</p>
        </div>

        <div className="bg-surface border border-divider/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Active Inventory</span>
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{stats.totalListings || 0}</p>
          <p className="text-xs text-text-secondary mt-2 font-medium">Listings generating income</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-surface border border-divider/20 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-divider/20 pb-4">
          <h2 className="text-xl font-bold text-white">Live Transaction & Settlement Log</h2>
          <span className="text-xs font-bold text-bright bg-bright/10 px-3 py-1 rounded-full">
            Database Synchronized
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary font-medium">Fetching database records...</div>
        ) : paidBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-divider/10 text-text-secondary text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">Item Title</th>
                  <th className="pb-3 font-bold">Renter Name</th>
                  <th className="pb-3 font-bold">Rental Dates</th>
                  <th className="pb-3 font-bold">Gross Price</th>
                  <th className="pb-3 font-bold">Net Payout</th>
                  <th className="pb-3 font-bold">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/10">
                {paidBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-app/40 transition-colors">
                    <td className="py-4 font-bold text-white flex items-center gap-3">
                      {b.item?.image && (
                        <img src={b.item.image} alt={b.item.title} className="size-10 rounded-lg object-cover" />
                      )}
                      <span>{b.item?.title || "Rental Item"}</span>
                    </td>
                    <td className="py-4 text-text-primary font-medium">{b.renterInfo?.name || "Renter"}</td>
                    <td className="py-4 text-text-secondary text-xs">
                      {new Date(b.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
                      {new Date(b.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-4 font-bold text-white">₹{b.totalAmount}</td>
                    <td className="py-4 font-bold text-emerald-400">₹{Math.round(b.totalAmount * 0.9)}</td>
                    <td className="py-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> {b.paymentStatus?.toUpperCase() || "PAID"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Clock className="size-12 text-text-secondary mx-auto opacity-50" />
            <p className="text-lg font-bold text-white">No Paid Rentals Found</p>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Once renters complete payments for your item requests, your dynamic earnings log will update here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
