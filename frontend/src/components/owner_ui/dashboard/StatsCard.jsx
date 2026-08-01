const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-surface border border-app/80 rounded-2xl p-8 hover:border-bright/60 transition-all">
      <p className="text-text-secondary text-xs tracking-wider uppercase ">
        {title}
      </p>
      <h3 className="text-4xl font-black">
        {value}
      </h3>
    </div>
  );
};



export default StatsCard;