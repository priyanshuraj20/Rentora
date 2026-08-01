export default function RentalPolicies({ policies }) {
  return (
    <div className="bg-surface border-1 border-app/80 rounded-2xl p-6">
      <h3 className="text-sm font-bold uppercase mb-4">Rental Policies</h3>

      {policies.map((policy) => (
        <div key={policy.title} className="flex gap-3 mb-4">
          <span className="material-symbols-outlined text-text-secondary">
            {policy.icon}
          </span>
          <div>
            <p className="text-xs font-bold">{policy.title}</p>
            <p className="text-[11px] text-text-secondary">{policy.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
