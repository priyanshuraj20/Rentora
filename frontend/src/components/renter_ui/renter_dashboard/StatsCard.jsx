export default function StatsCard({ title, value, badge, icon }) {
  return (
    <div className="rounded-2xl p-6 bg-surface border border-divider hover:border-primary/40 transition-all duration-300 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
        </div>

        {badge && (
          <span className="text-primary text-[10px] font-bold px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mt-6">
        {title}
      </p>
      <p className="text-3xl font-extrabold text-text-primary mt-1">{value}</p>
    </div>
  );
}
