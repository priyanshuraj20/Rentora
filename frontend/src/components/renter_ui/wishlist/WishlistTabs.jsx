export default function WishlistTabs({ activeTab, onChange }) {
  return (
    <div className="flex gap-6 border-b border-divider mb-8">
      <button
        onClick={() => onChange("all")}
        className={`pb-3 text-sm border-b-5 cursor-pointer ${
          activeTab === "all"
            ? "text-bright border-bright"
            : "text-text-secondary border-app"
        }`}
      >
        All Saved
      </button>

      <button
        onClick={() => onChange("available")}
        className={`pb-3 text-sm cursor-pointer border-b-5 ${
          activeTab === "available"
            ? "text-bright border-bright"
            : "text-text-secondary border-app"
        }`}
      >
        Available Now
      </button>
    </div>
  );
}
