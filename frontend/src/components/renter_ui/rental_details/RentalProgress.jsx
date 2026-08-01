import { Clock } from "lucide-react";

export default function RentalProgress({ rental }) {
  const isPaid = rental.paymentStatus === "paid" && (rental.status === "confirmed" || rental.status === "ongoing");

  return (
    <div className="bg-surface border-1 border-app/80 rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase mb-6 text-text-primary">
        Rental Progress
      </h3>

      <div className="flex justify-between mb-4">
        <p className="font-bold text-text-primary">{rental.startDate}</p>
        <p className="font-bold text-text-primary">{rental.endDate}</p>
      </div>

      {isPaid ? (
        <>
          <div className="h-2 bg-divider rounded-full overflow-hidden">
            <div
              className="h-full bg-bright rounded-full transition-all duration-500"
              style={{ width: `${rental.progressPercent}%` }}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <span className="bg-bright/10 text-bright text-xs font-bold px-4 py-1 rounded-full border border-bright/20">
              {rental.daysRemaining} Days Remaining
            </span>
          </div>
        </>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
            <Clock size={16} />
            <span>Awaiting Payment Verification</span>
          </div>
          <p className="text-xs text-amber-400/80">
            Rental progress and schedule unlock after payment is completed and verified.
          </p>
        </div>
      )}
    </div>
  );
}
