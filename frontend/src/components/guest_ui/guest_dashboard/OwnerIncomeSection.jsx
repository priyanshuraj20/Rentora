import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, Camera, Wrench, Navigation, Sparkles } from "lucide-react";
import AuthController from "../../auth/AuthController";
import useAuth from "../../../hooks/authHook";

export default function OwnerIncomeSection() {
  const [authOpen, setAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleListClick = () => {
    if (user) {
      if (user.role === "owner" || user.roles === "owner") {
        navigate("/listings");
      } else {
        navigate("/role-redirect");
      }
    } else {
      setAuthOpen(true);
    }
  };

  const assetExamples = [
    {
      title: "Sony Alpha Mirrorless Camera",
      category: "Photography",
      rate: "₹1,400",
      period: "day",
      icon: <Camera className="size-4 text-primary" />,
    },
    {
      title: "Bosch Professional Cordless Drill",
      category: "Tools",
      rate: "₹350",
      period: "day",
      icon: <Wrench className="size-4 text-secondary-accent" />,
    },
    {
      title: "DJI 4K Drone Kit",
      category: "Electronics",
      rate: "₹1,800",
      period: "day",
      icon: <Navigation className="size-4 text-emerald-400" />,
    },
  ];

  return (
    <section className="py-20 border-t border-divider bg-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">

          {/* Left Column: Heading & Value Points */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-5">
              <Sparkles size={13} />
              Owner Opportunity
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-text-primary leading-[1.15] mb-5 tracking-tight">
              Your Unused Things Could Be Someone Else's Next Necessity.
            </h2>

            <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed font-normal max-w-xl">
              That camera sitting on your shelf, the tools in your garage, or equipment you rarely use could help someone nearby while generating additional income for you.
            </p>

            {/* Micro Value Points */}
            <div className="space-y-4 mb-8 w-full max-w-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary font-semibold">You set the rules:</strong> Full control over your daily, weekly, or monthly pricing and availability schedules.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary font-semibold">Zero upfront listing fees:</strong> List as many items as you want without subscriptions or hidden costs.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary font-semibold">Protected transactions:</strong> Refundable security deposits and 6-digit PIN verification safeguard your belongings.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleListClick}
              className="group bg-primary text-text-primary px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
            >
              List Your First Item
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right Column: Asset Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-app border border-divider rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-5 border-b border-divider mb-6">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Everyday Assets with Value</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Typical items earning in neighborhoods nearby</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>

              <div className="space-y-3.5 mb-6">
                {assetExamples.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-divider hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-app flex items-center justify-center border border-divider">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-text-primary line-clamp-1">{item.title}</p>
                        <p className="text-[10px] text-text-muted">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right pl-2 shrink-0">
                      <p className="text-xs sm:text-sm font-extrabold text-primary">{item.rate}</p>
                      <p className="text-[10px] text-text-muted">/{item.period}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <p className="text-xs text-text-secondary leading-snug">
                  <strong className="text-text-primary font-semibold">90% Net Payout:</strong> Rentora retains only a 10% platform fee from completed rentals.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {authOpen && (
        <AuthController
          isOpen={authOpen}
          initialMode="register"
          onClose={() => setAuthOpen(false)}
        />
      )}
    </section>
  );
}
