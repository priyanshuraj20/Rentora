export default function RentalsTabs({ activeTab, onChange, counts }) {
  const tabs = [
    { key: "active", label: "Active", count: counts.active },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="mb-8 border-b border-divider">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative pb-3 flex items-center gap-2 cursor-pointer"
          >
            <span
              className={`font-semibold text-xs ${
                activeTab === tab.key
                  ? "text-text-primary font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </span>

            {tab.count !== undefined && (
              <span className="bg-primary text-text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}

            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
