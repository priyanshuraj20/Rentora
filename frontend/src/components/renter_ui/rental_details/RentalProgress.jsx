import { Clock } from "lucide-react";

export default function RentalProgress({ rental }) {
  const isPaid = rental.paymentStatus === "paid" && (rental.status === "confirmed" || rental.status === "ongoing");

  return (
    <div className="bg-surface border border-divider rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-5 text-text-muted">
        Rental Progress
      </h3>

      <div className="flex justify-between mb-4 text-xs font-semibold text-text-primary">
        <p>{rental.startDate}</p>
        <p>{rental.endDate}</p>
      </div>

      {isPaid ? (
        <>
          <div className="h-2 bg-card rounded-full overflow-hidden border border-divider">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${rental.progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-4 py-1 rounded-full border border-primary/20">
              {rental.daysRemaining} Days Remaining
            </span>
          </div>
        </>
      ) : (
        <div className="bg-warning/15 border border-warning/30 rounded-2xl p-4 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-warning font-semibold text-xs">
            <Clock size={15} />
            <span>Awaiting Payment Verification</span>
          </div>
          <p className="text-[11px] text-text-secondary">
            Rental progress and schedule unlock after payment is completed and verified.
          </p>
        </div>
      )}
    </div>
  );
}
