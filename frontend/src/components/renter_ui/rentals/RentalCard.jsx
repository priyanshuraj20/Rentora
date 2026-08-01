import { Link } from "react-router-dom";

export default function RentalCard({ rental }) {
  return (
    <Link to={`/rentals/${rental.id}`} className="block">
      <div className="bg-surface border border-divider rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 shadow-sm group">
        <div
          className="relative h-48 bg-cover bg-center bg-card border-b border-divider"
          style={{ backgroundImage: `url(${rental.image})` }}
        >
          <span className="absolute top-4 left-4 bg-primary text-text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            {rental.badge}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                {rental.title}
              </h3>
              <p className="text-text-secondary text-xs flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm text-text-muted">
                  calendar_today
                </span>
                {rental.startDate} — {rental.endDate}
              </p>
            </div>

            <p className="text-primary font-bold text-base">₹{rental.price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
