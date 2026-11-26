import { Link } from "react-router-dom";
import RentalCard from "./RentalCard";

const RentalSection = ({ rentals }) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Active & Upcoming Rentals
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Track ongoing handovers, manage 6-digit return PINs, and view borrower contact info.
          </p>
        </div>
        <Link to="/bookings" className="text-bright text-xs font-bold hover:underline shrink-0 mt-1">
          View All History
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {rentals?.map((rental) => (
          <RentalCard key={rental.id} rental={rental} />
        ))}
      </div>
    </div>
  );
};

export default RentalSection;
