import { Outlet } from "react-router-dom";
import RenterNavbar from "../components/renter_ui/RenterNavbar";
import Footer from "../components/guest_ui/Footer";

const RenterLayout = () => {
  return (
    <>
      <RenterNavbar
        user={{
          name: "John Doe",
          avatarUrl: "https://images.unsplash.com/photo-1716231265603-7e2cecd81dcd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }}
      />
      <Outlet />
      <Footer />
    </>
  );
};

export default RenterLayout;
