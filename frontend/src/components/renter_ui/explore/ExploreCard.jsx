import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

const ExploreCard = ({ item, isWishlisted, onToggleWishlist, linkPrefix = "/renter/rent_items" }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-divider bg-surface shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      {/* Featured Badge */}
      {item.featured && (
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-primary shadow-md">
          FEATURED
        </span>
      )}

      {/* Wishlist */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          onToggleWishlist(item.id);
        }}
        className={`absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all cursor-pointer ${
          isWishlisted 
            ? "bg-primary text-text-primary scale-110" 
            : "bg-card text-text-muted border border-divider hover:text-primary hover:border-primary/40"
        }`}
      >
        <Heart size={15} className={`stroke-[2] ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      <Link to={`${linkPrefix}/${item.id}`} className="block">
        {/* Image */}
        <div className="p-3">
          <div
            className="relative h-48 w-full rounded-2xl bg-card bg-cover bg-center overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url(${item.image || item.images?.[0] || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-5 pt-1">
          {/* Title + Rating */}
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-bold text-text-primary line-clamp-1 tracking-tight">
              {item.title}
            </h4>

            <div className="flex items-center gap-1 text-xs font-semibold shrink-0">
              <Star size={13} className="text-warning fill-warning" />
              <span className="text-text-primary">{item.rating}</span>
            </div>
          </div>

          {/* Subtitle */}
          {item.description && (
            <p className="mt-1 text-xs text-text-secondary line-clamp-1 font-normal">
              {item.description}
            </p>
          )}

          {/* Price + Distance */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              ₹{item.dailyPrice ?? item.pricing?.daily}
              <span className="ml-1 text-xs font-normal text-text-muted">
                /day
              </span>
            </p>

            {item.distanceKm && (
              <span className="rounded-lg bg-card border border-divider px-2.5 py-1 text-[10px] font-medium text-text-secondary">
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
