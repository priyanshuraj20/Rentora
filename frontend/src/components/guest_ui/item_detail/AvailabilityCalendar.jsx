import { useState } from "react";
import AuthController from "../../auth/AuthController";

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AvailabilityCalendar({ unavailableDates = [] }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11); setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0); setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  return (
    <div className="bg-card border border-divider rounded-[24px] p-6 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-text-primary">Availability</h4>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <button onClick={goPrevMonth} className="hover:text-primary transition p-1">‹</button>
          <span className="font-bold min-w-[100px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={goNextMonth} className="hover:text-primary transition p-1">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-[10px] font-black text-text-muted py-2 tracking-widest">{d}</div>
        ))}
        {[...Array(startOffset)].map((_, i) => <div key={`e-${i}`} />)}
        {[...Array(lastDate)].map((_, i) => {
          const date = i + 1;
          const isUnavailable = unavailableDates.some(d => {
            const dateObj = new Date(d);
            return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === date;
          });
          const isPast = year === today.getFullYear() && month === today.getMonth() && date < today.getDate();

          return (
            <div
              key={date}
              className={`
                p-2 text-xs rounded-xl transition font-bold
                ${isUnavailable || isPast
                  ? "text-text-muted opacity-30 line-through cursor-not-allowed"
                  : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-app cursor-pointer"
                }
              `}
            >
              {date}
            </div>
          );
        })}
      </div>

      <button
        disabled
        className="w-full mt-4 py-4 bg-surface text-text-muted font-black rounded-full cursor-not-allowed border border-white/5"
      >
        Book Now
      </button>

      <p className="text-xs text-center text-text-muted font-medium leading-relaxed">
        <button className="text-primary hover:underline cursor-pointer font-bold"
          onClick={() => {
            setAuthMode("login");
            setAuthOpen(true);
          }}>
          Sign in
        </button>{" "}
        to check specific dates and book this gear.
      </p>

      <AuthController open={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
    </div>
  );
}
