import { Outlet } from "react-router-dom";
import RenterNavbar from "../components/renter_ui/RenterNavbar";
import Footer from "../components/guest_ui/Footer";

const RenterLayout = () => {
  return (
    <div className="renter-theme min-h-screen bg-app flex flex-col">
      <RenterNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default RenterLayout;
