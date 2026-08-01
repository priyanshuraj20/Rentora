import React from 'react';

const BookingTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'active', label: 'Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'history', label: 'History' }
  ];

  return (
    <div className="flex items-center gap-8 border-b border-divider/30 mb-8 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-4 text-sm font-semibold transition-all relative min-w-fit cursor-pointer ${
            activeTab === tab.id
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-bright rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default BookingTabs;
