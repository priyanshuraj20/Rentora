const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-surface border border-divider rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 shadow-sm">
      <p className="text-text-muted text-xs tracking-wider uppercase font-semibold">
        {title}
      </p>
      <h3 className="text-3xl font-extrabold text-text-primary mt-2">
        {value}
      </h3>
    </div>
  );
};

export default StatsCard;