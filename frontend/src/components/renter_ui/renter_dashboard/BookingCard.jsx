import { Link } from "react-router-dom";

export default function BookingCard({ booking }) {
  const isActive = booking.status === "active";

  return (
    <div className="flex justify-between gap-6 rounded-2xl bg-surface p-5 border-1 border-app/80 hover:border-bright/40 transition-all">
      <div className="flex gap-5">
        <div
          className="h-24 w-32 rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${booking.image})` }}
        />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-bright" : "bg-blue-500"}`} />
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-bright" : "text-blue-500"}`}>
              {isActive ? "Active Now" : "Upcoming"}
            </p>
          </div>

          <h4 className="text-lg font-bold">{booking.title}</h4>
          <p className="text-text-secondary text-sm">
            {booking.dateRange} • {booking.category}
          </p>
        </div>
      </div>

      <div className="text-right flex flex-col justify-between items-end">
        <p className="font-black text-lg">₹{booking.price}</p>
        <Link
          to={`/rentals/${booking.id}`}
          className="mt-3 px-4 py-2 text-app text-xs font-bold rounded-xl flex items-center gap-2 hover:scale-104 bg-bright hover:cursor-pointer transition-all"
        >
          View Details
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
