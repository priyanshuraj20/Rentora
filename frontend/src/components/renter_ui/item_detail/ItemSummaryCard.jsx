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
    <div className="rounded-3xl border border-divider bg-card p-6 min-h-[350px] shadow-lg">
      <h1 className="text-2xl font-bold text-bright">{item.title}</h1>

      <p className="mt-1 text-text-secondary text-sm">
        {item.category}
      </p>

      <PricingSelector pricing={item.pricing} />

      <button 
        onClick={handleRentClick} 
        className="mt-6 w-full rounded-xl bg-app py-4 font-bold text-background-dark text-white hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md"
      >
        Rent Now →
      </button>

      <button 
        onClick={onToggleWishlist}
        className={`mt-4 w-full rounded-xl border py-4 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isWishlisted 
            ? "border-app bg-app/10 text-app" 
            : "border-divider text-text-primary hover:border-app hover:text-app"
        }`}
      >
        <Heart className={`size-5 ${isWishlisted ? "fill-current" : ""}`} />
        {isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
};


export default ItemSummaryCard;
