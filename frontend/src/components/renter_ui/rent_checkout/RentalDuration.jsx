export default function RentalDuration({ startDate, endDate }) {
  return (
    <div className="bg-surface rounded-xl p-6">
      <h4 className="text-lg font-bold mb-4">Rental Duration</h4>

      <div className="flex justify-between text-sm opacity-80">
        <div>
          <p>Check-in</p>
          <p className="text-text-secondary">{startDate?.toDateString() || "--"}</p>
        </div>
        <div>
          <p>Check-out</p>
          <p className="text-text-secondary">{endDate?.toDateString() || "--"}</p>
        </div>
      </div>
    </div>
  );
}
