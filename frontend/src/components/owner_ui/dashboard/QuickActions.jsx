import { Link } from "react-router-dom";

export default function QuickActions({ actions }) {
  return (
    <div className="p-6 bg-surface rounded-3xl border border-divider shadow-sm">
      <h3 className="text-base font-bold text-text-primary mb-5">Quick Actions</h3>

      <div className="flex flex-col gap-2.5">
        {actions.map((action) => (
          <Link to={`/${action.to}`} key={action.id}>
            <button
              className="w-full flex justify-between items-center p-3.5 bg-card hover:bg-white/5 border border-divider rounded-2xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl">
                  {action.icon}
                </span>
                <span className="font-semibold text-xs text-text-primary group-hover:text-primary transition-colors">{action.label}</span>
              </div>
              <span className="material-symbols-outlined text-text-muted text-lg group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}