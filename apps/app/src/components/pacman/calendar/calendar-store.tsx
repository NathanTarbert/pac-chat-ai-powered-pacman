"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  durationMinutes: number;
  color?: string;
}

interface CalendarStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  removeEvent: (id: string) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
}

const CalendarContext = createContext<CalendarStore | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const addEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = { ...event, id: crypto.randomUUID() };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <CalendarContext.Provider value={{ events, addEvent, removeEvent, selectedDate, setSelectedDate }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
