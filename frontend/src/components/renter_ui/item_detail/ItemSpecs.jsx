const ItemSpecs = ({ specs }) => {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {specs.map((spec, i) => (
        <div
          key={i}
          className="rounded-xl border-1 border-app bg-surface p-4"
        >
          <p className="text-xs text-text-secondary">{spec.label}</p>
          <p className="font-bold mt-1">{spec.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ItemSpecs;
