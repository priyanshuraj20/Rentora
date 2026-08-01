export default function StatsCard({ title, value, badge, icon }) {
  return (
    <div className="rounded-2xl p-6 bg-surface border-1 border-app/80 hover:border-bright/40 transition-all">
      <div className="flex justify-between items-start">
        <div className={"p-2 rounded-lg bg-bright/10"}>
          <span className={"material-symbols-outlined text-bright"}>
            {icon}
          </span>
        </div>

        {badge && (
          <span className="text-bright text-[10px] font-bold px-2 py-1 bg-bright/10 rounded-full uppercase">
            {badge}
          </span>
        )}
      </div>

      <p className="text-text-secondary text-xs uppercase tracking-wider mt-6">
        {title}
      </p>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}
