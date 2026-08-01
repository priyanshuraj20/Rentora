import { useState } from "react";
import CalendarMonth from "./CalendarMonth";
import { ChevronLeft, ChevronRight, X,Calendar } from "lucide-react";


export default function RentalCalendar({ disabledDates = [], onSelect }) {
    const [range, setRange] = useState({ start: null, end: null });
    const [baseDate, setBaseDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    function addMonths(date, amount) {
        return new Date(date.getFullYear(), date.getMonth() + amount, 1);
    }

    function handleDateClick(date) {
        if (!range.start || (range.start && range.end)) {
            setRange({ start: date, end: null });
        } else {
            if (date < range.start) {
                setRange({ start: date, end: null });
                if (onSelect) onSelect(date, null);
                return;
            }

            const updated = { ...range, end: date };
            setRange(updated);
            onSelect(updated.start, date);
        }
    }

    return (
        <div className="bg-surface rounded-xl p-6 border-1 border-app/80">
            <div className="flex text-xl items-center justify-between mb-5">
                <div className="flex gap-2"><Calendar className="text-bright"/><h3 className="font-black">Select Rental Dates</h3></div>
                
                <div className="flex items-center gap-2">



                    <X
                        onClick={() => {
                            setRange({ start: null, end: null });
                            if (onSelect) onSelect(null, null);
                        }}
                    />

                </div>
            </div>

            <div className="flex items-center gap-3 w-full mb-4">
                <button
                    type="button"
                    className="p-2 hover:text-white/65 inline-flex items-center justify-center justify-self-start "
                    onClick={() => setBaseDate(addMonths(baseDate, -1))}
                    aria-label="Previous month"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center justify-between w-full text-md font-semibold">
                    <span className="w-1/2 text-center">
                        {baseDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric"
                        })}
                    </span>
                    <span className="w-1/2 text-center">
                        {addMonths(baseDate, 1).toLocaleString("default", {
                            month: "long",
                            year: "numeric"
                        })}
                    </span>
                </div>
                <button
                    type="button"
                    className="p-2 hover:text-white/65 inline-flex items-center justify-center justify-self-end"
                    onClick={() => setBaseDate(addMonths(baseDate, 1))}
                    aria-label="Next month"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <CalendarMonth
                    year={baseDate.getFullYear()}
                    month={baseDate.getMonth()}
                    range={range}
                    disabledDates={disabledDates}
                    onDateClick={handleDateClick}
                />
                <CalendarMonth
                    year={addMonths(baseDate, 1).getFullYear()}
                    month={addMonths(baseDate, 1).getMonth()}
                    range={range}
                    disabledDates={disabledDates}
                    onDateClick={handleDateClick}
                />
            </div>
        </div>
    );
}
