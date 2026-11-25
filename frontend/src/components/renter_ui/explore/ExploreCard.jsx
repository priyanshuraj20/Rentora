import { Heart, Star, MapPin, ShieldCheck } from "lucide-react";
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

          {/* Location & Distance Badge */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-1 min-w-0 pr-2">
              <MapPin size={12} className="text-primary shrink-0" />
              <span className="truncate font-medium text-text-secondary">
                {item.location?.area ? `${item.location.area}, ` : ""}{item.location?.city || item.location?.district || "Available locally"}
              </span>
            </div>

            {item.distanceKm !== null && item.distanceKm !== undefined && (
              <span className="shrink-0 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {item.distanceKm < 1 ? "< 1 km away" : `${item.distanceKm} km away`}
              </span>
            )}
          </div>

          {/* Price & Deposit */}
          <div className="mt-3 flex items-end justify-between pt-2 border-t border-divider/40">
            <div>
              <p className="text-lg font-bold text-primary leading-tight">
                ₹{item.dailyPrice ?? item.pricing?.daily}
                <span className="ml-1 text-xs font-normal text-text-muted">
                  /day
                </span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
                <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
                <span>
                  {item.securityDeposit && Number(item.securityDeposit) > 0
                    ? `₹${Number(item.securityDeposit).toLocaleString("en-IN")} deposit`
                    : "Zero deposit"}
                </span>
              </p>
            </div>

            <span className="text-[11px] font-medium text-text-muted group-hover:text-primary transition-colors pb-0.5">
              View Details →
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ExploreCard;
