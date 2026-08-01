export default function RentalsTabs({ activeTab, onChange, counts }) {
  const tabs = [
    { key: "active", label: "Active", count: counts.active },
    { key: "upcoming", label: "Upcoming", count: counts.upcoming },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="mb-8 border-b border-divider">
      <div className="flex gap-10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="relative pb-4 flex items-center gap-2"
          >
            <span
              className={`font-bold text-sm ${
                activeTab === tab.key
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {tab.label}
            </span>

            {tab.count !== undefined && (
              <span className="bg-accent text-background-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}

            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 w-full h-[5px] bg-accent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
