import { Search } from "lucide-react";

const ExploreSearchBar = ({ value, onChange, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <div className="mb-10">
      <form
        onSubmit={handleSubmit}
        className="relative max-w-3xl mx-auto rounded-3xl bg-card border border-divider flex items-center h-14 px-4 shadow-md"
      >
        <Search className="text-text-secondary mr-3 size-5 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-secondary text-sm"
          placeholder="Search items near you (e.g. camera, bike, car, drill)..."
        />
        <button
          type="submit"
          className="ml-2 bg-bright hover:scale-[1.02] active:scale-95 text-app font-bold px-5 py-2 rounded-xl text-sm transition-all cursor-pointer shrink-0"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default ExploreSearchBar;
