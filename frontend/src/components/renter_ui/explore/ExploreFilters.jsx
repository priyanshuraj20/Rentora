const ExploreFilters = ({ filters, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2.5 mb-8">
      <button
        onClick={() => onChange({ ...filters, featured: !filters.featured })}
        className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
          filters?.featured
            ? "bg-primary text-text-primary border-primary shadow-sm"
            : "bg-surface border-divider text-text-secondary hover:text-text-primary hover:bg-white/5"
        }`}
      >
        Featured
      </button>

      <button className="rounded-xl border border-divider bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer">
        Price
      </button>

      <button className="rounded-xl border border-divider bg-surface px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer">
        Distance
      </button>
    </div>
  );
};

export default ExploreFilters;
