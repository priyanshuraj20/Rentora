import React from "react";

const StatsCard = ({ title, value, desc, icon }) => {
  return (
    <div className="bg-surface border border-divider rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-text-muted text-xs tracking-wider uppercase font-semibold">
            {title}
          </p>
          {icon && (
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
          )}
        </div>
        <h3 className="text-3xl font-extrabold text-text-primary mt-2">
          {value}
        </h3>
      </div>
      {desc && (
        <p className="text-[11px] text-text-secondary mt-2.5 leading-relaxed border-t border-divider/50 pt-2">
          {desc}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
