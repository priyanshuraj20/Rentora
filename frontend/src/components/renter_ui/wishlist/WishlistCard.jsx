import { Star, Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom';

export default function WishlistCard({ item, onRemove }) {
  return (
    <div className="bg-card rounded-xl border border-divider overflow-hidden group">
      <div className="relative h-48">
        <img
          src={item.image && item.image !== "undefined" ? item.image : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <span className="absolute top-3 left-3 badge bg-app/60 py-1 px-2 rounded-2xl text-bright font-bold border-1 border-app/60 backdrop-blur-xs">
          {item.category}
        </span>

        <button 
          onClick={() => onRemove(item.id)}
          className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full text-error hover:bg-error hover:text-white transition-all cursor-pointer"
          title="Remove from wishlist"
        >
          <Heart className="size-4 fill-current" />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/renter/rent_items/${item.id}`}>
          <h3 className="font-semibold mb-1 text-bright hover:text-app transition-colors line-clamp-1">{item.title}</h3>
        </Link>

        <p className="text-sm text-text-primary mb-2 flex items-center gap-0.5">
          <div className='flex items-center gap-1.5'><Star className='size-4 text-bright fill-bright' />{item.rating} </div>
          <span className="text-xs text-text-secondary">({item.reviews} reviews)</span>
        </p>

        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="font-bold text-lg text-bright">₹{item.pricePerDay}
              <span className="text-text-secondary text-xs">/day</span></p>
          </div>

          {item.available ? (
            <Link 
              to={`/renter/rent_items/${item.id}`}
              className="text-sm text-app px-4 py-1.5 rounded-2xl font-bold bg-bright hover:bg-app hover:text-bright transition-all"
            >
              Rent Now
            </Link>
          ) : (
            <button className="text-text-primary text-xs font-bold bg-error/20 border border-error/30 px-3 py-1 rounded-2xl cursor-not-allowed">
              Rented
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

