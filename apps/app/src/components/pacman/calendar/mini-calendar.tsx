"use client";

import { useMemo, useState } from "react";
import { CalendarEvent } from "./calendar-store";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getCalendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(startOffset).fill(null);

  for (let d = 1; d <= totalDays; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MiniCalendar({ selectedDate, onSelectDate, events }: MiniCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const weeks = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.date));
    return set;
  }, [events]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="select-none">
      {/* Month/year header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#3c4043]">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div className="flex gap-0.5">
          <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-[#70757a] py-0.5">
            {l}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            if (!day) return <div key={di} />;
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const hasEvent = eventDates.has(formatDateKey(day));

            return (
              <button
                key={di}
                onClick={() => onSelectDate(day)}
                className={`relative w-8 h-8 flex items-center justify-center text-xs rounded-full mx-auto cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#1a73e8] text-white"
                    : isToday
                    ? "bg-[#e8f0fe] text-[#1a73e8] font-bold"
                    : "text-[#3c4043] hover:bg-[#f1f3f4]"
                }`}
              >
                {day.getDate()}
                {hasEvent && !isSelected && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a73e8]" />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
