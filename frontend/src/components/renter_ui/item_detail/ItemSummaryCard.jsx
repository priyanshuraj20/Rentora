import { Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PricingSelector from "./PricingSelector";

const ItemSummaryCard = ({ item, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleRentClick() {
    navigate(`/renter/rent/${id}`);
  }

  return (
    <div className="rounded-3xl border border-divider bg-surface p-6 min-h-[350px] shadow-sm">
      <h1 className="text-2xl font-bold text-text-primary tracking-tight">{item.title}</h1>

      <p className="mt-1 text-text-secondary text-xs font-medium uppercase tracking-wider">
        {item.category}
      </p>

      <PricingSelector pricing={item.pricing} />

      <button 
        onClick={handleRentClick} 
        className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-text-primary hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shadow-md text-sm"
      >
        Rent Now →
      </button>

      <button 
        onClick={onToggleWishlist}
        className={`mt-3 w-full rounded-xl border py-3 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isWishlisted 
            ? "border-primary/40 bg-primary/10 text-primary" 
            : "border-divider text-text-secondary hover:border-primary/40 hover:text-text-primary"
        }`}
      >
        <Heart className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
        {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
};

export default ItemSummaryCard;
