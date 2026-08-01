import { Link } from "react-router-dom";

const RentalCard = ({ rental }) => {
  const isUpcoming = rental.status === "Upcoming";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-2xl bg-surface p-5 border border-divider hover:border-primary/40 transition-all duration-300 shadow-sm group">
      <div className="flex gap-4">
        <div
          className="h-20 w-28 rounded-2xl bg-cover bg-center border border-divider shrink-0"
          style={{ backgroundImage: `url(${rental.image})` }}
        />

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isUpcoming ? "bg-secondary-accent" : "bg-success"}`} />
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isUpcoming ? "text-secondary-accent" : "text-success"}`}>
              {rental.status}
            </p>
          </div>

          <h4 className="text-base font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
            {rental.title}
          </h4>
          <p className="text-text-secondary text-xs mt-0.5">
            Rented by <span className="text-text-primary font-medium">{rental.rentedBy}</span> • ⭐ {rental.rating}
          </p>
        </div>
      </div>

      <div className="sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
        <p className="font-bold text-lg text-primary mb-1">
          ₹{rental.pricePerDay}
          <span className="text-xs text-text-muted font-normal ml-1">/day</span>
        </p>
        <Link
          to="/bookings"
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-text-primary text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Manage Rental
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default RentalCard;