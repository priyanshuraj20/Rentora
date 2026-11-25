import { Outlet } from "react-router-dom";
import RenterNavbar from "../components/renter_ui/RenterNavbar";
import Footer from "../components/guest_ui/Footer";

const RenterLayout = () => {
  return (
    <>
      <RenterNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default RenterLayout;
