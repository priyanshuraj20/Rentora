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
    <div className="mt-6 flex justify-between items-center border-b border-divider pb-6">

      {/* Price display */}
      <div className="min-w-[140px]">
        <p className="text-xs text-text-muted mb-1 font-medium">Starting at</p>

        <p className="text-2xl font-bold text-primary">
          ₹{priceMap[selectedPlan].value}
          <span className="text-xs text-text-muted ml-1 font-normal">
            /{priceMap[selectedPlan].label}
          </span>
        </p>
      </div>

      {/* Selector */}
      <div className="flex gap-1 bg-app p-1 rounded-xl border border-divider">
        {availablePlans.map((plan) => {
            const isActive = selectedPlan === plan;

            return (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all
                ${
                  isActive
                    ? "bg-primary text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
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
