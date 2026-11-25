import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";
import useAuth from "./hooks/authHook";

import GuestLayout from "./layouts/GuestLayout";
import RenterLayout from "./layouts/RenterLayout";
import OwnerLayout from "./layouts/OwnerLayout";
import AdminLayout from "./layouts/AdminLayout";

import GuestHome from "./pages/guest/GuestHome";
import Explore from "./pages/guest/Explore";
import ItemDetail from "./pages/guest/ItemDetail";
import Features from "./pages/guest/Features";

import RenterDashboard from "./pages/renter/RenterDashboard";
import RenterExplore from "./pages/renter/RenterExplore";
import RenterItemDetails from "./pages/renter/RenterItemDetails";
import RenterWishlist from "./pages/renter/RenterWishlist";
import Rentals from "./pages/renter/Rentals";
import RentalDetails from "./pages/renter/RentalDetails";
import RentCheckout from "./pages/renter/RentCheckout";

import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerListings from "./pages/owner/OwnerListings";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerEarnings from "./pages/owner/OwnerEarnings";
import AdminDashboard from "./pages/admin/AdminDashboard";

import Messages from "./pages/common/Messages";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./pages/auth/roleBasedRedirection";
import { NotFound } from "./pages/NotFound";

function MessagesLayout() {
  const { user } = useAuth();
  const isOwner = user?.role === "owner" || user?.roles === "owner";
  return isOwner ? <OwnerLayout /> : <RenterLayout />;
}

export default function App() {
  // Proactively pre-warm sleeping free-tier cloud backends (e.g., Render cold-start) on initial page visit
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (backendUrl) {
      fetch(`${backendUrl}/health`).catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Guest pages */}
          <Route element={<GuestLayout />}>
            <Route path="/" element={<GuestHome />} />
            <Route path="/role-redirect" element={<RoleRedirect />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/features" element={<Features />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/checkout/:id" element={<RentCheckout />} />
          </Route>

          {/* Renter pages (Protected - strictly for Renters) */}
          <Route element={<ProtectedRoute allowedRoles={["renter"]} />}>
            <Route element={<RenterLayout />}>
              <Route path="/renter" element={<RenterExplore />} />
              <Route path="/renter_explore" element={<RenterExplore />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/rentals/:rentalId" element={<RentalDetails />} />
              <Route path="/renter/dashboard" element={<RenterDashboard />} />
              <Route path="/renter/rent_items/:id" element={<RenterItemDetails />} />
              <Route path="/wishlist" element={<RenterWishlist />} />
              <Route path="/renter/rent/:id" element={<RentCheckout />} />
              <Route path="/checkout/:id" element={<RentCheckout />} />
            </Route>
          </Route>

          {/* Owner pages (Protected - strictly for Owners) */}
          <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
            <Route element={<OwnerLayout />}>
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/listings" element={<OwnerListings />} />
              <Route path="/bookings" element={<OwnerBookings />} />
              <Route path="/earnings" element={<OwnerEarnings />} />
            </Route>
          </Route>

          {/* Shared Messages Page (Renter & Owner) */}
          <Route element={<ProtectedRoute allowedRoles={["renter", "owner"]} />}>
            <Route element={<MessagesLayout />}>
              <Route path="/messages" element={<Messages />} />
            </Route>
          </Route>

          {/* Admin Governance Portal (Dedicated Layout & Strict Admin RBAC) */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  </AuthProvider>
);
}
