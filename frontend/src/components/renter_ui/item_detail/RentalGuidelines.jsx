const RentalGuidelines = ({ rules }) => {
  return (
    <section className="mt-10 rounded-2xl border-1 border-app bg-surface p-6">
      <h3 className="font-bold mb-4">Rental Guidelines</h3>

      <ul className="space-y-3 text-sm text-text-secondary list-disc list-inside">
        {rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
    </section>
  );
};

export default RentalGuidelines;
