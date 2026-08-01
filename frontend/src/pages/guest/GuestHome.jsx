import Hero from "../../components/guest_ui/guest_dashboard/Hero";
import Steps from "../../components/guest_ui/guest_dashboard/Steps";
import Categories from "../../components/guest_ui/guest_dashboard/Categories";
import Trust from "../../components/guest_ui/guest_dashboard/Trust";
import CTA from "../../components/guest_ui/guest_dashboard/CTA";
import homeRedirect from "../../hooks/homeRedirect";

const GuestHome = () => {
  homeRedirect();

  return (
    <>
      <main className="bg-app min-h-screen">
        <Hero />

        <Steps />

        {/* Subtle Gradient Divider */}
        <div
          className="h-px w-full max-w-[1400px] mx-auto opacity-[0.1]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(47,183,164,0.3), transparent)" }}
        />

        <Categories />

        <Trust />

        <CTA />

        {/* Footer could go here too if needed, but usually it's in App.jsx */}
      </main>
    </>
  );
};

export default GuestHome;
