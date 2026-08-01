const ExploreLoadMore = ({ loading, onLoadMore }) => {
  if (loading) return null;

  return (
    <div className="mt-16 flex justify-center">
      <button
        onClick={onLoadMore}
        className="rounded-xl border-1 border-divider bg-surface px-10 py-3 text-sm font-bold"
      >
        Load More
      </button>
    </div>
  );
};

export default ExploreLoadMore;
