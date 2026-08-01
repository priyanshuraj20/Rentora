import toast from "react-hot-toast";

export default function CostSummary({ item, startDate, endDate, onRequestBooking, isSubmitting }) {
  const hasDates = !!(startDate && endDate);
  const days = hasDates
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const {
    pricing,
    booking: {
      securityDeposit,
      serviceFee,
      discounts,
      protection
    }
  } = item;

  let rentalFee = 0;
  let appliedDiscount = 0;
  let pricingLabel = "Daily rate";

  if (days >= 30) {
    const months = Math.ceil(days / 30);
    rentalFee = months * pricing.monthly;
    appliedDiscount = (rentalFee * (discounts.monthlyPercent || 0)) / 100;
    pricingLabel = "Monthly rate";
  } else if (days >= 7) {
    const weeks = Math.ceil(days / 7);
    rentalFee = weeks * pricing.weekly;
    appliedDiscount = (rentalFee * (discounts.weeklyPercent || 0)) / 100;
    pricingLabel = "Weekly rate";
  } else if (days > 0) {
    rentalFee = days * pricing.daily;
  }

  const total =
    rentalFee +
    (hasDates ? securityDeposit : 0) +
    (hasDates ? serviceFee : 0) -
    appliedDiscount;

  const handleRequest = () => {
    if (!hasDates) {
      toast.error("Please select dates first");
      return;
    }
    onRequestBooking(total, {
      rentalFee,
      securityDeposit,
      serviceFee,
      appliedDiscount
    });
  };

  return (
    <div className="bg-surface border border-app/80 rounded-xl p-6 space-y-4">
      <h4 className="font-extrabold text-lg ">{item.title}</h4>

      <Row label={`Rental (${pricingLabel})`} value={`₹${rentalFee}`} />
      <Row
        label="Security Deposit"
        value={`₹${hasDates ? securityDeposit : 0}`}
      />
      <Row
        label="Service Fee"
        value={`₹${hasDates ? serviceFee : 0}`}
      />

      {appliedDiscount > 0 && (
        <Row
          label="Discount"
          value={`-₹${appliedDiscount}`}
          highlight
        />
      )}

      <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
        <span>Estimated Total</span>
        <span>₹{total}</span>
      </div>

      {protection.included && (
        <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg">
          ✓ Protection included up to ₹{protection.coverageAmount}
        </div>
      )}

      <button
        onClick={handleRequest}
        disabled={isSubmitting || !hasDates}
        className={`w-full py-3 rounded-xl bg-bright text-surface font-black uppercase tracking-widest text-sm transition-all active:scale-95 ${
          isSubmitting || !hasDates
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-bright/90 cursor-pointer shadow-lg shadow-bright/20"
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
        highlight ? "text-emerald-400" : "opacity-80"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}