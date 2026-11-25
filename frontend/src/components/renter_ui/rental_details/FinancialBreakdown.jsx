import { CreditCard, Loader2, Clock, ShieldCheck } from "lucide-react";

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
  const depositAmount = pricing.deposit || 0;
  const initialAmountToPay = depositAmount > 0 ? depositAmount : pricing.totalPaid;

  return (
    <div className="bg-surface border border-divider rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-5 text-text-muted">
        Financial Breakdown
      </h3>
      <div className="border-b border-divider pb-4 space-y-2.5">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Rental Duration</span>
          <span className="font-semibold text-text-primary">{pricing.durationDays} Days</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Rental Cost</span>
          <span className="font-semibold text-text-primary">
            ₹{(pricing.subtotal || pricing.dailyRate * pricing.durationDays || 0).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Security Deposit (Refundable)</span>
          <span className="font-semibold text-emerald-400">
            ₹{(pricing.deposit || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <div
        className={`mt-4 p-4 rounded-2xl flex flex-col ${
          !isPaid
            ? "bg-emerald-500/10 border border-emerald-500/25"
            : "bg-primary/10 border border-primary/20"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span
            className={`font-bold text-[10px] uppercase tracking-wider ${
              !isPaid ? "text-emerald-400" : "text-text-muted"
            }`}
          >
            {!isPaid ? "Escrow Deposit to Confirm" : "Escrow Deposit Locked"}
          </span>
        </div>
        <span className="font-extrabold text-2xl text-text-primary mt-1">
          ₹{initialAmountToPay.toLocaleString("en-IN")}
        </span>
        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
          {!isPaid
            ? "🔒 100% Refundable Security Deposit held safely in Platform Escrow. The rental fee is payable upon handover/return directly to owner."
            : "✓ Deposit safely held in Admin Escrow. 100% refunded to you via Razorpay upon return after AI inspection."}
        </p>
      </div>

      {/* Render Payment Button ONLY after Owner Approves */}
      {isApproved && (
        <button
          onClick={onCompletePayment}
          disabled={isSubmitting}
          className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-text-primary font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Processing Escrow Deposit...</span>
            </>
          ) : (
            <>
              <CreditCard className="size-4" />
              <span>Lock ₹{initialAmountToPay.toLocaleString("en-IN")} Escrow Deposit & Confirm</span>
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
