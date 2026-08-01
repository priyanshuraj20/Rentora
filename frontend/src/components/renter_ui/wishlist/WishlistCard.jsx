import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WishlistCard({ item, onRemove }) {
  return (
    <div className="bg-surface rounded-3xl border border-divider overflow-hidden group shadow-sm hover:border-primary/40 transition-all duration-300">
      <div className="relative h-48 bg-card border-b border-divider">
        <img
          src={item.image && item.image !== "undefined" ? item.image : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute top-3 left-3 bg-app/80 py-0.5 px-2.5 rounded-full text-primary text-[10px] font-bold uppercase tracking-wider border border-divider">
          {item.category}
        </span>

        <button 
          onClick={() => onRemove(item.id)}
          className="absolute top-3 right-3 p-2 bg-surface/80 border border-divider rounded-full text-primary hover:bg-error hover:text-text-primary hover:border-error transition-all cursor-pointer shadow-sm"
          title="Remove from wishlist"
        >
          <Heart className="size-4 fill-current" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <Link to={`/renter/rent_items/${item.id}`}>
          <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">{item.title}</h3>
        </Link>

        <div className="text-xs text-text-primary flex items-center gap-1.5">
          <div className='flex items-center gap-1'><Star className='size-3.5 text-warning fill-warning' /><span className="font-bold">{item.rating}</span></div>
          <span className="text-[10px] text-text-muted">({item.reviews} reviews)</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-divider">
          <div>
            <p className="font-bold text-base text-primary">₹{item.pricePerDay}
              <span className="text-text-muted text-[10px] font-normal ml-0.5">/day</span></p>
          </div>

          {item.available ? (
            <Link 
              to={`/renter/rent_items/${item.id}`}
              className="text-xs text-text-primary px-4 py-1.5 rounded-xl font-semibold bg-primary hover:bg-primary-hover transition-all shadow-sm"
            >
              Rent Now
            </Link>
          ) : (
            <button className="text-error text-[10px] font-bold bg-error/15 border border-error/30 px-3 py-1 rounded-xl cursor-not-allowed uppercase tracking-wider">
              Rented
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
