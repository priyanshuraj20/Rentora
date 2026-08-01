export default function ActivityTimeline({ timeline }) {
  return (
    <div className="bg-surface border-1 border-app/80 rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase mb-6">Activity Timeline</h3>

      <div className="space-y-6 relative">
        {timeline.map((item, index) => (
          <div key={item.id} className="flex gap-4 relative">
            {/* Vertical Line Connecting Items */}
            {index !== timeline.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-divider" />
            )}
            
            <div className="size-6 rounded-full bg-accent flex items-center justify-center shrink-0 z-10 ring-4 ring-surface">
              <span className="material-symbols-outlined text-xs">check</span>
            </div>
            <div>
              <p className="font-extrabold">{item.title}</p>
              <p className="text-xs text-text-secondary">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
