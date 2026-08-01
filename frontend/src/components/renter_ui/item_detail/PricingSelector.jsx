import { useState } from "react";

const PricingSelector = ({ pricing }) => {
  const [selectedPlan, setSelectedPlan] = useState("daily");

  const priceMap = {
    daily: { label: "day", value: pricing?.daily || 0 },
    weekly: { label: "week", value: pricing?.weekly || 0 },
    monthly: { label: "month", value: pricing?.monthly || 0 },
  };

  const availablePlans = ["daily", "weekly", "monthly"].filter(
    (plan) => pricing?.[plan] !== undefined && pricing?.[plan] !== null
  );

  return (
    <div className="mt-6 flex justify-between items-center border-b-1 border-divider pb-7">

      {/* Price display */}
      <div className="min-w-[140px]">
        <p className="text-sm text-text-secondary mb-1">Starting at</p>

        <p className="text-2xl font-bold text-bright">
          ₹{priceMap[selectedPlan].value}
          <span className="text-sm text-text-secondary ml-1">
            /{priceMap[selectedPlan].label}
          </span>
        </p>
      </div>

      {/* Selector */}
      <div className="mt-4 flex gap-0.5 bg-app p-1 rounded-xl border-1 border-divider">
        {availablePlans.map((plan) => {
            const isActive = selectedPlan === plan;

            return (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer rounded-lg px-4 py-1.5 text-xs transition
                ${
                  isActive
                    ? "bg-bright text-black border-1 border-bright"
                    : "border-1 border-app"
                }
              `}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default PricingSelector;
