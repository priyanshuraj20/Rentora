import { Outlet } from "react-router-dom";
import Navbar from "../components/guest_ui/Navbar";
import OwnerNavbar from "../components/owner_ui/OwnerNavbar";
import RenterNavbar from "../components/renter_ui/RenterNavbar";
import Footer from "../components/guest_ui/Footer";
import useAuth from "../hooks/authHook";

const GuestLayout = () => {
  const { user } = useAuth();
  const role = user?.role || user?.roles;

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
    </>
  );
};

export default GuestLayout;
