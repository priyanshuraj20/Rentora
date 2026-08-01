import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../../components/guest_ui/guest_dashboard/Hero";
import Steps from "../../components/guest_ui/guest_dashboard/Steps";
import Categories from "../../components/guest_ui/guest_dashboard/Categories";
import Trust from "../../components/guest_ui/guest_dashboard/Trust";
import CTA from "../../components/guest_ui/guest_dashboard/CTA";
import homeRedirect from "../../hooks/homeRedirect";

const GuestHome = () => {
  homeRedirect();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#how-it-works") {
      setTimeout(() => {
        const el = document.getElementById("how-it-works");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <>
      <main className="bg-app min-h-screen">
        <Hero />

        <Steps />

        {/* Subtle Gradient Divider */}
        <div
          className="h-px w-full max-w-[1400px] mx-auto opacity-[0.15]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(232,115,74,0.4), transparent)" }}
        />

        <Categories />

        <Trust />

        <CTA />
      </main>
    </>
  );
};

export default GuestHome;
