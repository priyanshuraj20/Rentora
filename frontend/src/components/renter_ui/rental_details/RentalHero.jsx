export default function RentalHero({ rental }) {
  const getStatusBadgeStyle = (status, paymentStatus) => {
    const s = status?.toLowerCase();
    if (s === "approved" || paymentStatus === "pending") {
      return "bg-warning/15 text-warning border-warning/30";
    }
    if (s === "confirmed" || s === "ongoing" || s === "completed") {
      return "bg-success/15 text-success border-success/30";
    }
    if (s === "rejected" || s === "cancelled") {
      return "bg-error/15 text-error border-error/30";
    }
    return "bg-warning/15 text-warning border-warning/30";
  };

  const getDisplayStatus = (status, paymentStatus) => {
    const s = status?.toLowerCase();
    if (paymentStatus === "pending" && (s === "approved" || s === "confirmed")) {
      return "APPROVED — PAYMENT PENDING";
    }
    return status?.toUpperCase() || "PENDING";
  };

  return (
    <div className="bg-surface border border-divider rounded-3xl overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 h-48 md:h-auto bg-card border-r border-divider">
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
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider border rounded-full py-1 px-3 ${getStatusBadgeStyle(
                  rental.status,
                  rental.paymentStatus
                )}`}
              >
                {getDisplayStatus(rental.status, rental.paymentStatus)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-1 tracking-tight">
              {rental.title}
            </h1>
            <p className="text-text-secondary text-xs">{rental.location}</p>
          </div>

          <div className="mt-6 flex justify-between border-t border-divider pt-4">
            <p className="text-xs text-text-secondary">
              Rental Type:{" "}
              <span className="font-semibold uppercase text-text-primary">
                {rental.rentalType}
              </span>
            </p>
            <p className="text-xs text-text-muted">
              Requested on {rental.agreementDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
