"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useCalendar, CalendarEvent } from "./calendar-store";
import { MiniCalendar } from "./mini-calendar";

// Google Calendar event colors
const EVENT_COLORS = [
  "#039be5", "#7986cb", "#33b679", "#8e24aa",
  "#e67c73", "#f6bf26", "#f4511e", "#0b8043",
  "#3f51b5", "#d50000",
];

function getEventColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length];
}

// Helpers
function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

interface EventBlockProps {
  event: CalendarEvent;
  onRemove: (id: string) => void;
}

function EventBlock({ event, onRemove }: EventBlockProps) {
  const [h, m] = event.startTime.split(":").map(Number);
  const topPx = (h * 60 + m) * (60 / 60); // 1px per minute = 60px per hour
  const heightPx = Math.max(event.durationMinutes, 15);
  const color = event.color || getEventColor(event.id);

  return (
    <div
      className="absolute left-0.5 right-1 rounded-[4px] px-2 py-0.5 overflow-hidden cursor-pointer group text-white text-[11px] leading-tight z-10"
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        backgroundColor: color,
        minHeight: "20px",
      }}
      title={`${event.title}\n${event.startTime} (${event.durationMinutes}min)`}
    >
      <div className="font-medium truncate">{event.title}</div>
      {heightPx >= 30 && (
        <div className="text-[10px] opacity-80 truncate">
          {event.startTime} &middot; {event.durationMinutes}m
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(event.id); }}
        className="absolute top-0.5 right-1 opacity-0 group-hover:opacity-100 text-white/80 hover:text-white text-xs transition-opacity"
        aria-label="Remove event"
      >
        &times;
      </button>
    </div>
  );
}

// Current time red line
function NowLine() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const mins = now.getHours() * 60 + now.getMinutes();
  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${mins}px` }}
    >
      <div className="flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335] -ml-1" />
        <div className="flex-1 h-[2px] bg-[#ea4335]" />
      </div>
    </div>
  );
}

export function GoogleCalendar() {
  const { events, removeEvent, selectedDate, setSelectedDate } = useCalendar();
  const today = useMemo(() => new Date(), []);
  const weekDays = getWeekDays(selectedDate);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scroll to ~8AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60; // 8AM
    }
  }, []);

  const goToday = () => setSelectedDate(new Date());
  const goPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };
  const goNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const headerMonth = MONTH_NAMES[weekDays[0].getMonth()];
  const headerYear = weekDays[0].getFullYear();
  const endMonth = MONTH_NAMES[weekDays[6].getMonth()];
  const monthLabel =
    weekDays[0].getMonth() !== weekDays[6].getMonth()
      ? `${headerMonth} – ${endMonth} ${headerYear}`
      : `${headerMonth} ${headerYear}`;

  return (
    <div className="flex flex-col h-full bg-white text-[#3c4043] font-['Google_Sans',Roboto,Arial,sans-serif]">
      {/* ─── Top toolbar ─── */}
      <div className="flex-shrink-0 flex items-center px-4 h-16 border-b border-[#dadce0]">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] cursor-pointer transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#5f6368">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 ml-1">
          <svg width="36" height="36" viewBox="0 0 36 36" className="flex-shrink-0">
            <rect x="2" y="2" width="32" height="32" rx="4" fill="#4285f4" />
            <text x="18" y="25" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Google Sans,Arial">
              {today.getDate()}
            </text>
          </svg>
          <span className="text-[22px] text-[#3c4043]">Calendar</span>
        </div>

        {/* Nav */}
        <div className="flex items-center gap-1 ml-8">
          <button
            onClick={goToday}
            className="px-4 h-9 rounded-md border border-[#dadce0] text-sm font-medium text-[#3c4043] hover:bg-[#f1f3f4] cursor-pointer transition-colors"
          >
            Today
          </button>
          <button onClick={goPrev} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
          </button>
          <button onClick={goNext} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f1f3f4] cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
          </button>
          <span className="text-[22px] text-[#3c4043] ml-3 whitespace-nowrap">{monthLabel}</span>
        </div>

        {/* View toggle (static, week selected) */}
        <div className="ml-auto flex items-center">
          <div className="flex rounded-md border border-[#dadce0] overflow-hidden">
            {(["Day", "Week", "Month"] as const).map((v) => (
              <button
                key={v}
                className={`px-3 h-9 text-sm font-medium transition-colors cursor-pointer ${
                  v === "Week" ? "bg-[#e8f0fe] text-[#1967d2]" : "text-[#5f6368] hover:bg-[#f1f3f4]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-[256px] flex-shrink-0 border-r border-[#dadce0] p-4 overflow-y-auto">
            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={events}
            />
            {/* Event count summary */}
            <div className="mt-6 px-2">
              <div className="text-xs font-medium text-[#5f6368] uppercase tracking-wider mb-2">Upcoming</div>
              {events.length === 0 ? (
                <p className="text-xs text-[#80868b]">No events scheduled</p>
              ) : (
                <div className="space-y-1.5">
                  {events
                    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
                    .slice(0, 5)
                    .map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color || getEventColor(ev.id) }} />
                        <span className="text-[#3c4043] truncate">{ev.title}</span>
                        <span className="text-[#80868b] flex-shrink-0 ml-auto">{ev.startTime}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main calendar grid */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Day header row */}
          <div className="flex-shrink-0 flex border-b border-[#dadce0]">
            {/* Gutter for time labels */}
            <div className="w-[56px] flex-shrink-0" />
            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              return (
                <div key={day.toISOString()} className="flex-1 text-center py-2">
                  <div className={`text-[11px] font-medium ${isToday ? "text-[#1a73e8]" : "text-[#70757a]"}`}>
                    {DAY_NAMES[day.getDay()]}
                  </div>
                  <div
                    className={`text-[26px] leading-tight mt-0.5 w-[46px] h-[46px] flex items-center justify-center mx-auto rounded-full ${
                      isToday ? "bg-[#1a73e8] text-white" : "text-[#3c4043] hover:bg-[#f1f3f4]"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scrollable time grid */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="relative flex" style={{ height: `${24 * 60}px` }}>
              {/* Time labels gutter */}
              <div className="w-[56px] flex-shrink-0 relative">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute right-2 text-[10px] text-[#70757a] leading-none"
                    style={{ top: `${h * 60 - 5}px` }}
                  >
                    {h > 0 ? formatHour(h) : ""}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const key = formatDateKey(day);
                const dayEvents = eventsByDate[key] || [];
                const isToday = isSameDay(day, today);

                return (
                  <div key={key} className="flex-1 relative border-l border-[#dadce0]">
                    {/* Hour lines */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-[#dadce0]"
                        style={{ top: `${h * 60}px` }}
                      />
                    ))}
                    {/* Half-hour lines */}
                    {HOURS.map((h) => (
                      <div
                        key={`half-${h}`}
                        className="absolute left-0 right-0 border-t border-[#dadce0] border-dashed opacity-40"
                        style={{ top: `${h * 60 + 30}px` }}
                      />
                    ))}

                    {/* Current time indicator */}
                    {isToday && <NowLine />}

                    {/* Events */}
                    {dayEvents.map((ev) => (
                      <EventBlock key={ev.id} event={ev} onRemove={removeEvent} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
