import { Search, SlidersHorizontal } from "lucide-react";

export default function SearchBar({ search, setSearch }) {
    return (
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card border border-gray-800 rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-bright transition-all font-medium"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white border-l border-gray-800 transition-colors">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                </button>
            </div>
        </div>
    );
}