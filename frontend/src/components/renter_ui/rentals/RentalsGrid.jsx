import RentalCard from "./RentalCard";

export default function RentalsGrid({ rentals }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {rentals.map((rental) => (
        <RentalCard key={rental.id} rental={rental} />
      ))}
    </div>
  );
}
