import { Link } from "react-router-dom";
export default function QuickActions({ actions }) {
  return (
    <div className="p-6 bg-surface rounded-2xl border border-app/80">
      <h3 className="text-xl font-bold mb-6">Quick Actions</h3>

      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link to={`/${action.to}`} key={action.id}>
            <button
              className="w-full flex justify-between items-center p-4 bg-accent/20 hover:bg-accent/40 border border-divider/50 rounded-2xl transition-all group hover:cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-bright group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="font-semibold text-text-primary">{action.label}</span>
              </div>
              <span className="material-symbols-outlined text-text-secondary group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </Link>

        ))}
      </div>
    </div>
  );
}