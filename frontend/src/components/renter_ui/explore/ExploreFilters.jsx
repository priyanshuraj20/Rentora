const ExploreFilters = ({ filters, onChange }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-10">
      <button
        onClick={() => onChange({ ...filters, featured: !filters.featured })}
        className="rounded-xl border border-border-custom bg-surface px-4 py-2 text-xs font-medium"
      >
        Featured
      </button>

      <button className="rounded-xl border border-border-custom bg-surface px-4 py-2 text-xs font-medium">
        Price
      </button>

      <button className="rounded-xl border border-border-custom bg-surface px-4 py-2 text-xs font-medium">
        Distance
      </button>
    </div>
  );
};

export default ExploreFilters;


// Fix the filter UI
