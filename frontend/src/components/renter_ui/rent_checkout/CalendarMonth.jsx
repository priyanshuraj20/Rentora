export default function CalendarMonth({
  year,
  month,
  range,
  disabledDates,
  onDateClick
}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekDays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  function isSelected(day) {
    const d = new Date(year, month, day);
    if (!range.start) return false;
    if (range.start && !range.end)
      return d.getTime() === range.start.getTime();
    return d >= range.start && d <= range.end;
  }

  function isStart(day) {
    if (!range.start) return false;
    const d = new Date(year, month, day);
    return d.getTime() === range.start.getTime();
  }

  function isEnd(day) {
    if (!range.end) return false;
    const d = new Date(year, month, day);
    return d.getTime() === range.end.getTime();
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-center text-[11px] tracking-widest text-white/60 mb-5">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-2 gap-x-0 text-center text-xs">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const currentDate = new Date(year, month, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const isPast = currentDate < today;
          
          const isDisabled = isPast || disabledDates.some(d => {
            const blocked = new Date(d);
            blocked.setHours(0, 0, 0, 0);
            const cur = new Date(year, month, day);
            cur.setHours(0, 0, 0, 0);
            return blocked.getTime() === cur.getTime();
          });

          const selected = isSelected(day);
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = selected && !(start || end);

          return (
            <button
              key={day}
              onClick={isDisabled ? undefined : () => onDateClick(currentDate)}
              disabled={isDisabled}
              className={`py-2 transition text-sm
                ${isDisabled ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"}
                ${selected && !isDisabled ? "bg-bright text-white" : ""}
                ${inRange ? "bg-bright/30 text-white" : ""}
                ${start ? "rounded-l-md" : ""}
                ${end ? "rounded-r-md" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
