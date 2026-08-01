import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ExplorePagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-white" />
      </button>

      <div className="flex items-center gap-1 mx-2">
        {visiblePages.map((p, index) => (
          <React.Fragment key={index}>
            {p === "..." ? (
              <span className="w-8 flex justify-center text-gray-400 font-bold">...</span>
            ) : (
              <button
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all hover:cursor-pointer ${
                  currentPage === p
                    ? "bg-bright text-app"
                    : "text-gray-600 hover:text-white"
                }`}
              >
                {p}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
        aria-label="Next Page"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 hover:text-white" />
      </button>
    </div>
  );
};

export default React.memo(ExplorePagination);
