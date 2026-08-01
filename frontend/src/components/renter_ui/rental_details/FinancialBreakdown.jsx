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
    <div className="bg-surface border-1 border-app/80 rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase mb-6 text-text-primary">
        Financial Breakdown
      </h3>
      <div className="border-b border-divider/20 pb-4">
        {[
          ["Daily Rate", `₹${pricing.dailyRate}`],
          ["Duration", `${pricing.durationDays} Days`],
          ["Subtotal", `₹${pricing.subtotal}`],
          ["Security Deposit", `₹${pricing.deposit}`],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm mb-3">
            <span className="text-text-secondary">{label}</span>
            <span className="font-medium text-text-primary">{value}</span>
          </div>
        ))}
      </div>

      <div
        className={`mt-4 p-4 rounded-xl flex flex-col ${
          !isPaid
            ? "bg-amber-500/10 border border-amber-500/30"
            : "bg-accent/20 border border-accent/30"
        }`}
      >
        <span
          className={`font-black text-xs uppercase ${
            !isPaid ? "text-amber-400" : "text-text-secondary"
          }`}
        >
          {!isPaid ? "Amount Due" : "Total Paid"}
        </span>
        <span className="font-black text-3xl text-text-primary mt-1">
          ₹{pricing.totalPaid}
        </span>
      </div>

      {/* Render Payment Button ONLY after Owner Approves */}
      {isApproved && (
        <button
          onClick={onCompletePayment}
          disabled={isSubmitting}
          className="mt-6 w-full bg-bright hover:scale-[1.02] active:scale-98 text-app font-black py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="size-5" />
              <span>Complete Payment (Razorpay)</span>
            </>
          )}
        </button>
      )}

      {/* Render Info Notice when Owner Has Not Approved Yet */}
      {isPendingOwner && (
        <div className="mt-6 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-bold text-center flex items-center justify-center gap-2">
          <Clock className="size-4 shrink-0" />
          <span>Payment unlocks after owner approves your booking request</span>
        </div>
      )}
    </div>
  );
}
