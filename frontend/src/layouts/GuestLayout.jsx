import { Outlet } from "react-router-dom";
import Navbar from "../components/guest_ui/Navbar";
import Footer from "../components/guest_ui/Footer";

const GuestLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default GuestLayout;
