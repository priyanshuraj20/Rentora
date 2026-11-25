import { useState } from "react";
import toast from "react-hot-toast";

export default function CostSummary({ item, startDate, endDate, onRequestBooking, isSubmitting }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const hasDates = !!(startDate && endDate);

  // Clean calendar day difference (e.g. Dec 1 to Dec 8 is 7 days, min 1 day)
  const days = hasDates
    ? Math.max(1, Math.round(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) || 1)
    : 0;

  const pricing = item.pricing || item.price || { daily: 0, weekly: 0, monthly: 0 };
  const dailyPrice = Number(pricing.daily || 0);
  const weeklyPrice = Number(pricing.weekly || 0);
  const monthlyPrice = Number(pricing.monthly || 0);
  const securityDeposit = hasDates ? Number(item.securityDeposit || item.booking?.securityDeposit || 0) : 0;

  let rentalFee = 0;
  let pricingLabel = "Daily rate";

  if (days >= 30 && monthlyPrice > 0) {
    const fullMonths = Math.floor(days / 30);
    const remDays = days % 30;
    const remWeeks = weeklyPrice > 0 ? Math.floor(remDays / 7) : 0;
    const oddDays = weeklyPrice > 0 ? remDays % 7 : remDays;

    let remCost = (remWeeks * weeklyPrice) + (oddDays * dailyPrice);
    if (remCost > monthlyPrice) remCost = monthlyPrice;

    rentalFee = (fullMonths * monthlyPrice) + remCost;
    pricingLabel = fullMonths === 1 && remDays === 0 ? "Monthly rate" : `${days} days`;
  } else if (days >= 7 && weeklyPrice > 0) {
    const fullWeeks = Math.floor(days / 7);
    const oddDays = days % 7;

    let remCost = oddDays * dailyPrice;
    if (remCost > weeklyPrice) remCost = weeklyPrice;

    rentalFee = (fullWeeks * weeklyPrice) + remCost;
    pricingLabel = fullWeeks === 1 && oddDays === 0 ? "Weekly rate" : `${days} days`;
  } else if (days > 0) {
    rentalFee = days * dailyPrice;
    pricingLabel = days === 1 ? "1 day" : `${days} days`;
  }

  // Pure, transparent total: Rental Fee + Refundable Security Deposit
  const total = rentalFee + securityDeposit;

  const handleRequest = () => {
    if (!hasDates) {
      toast.error("Please select dates first");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the Security Deposit Escrow Terms & Rental Agreement to proceed.");
      return;
    }
    onRequestBooking(total, {
      rentalFee,
      securityDeposit,
      serviceFee: 0,
      appliedDiscount: 0
    });
  };

  return (
    <div className="bg-surface border border-divider rounded-3xl p-6 space-y-4 shadow-sm">
      <h4 className="font-bold text-lg text-text-primary">{item.title}</h4>

      <Row label={`Rental (${pricingLabel})`} value={`₹${rentalFee.toLocaleString("en-IN")}`} />
      <Row
        label="Security Deposit (Refundable)"
        value={`₹${securityDeposit.toLocaleString("en-IN")}`}
      />

      <div className="border-t border-divider pt-3 flex justify-between font-bold text-text-primary text-base">
        <span>Estimated Total</span>
        <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
      </div>

      {item.booking?.protection?.included && (
        <div className="text-xs text-success bg-success/15 border border-success/30 p-3 rounded-xl font-medium">
          ✓ Protection included up to ₹{(item.booking.protection.coverageAmount || 50000).toLocaleString("en-IN")}
        </div>
      )}

      {/* Security Deposit Escrow Terms Box */}
      <div className="bg-app border border-divider/80 rounded-2xl p-3.5 space-y-2.5 text-xs">
        <div className="flex items-center gap-2 font-bold text-text-primary text-[11px] tracking-tight">
          <span className="p-1 rounded-md bg-primary/20 text-primary">🛡️</span>
          <span>Escrow Protection & Deposit Refund</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Your security deposit is held in platform escrow, never given to the owner upfront. Upon return, Gemini AI condition diffing validates item health and releases 100% refund immediately via Razorpay for undamaged returns.
        </p>
        <label className="flex items-start gap-2.5 pt-1 text-[11px] text-text-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 rounded border-divider text-primary focus:ring-0 cursor-pointer"
          />
          <span>I agree to the Escrow Deposit Terms, AI Return Damage Inspection, and Rental Policies.</span>
        </label>
      </div>

      <button
        onClick={handleRequest}
        disabled={isSubmitting || !hasDates}
        className={`w-full py-3.5 rounded-xl bg-primary text-text-primary font-semibold tracking-wide text-xs uppercase transition-all shadow-md ${
          isSubmitting || !hasDates
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-primary-hover cursor-pointer active:scale-95"
        }`}
      >
        {isSubmitting ? "Sending Request..." : "Request from Owner →"}
      </button>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div
      className={`flex justify-between text-xs ${
        highlight ? "text-success font-semibold" : "text-text-secondary"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}