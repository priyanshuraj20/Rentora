export default function InventoryTabs({ activeTab, onTabChange }) {
    const tabs = ["All Items", "Active Items", "Rented Items", "Paused"];

    return (
        <div className="flex items-center gap-6 border-b border-divider">
            {tabs.map((tab) => {
                const id = tab.toLowerCase().replace(" ", "-");
                const isActive = activeTab === id;
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(id)}
                        className={`pb-3 text-xs font-semibold transition-all relative cursor-pointer ${isActive ? "text-text-primary font-bold" : "text-text-secondary hover:text-text-primary"
                            }`}
                    >
                        {tab}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
