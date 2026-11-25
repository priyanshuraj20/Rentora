import { Outlet } from "react-router-dom";
import OwnerNavbar from "../components/owner_ui/OwnerNavbar";
import Footer from "../components/guest_ui/Footer";

const OwnerLayout = () => {
  return (
    <>
      <OwnerNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default OwnerLayout;
