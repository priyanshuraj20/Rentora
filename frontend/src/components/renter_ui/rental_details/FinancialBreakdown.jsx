import { CreditCard, Loader2, Clock } from "lucide-react";

export default function FinancialBreakdown({
  pricing,
  paymentStatus,
  status,
  onCompletePayment,
  isSubmitting,
}) {
  const isPaid = paymentStatus === "paid";
  const isApproved = status === "approved" && paymentStatus === "pending";
  const isPendingOwner = status === "pending";

  return (
    <div className="bg-surface border border-divider rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-5 text-text-muted">
        Financial Breakdown
      </h3>
      <div className="border-b border-divider pb-4 space-y-2.5">
        {[
          ["Daily Rate", `₹${pricing.dailyRate}`],
          ["Duration", `${pricing.durationDays} Days`],
          ["Subtotal", `₹${pricing.subtotal}`],
          ["Security Deposit", `₹${pricing.deposit}`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-text-secondary">{label}</span>
            <span className="font-semibold text-text-primary">{value}</span>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 p-4 rounded-2xl flex flex-col ${
          !isPaid
            ? "bg-warning/15 border border-warning/30"
            : "bg-primary/10 border border-primary/20"
        }`}
      >
        <span
          className={`font-bold text-[10px] uppercase tracking-wider ${
            !isPaid ? "text-warning" : "text-text-muted"
          }`}
        >
          {!isPaid ? "Amount Due" : "Total Paid"}
        </span>
        <span className="font-extrabold text-2xl text-text-primary mt-1">
          ₹{pricing.totalPaid}
        </span>
      </div>

      {/* Render Payment Button ONLY after Owner Approves */}
      {isApproved && (
        <button
          onClick={onCompletePayment}
          disabled={isSubmitting}
          className="mt-6 w-full bg-primary hover:bg-primary-hover active:scale-95 text-text-primary font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              <span>Complete Payment (Razorpay)</span>
            </>
          )}
        </button>
      )}

      {/* Render Info Notice when Owner Has Not Approved Yet */}
      {isPendingOwner && (
        <div className="mt-6 p-3.5 bg-warning/15 border border-warning/30 rounded-xl text-warning text-xs font-medium text-center flex items-center justify-center gap-2">
          <Clock className="size-4 shrink-0" />
          <span>Payment unlocks after owner approves your booking request</span>
        </div>
      )}
    </div>
  );
}
