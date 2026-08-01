import Skeleton from "../../common/Skeleton";

const ExploreSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-divider bg-surface shadow-sm">
      {/* Image Skeleton */}
      <div className="p-3">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>

      {/* Content Skeleton */}
      <div className="px-5 pb-5 pt-2">
        {/* Title + Rating Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-10" />
        </div>

        {/* Subtitle Skeleton */}
        <div className="mt-2">
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Price + Distance Skeleton */}
        <div className="mt-5 flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
};

export default ExploreSkeleton;
