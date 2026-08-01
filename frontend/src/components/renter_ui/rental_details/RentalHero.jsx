export default function RentalHero({ rental }) {
  const getStatusBadgeStyle = (status, paymentStatus) => {
    const s = status?.toLowerCase();
    if (s === "approved" || paymentStatus === "pending") {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    if (s === "confirmed" || s === "ongoing" || s === "completed") {
      return "bg-[#162a29] text-emerald-400 border-emerald-500/30";
    }
    if (s === "rejected" || s === "cancelled") {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    }
    return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
  };

  const getDisplayStatus = (status, paymentStatus) => {
    const s = status?.toLowerCase();
    if (paymentStatus === "pending" && (s === "approved" || s === "confirmed")) {
      return "APPROVED — PAYMENT PENDING";
    }
    return status?.toUpperCase() || "PENDING";
  };

  return (
    <div className="bg-surface border-1 border-app/80 rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto">
          <img
            src={
              rental.image && rental.image !== "undefined"
                ? rental.image
                : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"
            }
            alt={rental.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span
                className={`text-xs font-bold border rounded-xl py-1 px-3 ${getStatusBadgeStyle(
                  rental.status,
                  rental.paymentStatus
                )}`}
              >
                {getDisplayStatus(rental.status, rental.paymentStatus)}
              </span>
            </div>
            <h1 className="text-2xl font-black text-text-primary mb-1">
              {rental.title}
            </h1>
            <p className="text-text-secondary text-sm">{rental.location}</p>
          </div>

          <div className="mt-6 flex justify-between border-t border-divider/20 pt-4">
            <p className="text-sm text-text-secondary">
              Rental Type:{" "}
              <span className="font-bold uppercase text-text-primary">
                {rental.rentalType}
              </span>
            </p>
            <p className="text-xs text-text-secondary">
              Requested on {rental.agreementDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
