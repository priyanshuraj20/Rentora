import { Outlet, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/guest_ui/Navbar";
import OwnerNavbar from "../components/owner_ui/OwnerNavbar";
import RenterNavbar from "../components/renter_ui/RenterNavbar";
import Footer from "../components/guest_ui/Footer";
import AuthController from "../components/auth/AuthController";
import useAuth from "../hooks/authHook";

const GuestLayout = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const role = user?.role || user?.roles;

  useEffect(() => {
    const authStatus = searchParams.get("auth");
    const mode = searchParams.get("mode");

    if (authStatus === "success" && mode) {
      setAuthMode(mode);
      setAuthOpen(true);
    }
  }, [searchParams]);

  const handleAuthClose = () => {
    setAuthOpen(false);
    if (searchParams.has("auth") || searchParams.has("mode")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("auth");
      newParams.delete("mode");
      setSearchParams(newParams, { replace: true });
    }
  };

  const renderNavbar = () => {
    if (role === "owner") return <OwnerNavbar />;
    if (role === "renter" || role === "admin") return <RenterNavbar />;
    return <Navbar />;
  };

  return (
    <>
      {renderNavbar()}
      <Outlet />
      <Footer />
      {/* If role is authenticated (e.g. renter/owner from OAuth), AuthController must still render when mode is active */}
      {role && authOpen && (
        <AuthController
          open={authOpen}
          onClose={handleAuthClose}
          defaultMode={authMode}
        />
      )}
    </>
  );
};

export default GuestLayout;
