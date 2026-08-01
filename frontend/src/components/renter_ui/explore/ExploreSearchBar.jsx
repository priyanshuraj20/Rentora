import { Search } from "lucide-react";

const ExploreSearchBar = ({ value, onChange, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <div className="mb-8">
      <form
        onSubmit={handleSubmit}
        className="relative max-w-2xl mx-auto rounded-2xl bg-surface border border-divider flex items-center h-13 px-4 shadow-md focus-within:border-primary/50 transition-all"
      >
        <Search className="text-text-muted mr-3 size-4 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted text-sm font-normal"
          placeholder="Search items near you (e.g. camera, bike, car, drill)..."
        />
        <button
          type="submit"
          className="ml-2 bg-primary hover:bg-primary-hover active:scale-95 text-text-primary font-semibold px-5 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0 shadow-sm"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default ExploreSearchBar;
