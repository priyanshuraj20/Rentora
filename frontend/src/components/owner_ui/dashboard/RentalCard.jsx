import { Link } from "react-router-dom";

const RentalCard = ({ rental }) => {
  const isUpcoming = rental.status === "Upcoming";

  return (
    <div className="flex justify-between items-center gap-6 rounded-2xl bg-surface p-5 border border-app/80 hover:border-bright/40 transition-all group">
      <div className="flex gap-5">
        <div
          className="h-24 w-32 rounded-xl bg-cover bg-center shadow-lg group-hover:scale-105 transition-transform"
          style={{ backgroundImage: `url(${rental.image})` }}
        />

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isUpcoming ? "bg-blue-500" : "bg-emerald-500"}`} />
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isUpcoming ? "text-blue-500" : "text-emerald-500"}`}>
              {rental.status}
            </p>
          </div>

          <h4 className="text-lg font-bold text-text-primary group-hover:text-bright transition-colors">
            {rental.title}
          </h4>
          <p className="text-text-secondary text-sm">
            Rented by <span className="text-text-primary font-medium">{rental.rentedBy}</span> • ⭐ {rental.rating}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-black text-xl text-text-primary mb-2">
          ₹{rental.pricePerDay}
          <span className="text-sm text-text-secondary font-normal ml-1">/day</span>
        </p>
        <Link
          to="/bookings"
          className="px-5 py-2.5 bg-bright hover:scale-104 text-app text-xs font-bold rounded-xl flex items-center gap-2 transition-all hover:cursor-pointer"
        >
          Manage Rental
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default RentalCard;