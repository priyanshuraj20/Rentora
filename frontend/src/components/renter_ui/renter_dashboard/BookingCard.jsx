import { Link } from "react-router-dom";

export default function BookingCard({ booking }) {
  const isActive = booking.status === "active";

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 rounded-2xl bg-surface p-5 border border-divider hover:border-primary/40 transition-all duration-300 shadow-sm">
      <div className="flex gap-4">
        <div
          className="h-20 w-28 rounded-2xl bg-cover bg-center shrink-0 border border-divider"
          style={{ backgroundImage: `url(${booking.image})` }}
        />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-success" : "bg-secondary-accent"}`} />
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-success" : "text-secondary-accent"}`}>
              {isActive ? "Active Now" : "Upcoming"}
            </p>
          </div>

          <h4 className="text-base font-bold text-text-primary line-clamp-1">{booking.title}</h4>
          <p className="text-text-secondary text-xs mt-0.5">
            {booking.dateRange} • {booking.category}
          </p>
        </div>
      </div>

      <div className="sm:text-right flex sm:flex-col justify-between items-end gap-2 pt-2 sm:pt-0">
        <p className="font-bold text-lg text-primary">₹{booking.price}</p>
        <Link
          to={`/rentals/${booking.id}`}
          className="px-4 py-2 text-text-primary text-xs font-semibold rounded-xl flex items-center gap-1.5 bg-primary hover:bg-primary-hover active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          View Details
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
