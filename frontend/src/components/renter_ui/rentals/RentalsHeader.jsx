import { Link } from "react-router-dom";

export default function RentalsHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Active Inventory</h1>
        <p className="text-text-secondary max-w-md">
          Oversee your current bookings and historical rentals. All your agreements in one workspace.
        </p>
      </div>

      <Link
        to="/renter_explore"
        className="bg-bright text-app px-6.5 py-3 rounded-3xl font-bold flex items-center gap-2 hover:scale-102 active:scale-95 transition-all cursor-pointer shadow-md"
      >
        <span className="material-symbols-outlined font-bold">add_circle</span>
        New Rental
      </Link>
    </div>
  );
}
