import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Users,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Package,
  Camera,
  ExternalLink,
  Eye,
  DollarSign,
  Filter,
  ArrowRight,
  Clock,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../../utils/apiClient";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'ledger'
  const [metrics, setMetrics] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // 'all' | 'renter' | 'owner' | 'admin' | 'suspended'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvidenceBooking, setSelectedEvidenceBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, ledgerRes, usersRes] = await Promise.all([
        apiClient(`${import.meta.env.VITE_BACKEND_URL}/admin/overview`),
        apiClient(`${import.meta.env.VITE_BACKEND_URL}/admin/escrow-ledger`),
        apiClient(`${import.meta.env.VITE_BACKEND_URL}/admin/users`),
      ]);

      const [overviewData, ledgerData, usersData] = await Promise.all([
        overviewRes.json(),
        ledgerRes.json(),
        usersRes.json(),
      ]);

      if (overviewData.success) {
        setMetrics(overviewData.data.metrics);
      }
      if (ledgerData.success) {
        setLedger(ledgerData.data.ledger || []);
      }
      if (usersData.success) {
        setUsers(usersData.data.users || []);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Error loading governance portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/${userId}/toggle-block`,
        { method: "PATCH" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          `User ${!currentStatus ? "suspended" : "reactivated"} successfully`
        );
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isBlocked: !currentStatus } : u
          )
        );
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) => ({ ...prev, isBlocked: !currentStatus }));
        }
      } else {
        toast.error(data.message || "Failed to update user status");
      }
    } catch (err) {
      console.error("Toggle block error:", err);
      toast.error("Network error modifying user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await apiClient(
        `${import.meta.env.VITE_BACKEND_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser((prev) => ({ ...prev, role: newRole }));
        }
      } else {
        toast.error(data.message || "Failed to change user role");
      }
    } catch (err) {
      console.error("Role change error:", err);
      toast.error("Network error updating role");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch)) ||
      (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase()));

    if (!matchesSearch) return false;

    if (roleFilter === "all") return true;
    if (roleFilter === "suspended") return u.isBlocked;
    return u.role === roleFilter;
  });

  return (
    <div className="min-h-screen bg-app text-text-primary px-4 sm:px-8 py-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
              <ShieldCheck size={12} />
              Platform Executive Console
            </span>
            <span className="text-xs text-text-muted font-medium">
              • Escrow Treasury & Autonomous Damage Audits
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-text-primary">
            Rentora Governance & Risk Control
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Manage platform users, inspect handover vs return evidence photos, track 10% platform commission, and execute manual risk overrides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-divider hover:border-primary/40 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-primary" : ""} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* 4 Analytics & Treasury Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Platform GMV */}
        <div className="rounded-3xl bg-surface border border-divider p-5 sm:p-6 space-y-3 shadow-sm hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Platform Gross Volume
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              ₹{(metrics?.totalGMV || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-text-secondary">
              Total transaction value across {metrics?.totalBookings || 0} bookings
            </p>
          </div>
        </div>

        {/* Card 2: 10% Platform Commission */}
        <div className="rounded-3xl bg-surface border border-divider p-5 sm:p-6 space-y-3 shadow-sm hover:border-success/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              10% Net Commission
            </span>
            <div className="p-2 rounded-xl bg-success/10 text-success border border-success/20">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-success">
              ₹{(metrics?.platformCommission || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-text-secondary">
              Earned revenue retained by Rentora
            </p>
          </div>
        </div>

        {/* Card 3: Active Escrow Holdings */}
        <div className="rounded-3xl bg-surface border border-divider p-5 sm:p-6 space-y-3 shadow-sm hover:border-secondary-accent/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Razorpay Escrow Locked
            </span>
            <div className="p-2 rounded-xl bg-secondary-accent/10 text-secondary-accent border border-secondary-accent/20">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-secondary-accent">
              ₹{(metrics?.activeEscrowHolding || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-text-secondary">
              Active security deposits held safely in escrow
            </p>
          </div>
        </div>

        {/* Card 4: Autonomous Risk Guard */}
        <div className="rounded-3xl bg-surface border border-divider p-5 sm:p-6 space-y-3 shadow-sm hover:border-error/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Risk Guard & Suspensions
            </span>
            <div className="p-2 rounded-xl bg-error/10 text-error border border-error/20">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              {metrics?.blockedUsers || 0}{" "}
              <span className="text-xs font-normal text-text-muted">suspended</span>
            </p>
            <p className="text-[11px] text-text-secondary">
              {metrics?.damageIncidentsCount || 0} damage incidents analyzed by Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex flex-wrap items-center gap-2 border-b border-divider pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-primary text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Users size={14} />
          <span>User Directory & Control ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ledger"
              ? "bg-primary text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <Camera size={14} />
          <span>Escrow & Evidence Photos Ledger ({ledger.length})</span>
        </button>
      </div>

      {/* TAB 1: User Directory & Management */}
      {activeTab === "users" && (
        <div className="rounded-3xl bg-surface border border-divider p-6 space-y-4 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Platform Account Management
              </h3>
              <p className="text-xs text-text-secondary">
                View detailed profiles of Renters and Owners, manage roles, and toggle instant suspension overrides.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-app border border-divider text-xs">
                {["all", "renter", "owner", "admin", "suspended"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      roleFilter === r
                        ? "bg-primary text-text-primary shadow-xs"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  placeholder="Search user, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-3.5 py-1.5 rounded-xl bg-app border border-divider text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Platform Activity</th>
                  <th className="py-3 px-4">Wallet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/50 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-text-muted">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-divider shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-text-primary">{u.name}</span>
                              {u.isVerified && (
                                <CheckCircle2 size={12} className="text-success shrink-0" />
                              )}
                            </div>
                            <span className="text-[10px] text-text-muted font-mono">
                              ID: {u.id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role === "owner"
                              ? "bg-secondary-accent/20 text-secondary-accent border border-secondary-accent/30"
                              : u.role === "admin"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-bright/15 text-bright border border-bright/30"
                          }`}
                        >
                          {u.role === "owner"
                            ? "💼 Owner"
                            : u.role === "admin"
                            ? "🛡️ Admin"
                            : "🛍️ Renter"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-text-primary text-xs font-semibold">{u.email}</p>
                        <p className="text-[10px] text-text-muted">{u.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        <p>{u.city}</p>
                        {u.pincode && (
                          <p className="text-[10px] text-text-muted">{u.pincode}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <span className="block text-text-secondary">
                            Rentals: <strong className="text-text-primary">{u.totalRentals}</strong>
                          </span>
                          <span className="block text-text-secondary">
                            Listings: <strong className="text-text-primary">{u.totalListings}</strong>
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-primary">
                        ₹{u.walletBalance || 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.isBlocked
                              ? "bg-error/15 text-error border border-error/30"
                              : "bg-success/15 text-success border border-success/30"
                          }`}
                        >
                          {u.isBlocked ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-surface border border-divider hover:border-primary/40 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                              u.isBlocked
                                ? "bg-success/20 text-success hover:bg-success/30 border border-success/30"
                                : "bg-error/15 text-error hover:bg-error/25 border border-error/30"
                            }`}
                          >
                            {u.isBlocked ? (
                              <>
                                <Unlock size={11} />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <Lock size={11} />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Escrow Ledger & Evidence Photos */}
      {activeTab === "ledger" && (
        <div className="rounded-3xl bg-surface border border-divider p-6 space-y-4 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Security Deposit Escrow & Damage Ledger
              </h3>
              <p className="text-xs text-text-secondary">
                Track security deposits in escrow, review Gemini AI damage findings, and inspect Delivery vs Return Photos side-by-side.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-app border border-divider text-xs text-text-secondary font-semibold">
                Total Bookings in Escrow: {ledger.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Item & Booking</th>
                  <th className="py-3 px-4">Renter / Owner</th>
                  <th className="py-3 px-4">Escrow Deposit</th>
                  <th className="py-3 px-4">AI Damage Tier</th>
                  <th className="py-3 px-4">Repair Deduction</th>
                  <th className="py-3 px-4">Refunded</th>
                  <th className="py-3 px-4">Settlement</th>
                  <th className="py-3 px-4 text-right">Photo Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/50 font-medium">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-text-muted">
                      No escrow transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  ledger.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.itemImage ? (
                            <img
                              src={item.itemImage}
                              alt={item.itemTitle}
                              className="w-10 h-10 rounded-xl object-cover border border-divider shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-app border border-divider flex items-center justify-center text-text-muted">
                              📦
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-text-primary">{item.itemTitle}</p>
                            <span className="text-[10px] text-text-muted font-mono">
                              #{item.id.slice(-6)} • {item.itemCategory}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-text-primary font-semibold">{item.renterName}</p>
                        <p className="text-[10px] text-text-muted">{item.renterPhone}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Owner: {item.ownerName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-primary text-sm">
                        ₹{item.totalDeposit}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              item.damageTier === "TIER_0"
                                ? "bg-success/15 text-success border border-success/30"
                                : item.damageTier === "TIER_1"
                                ? "bg-warning/15 text-warning border border-warning/30"
                                : "bg-error/15 text-error border border-error/30"
                            }`}
                          >
                            {item.damageTier}
                          </span>
                          <p className="text-[10px] text-text-secondary truncate max-w-[150px]">
                            {item.damageSummary}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-error font-bold">
                        {item.repairDeduction > 0 ? `-₹${item.repairDeduction}` : "₹0"}
                      </td>
                      <td className="py-3.5 px-4 text-success font-bold">
                        ₹{item.refundedToRenter}
                        {item.razorpayRefundId && (
                          <span className="block text-[9px] text-text-muted font-mono truncate max-w-[110px]">
                            {item.razorpayRefundId}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.settlementStatus === "Settled"
                              ? "bg-success/15 text-success border border-success/30"
                              : "bg-primary/15 text-primary border border-primary/30"
                          }`}
                        >
                          {item.settlementStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedEvidenceBooking(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-text-primary transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Camera size={13} />
                          <span>View Photos</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Delivery vs Return Evidence Photos Comparison */}
      {selectedEvidenceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]">
          <div className="bg-surface border border-divider rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden p-6 space-y-6 max-h-[90vh] overflow-y-auto animate-[modalIn_150ms_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/20 text-primary border border-primary/30">
                    Evidence Verification
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    Booking #{selectedEvidenceBooking.id.slice(-6)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mt-1">
                  Delivery vs Return Condition Comparison
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceBooking(null)}
                className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-text-primary cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* AI Summary Banner */}
            <div className="p-4 rounded-2xl bg-app border border-divider space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      selectedEvidenceBooking.damageTier === "TIER_0"
                        ? "bg-success/20 text-success border border-success/30"
                        : selectedEvidenceBooking.damageTier === "TIER_1"
                        ? "bg-warning/20 text-warning border border-warning/30"
                        : "bg-error/20 text-error border border-error/30"
                    }`}
                  >
                    Gemini AI Assessment: {selectedEvidenceBooking.damageTier}
                  </span>
                  <span className="text-xs text-text-muted">
                    Severity: {selectedEvidenceBooking.damageSeverity || "none"}
                  </span>
                </div>
                <div className="text-xs text-text-secondary">
                  Deposit Held: <strong>₹{selectedEvidenceBooking.totalDeposit}</strong>
                </div>
              </div>

              <p className="text-xs text-text-primary font-medium">
                {selectedEvidenceBooking.damageSummary}
              </p>

              {selectedEvidenceBooking.damageFindings &&
                selectedEvidenceBooking.damageFindings.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-divider/50">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      AI Findings:
                    </span>
                    <ul className="list-disc list-inside text-xs text-text-secondary space-y-0.5">
                      {selectedEvidenceBooking.damageFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Settlement summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-divider/50 text-xs">
                <div className="p-2 rounded-xl bg-surface">
                  <span className="text-text-muted block text-[10px]">Owner Repair Payout</span>
                  <strong className="text-error font-bold">
                    ₹{selectedEvidenceBooking.repairDeduction}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-surface">
                  <span className="text-text-muted block text-[10px]">Renter Refund</span>
                  <strong className="text-success font-bold">
                    ₹{selectedEvidenceBooking.refundedToRenter}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-surface">
                  <span className="text-text-muted block text-[10px]">Razorpay Refund ID</span>
                  <span className="font-mono text-text-primary text-[10px] truncate block">
                    {selectedEvidenceBooking.razorpayRefundId || "Pending / Not required"}
                  </span>
                </div>
              </div>
            </div>

            {/* Photos Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Delivery (Handover) Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <span>📦 Delivery (Handover) Photos</span>
                  </h4>
                  <span className="text-[10px] text-text-muted">
                    {selectedEvidenceBooking.handoverPhotos?.length || 0} photos
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Captured at pickup by Renter before taking custody.
                </p>

                {(!selectedEvidenceBooking.handoverPhotos ||
                  selectedEvidenceBooking.handoverPhotos.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-app border border-dashed border-divider text-center text-text-muted text-xs">
                    No delivery photos uploaded for this booking.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedEvidenceBooking.handoverPhotos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImageModal(photo.url)}
                        className="group relative rounded-xl overflow-hidden border border-divider aspect-video bg-black/40 cursor-pointer"
                      >
                        <img
                          src={photo.url}
                          alt={`Delivery Photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={18} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Return Photos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    <span>🔄 Return Evidence Photos</span>
                  </h4>
                  <span className="text-[10px] text-text-muted">
                    {selectedEvidenceBooking.returnPhotos?.length || 0} photos
                  </span>
                </div>
                <p className="text-xs text-text-secondary">
                  Captured at drop-off by Owner to evaluate condition.
                </p>

                {(!selectedEvidenceBooking.returnPhotos ||
                  selectedEvidenceBooking.returnPhotos.length === 0) ? (
                  <div className="p-8 rounded-2xl bg-app border border-dashed border-divider text-center text-text-muted text-xs">
                    No return photos uploaded for this booking.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedEvidenceBooking.returnPhotos.map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImageModal(photo.url)}
                        className="group relative rounded-xl overflow-hidden border border-divider aspect-video bg-black/40 cursor-pointer"
                      >
                        <img
                          src={photo.url}
                          alt={`Return Photo ${i + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Eye size={18} className="text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Close footer */}
            <div className="pt-4 border-t border-divider flex items-center justify-end">
              <button
                onClick={() => setSelectedEvidenceBooking(null)}
                className="px-5 py-2.5 rounded-xl bg-surface border border-divider hover:border-primary/40 text-xs font-bold text-text-primary transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL IMAGE PREVIEW MODAL */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImageModal}
              alt="Evidence Full View"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-white/10"
            />
            <p className="text-center text-xs text-text-muted mt-2">
              Click anywhere to close full photo view
            </p>
          </div>
        </div>
      )}

      {/* MODAL 2: User Account Inspector & Role Control */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]">
          <div className="bg-surface border border-divider rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-5 animate-[modalIn_150ms_ease-out]">
            <div className="flex items-center justify-between pb-4 border-b border-divider">
              <h3 className="text-base font-bold text-text-primary">
                User Account Inspector
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-app border border-divider">
              <img
                src={selectedUser.profileImage}
                alt={selectedUser.name}
                className="w-14 h-14 rounded-full object-cover border border-divider"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-text-primary truncate">
                    {selectedUser.name}
                  </h4>
                  {selectedUser.isVerified && (
                    <CheckCircle2 size={13} className="text-success shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-muted truncate">{selectedUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-primary/20 text-primary">
                    {selectedUser.role}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      selectedUser.isBlocked
                        ? "bg-error/20 text-error"
                        : "bg-success/20 text-success"
                    }`}
                  >
                    {selectedUser.isBlocked ? "Suspended" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">User ID</span>
                <span className="font-mono text-text-primary">{selectedUser.id}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">Phone Number</span>
                <span className="font-semibold text-text-primary">{selectedUser.phone}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">Location</span>
                <span className="font-semibold text-text-primary">
                  {selectedUser.city} {selectedUser.pincode ? `(${selectedUser.pincode})` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">Wallet Balance</span>
                <span className="font-bold text-primary">₹{selectedUser.walletBalance || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">Platform Activity</span>
                <span className="text-text-secondary font-semibold">
                  {selectedUser.totalRentals} rentals • {selectedUser.totalListings} listings
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-app">
                <span className="text-text-muted">Joined Platform</span>
                <span className="text-text-secondary">
                  {new Date(selectedUser.joinedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Role Change Control */}
              <div className="p-2.5 rounded-xl bg-app space-y-1.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">
                  Change Account Role:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {["renter", "owner", "admin"].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(selectedUser.id, r)}
                      className={`py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                        selectedUser.role === r
                          ? "bg-primary text-text-primary"
                          : "bg-surface hover:bg-white/10 text-text-secondary"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl border border-divider text-xs font-semibold text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleToggleBlock(selectedUser.id, selectedUser.isBlocked);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedUser.isBlocked
                    ? "bg-success text-white hover:bg-success/90"
                    : "bg-error text-white hover:bg-error/90"
                }`}
              >
                {selectedUser.isBlocked ? "Reactivate Account" : "Emergency Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
