import Skeleton from "../../common/Skeleton";

const ExploreSkeleton = () => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-divider bg-card shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
      {/* Image Skeleton */}
      <div className="px-3 pt-3">
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pb-4 pt-4">
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
