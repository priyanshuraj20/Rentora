export default function RentalsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-45 h-45 bg-surface rounded-full flex items-center justify-center mb-8 border-4 border-dashed border-text-secondary/50">
        <span className="material-symbols-outlined text-8xl text-text-secondary/50">
          inventory_2
        </span>
      </div>

      <h2 className="text-xl font-bold mb-2">No rentals here yet</h2>
      <p className="text-text-secondary mb-8 max-w-sm text-sm">
        It looks like you haven't booked anything premium recently.
      </p>

      <button className="bg-primary text-white px-8 py-3 rounded-full font-bold bg-accent/80">
        Start Browsing
      </button>
    </div>
  );
}
