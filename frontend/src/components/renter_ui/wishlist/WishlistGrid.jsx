import WishlistCard from "./WishlistCard";

export default function WishlistGrid({ items, onRemove }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <WishlistCard key={item.id} item={item} onRemove={onRemove} />
      ))}
    </div>
  );
}

