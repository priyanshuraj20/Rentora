export default function Breadcrumbs() {
  return (
    <div className="flex items-center gap-2 text-text-secondary text-sm">
      <span>My Rentals</span>
      <span className="material-symbols-outlined text-sm">chevron_right</span>
      <span className="text-text-primary font-bold">
        Agreement Details
      </span>
    </div>
  );
}
