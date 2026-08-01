import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
const ExploreCard = ({ item, isWishlisted, onToggleWishlist, linkPrefix = "/renter/rent_items" }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-divider bg-card shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-0.5 hover:border-accent/60">
      {/* Featured Badge */}
      {item.featured && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-background-dark shadow-md">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-black/15 text-[10px] leading-none">
            +
          </span>
          FEATURED
        </span>
      )}

      {/* Wishlist */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist(item.id);
        }}
        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all cursor-pointer ${
          isWishlisted 
            ? "bg-app text-white" 
            : "bg-white/60 text-black hover:text-accent"
        }`}
      >
        <Heart size={16} className={`stroke-[2.2] ${isWishlisted ? "fill-current" : ""}`} />
      </button>


      <Link to={`${linkPrefix}/${item.id}`} className="block">
        {/* Image */}
        <div className="px-3 pt-3">
          <div
            className="relative h-44 w-full rounded-xl bg-white bg-cover bg-center shadow-inner transition-transform duration-300 group-hover:scale-[1.01]"
            style={{ backgroundImage: `url(${item.image})` }}
          />
        </div>

        {/* Content */}
        <div className="px-4 pb-4 pt-3">
          {/* Title + Rating */}
          <div className="flex items-center justify-between">
            <h4 className="text-[15px] font-bold text-text-primary line-clamp-1">
              {item.title}
            </h4>

            <div className="flex items-center gap-1 text-sm font-semibold">
              <Star size={14} className="text-bright fill-bright" />
              {item.rating}
            </div>
          </div>

          {/* Subtitle */}
          {item.description && (
            <p className="mt-1 text-xs text-text-secondary/90 line-clamp-1">
              {item.description}
            </p>
          )}

          {/* Price + Distance */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-bright">
              ₹{item.dailyPrice ?? item.pricing?.daily}
              <span className="ml-1 text-[11px] font-medium text-text-secondary">
                /day
              </span>
            </p>

            {item.distanceKm && (
              <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                {item.distanceKm} km away
              </span>
            )}
          </div>
        </div>

      </Link>
    </div>
  );
};

export default ExploreCard;
