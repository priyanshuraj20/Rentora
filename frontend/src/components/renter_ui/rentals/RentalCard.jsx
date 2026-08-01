import { Link } from "react-router-dom";
export default function RentalCard({ rental }) {
  
  console.log(rental.id)
  return (
    <Link to={`/rentals/${rental.id}`} className="block">
      <div className="bg-surface border-2 border-app/80 rounded-xl overflow-hidden hover:border-bright/40 transition-all">
        <div
          className="relative h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${rental.image})` }}
        >
          <span className="absolute top-4 left-4 bg-accent/90 text-background-dark text-[10px] font-black px-3 py-1 rounded-full uppercase">
            {rental.badge}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold hover:text-bright transition-colors">
                {rental.title}
              </h3>
              <p className="text-text-secondary text-xs flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                {rental.startDate} — {rental.endDate}
              </p>
            </div>

            <p className="text-bright font-bold">₹{rental.price}</p>
          </div>

          <div className="flex justify-around border-t border-divider pt-4">
            {["chat_bubble", "event_repeat", "cancel"].map((icon) => (
              <button
                key={icon}
                className="flex flex-col items-center text-text-secondary/50"
              >
                <div className="size-10 rounded-full bg-app flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    {icon}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Link>

  );
}
