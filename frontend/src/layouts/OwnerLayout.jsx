import { Outlet } from "react-router-dom";
import OwnerNavbar from "../components/owner_ui/OwnerNavbar";
import Footer from "../components/guest_ui/Footer";

const OwnerLayout = () => {
  return (
    <>
      <OwnerNavbar user={{
          name: "Anderson",
          avatarUrl: "https://images.unsplash.com/photo-1632287019821-0d4136c06d04?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        }}/>
      <Outlet />
      <Footer />
    </>
  );
};

export default OwnerLayout;
