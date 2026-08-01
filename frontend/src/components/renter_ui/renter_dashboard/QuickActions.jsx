import { Link } from "react-router-dom";

export default function QuickActions({ actions }) {
  return (
    <div className="p-6 bg-surface rounded-2xl border-1 border-app/80">
      <h3 className="text-lg font-bold mb-6">Quick Actions</h3>

      {actions.map((action) => (
        <Link key={action.id} to={action.to}>
          <button
            className="w-full flex justify-between items-center p-4 bg-accent/20 hover:bg-accent/40 rounded-2xl mb-3"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-bright">
                {action.icon}
              </span>
              <span className="font-semibold">{action.label}</span>
            </div>
            <span className="material-symbols-outlined text-text-secondary">
              chevron_right
            </span>
          </button>
        </Link>
      ))}
    </div>
  );
}
