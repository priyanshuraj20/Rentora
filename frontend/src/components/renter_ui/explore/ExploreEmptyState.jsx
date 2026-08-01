import { SearchX } from "lucide-react";

const ExploreEmptyState = () => {
  return (
    <div className="text-center py-20 px-4 bg-surface border border-divider rounded-2xl my-6 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-card border border-divider flex items-center justify-center mx-auto mb-4 text-text-muted">
        <SearchX size={24} />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-1">No rentals found</h3>
      <p className="text-xs text-text-secondary">Try changing filters or search terms in your area.</p>
    </div>
  );
};

export default ExploreEmptyState;
