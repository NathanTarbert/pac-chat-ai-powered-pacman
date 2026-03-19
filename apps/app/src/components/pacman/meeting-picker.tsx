"use client";

import { useState } from "react";
import { useHITL } from "./hitl-store";
import { useCalendar } from "./calendar/calendar-store";

function GhostIcon({ color, size = 35 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "ghost-float 2s ease-in-out infinite" }}>
      <path d="M4 22V12C4 7.58 7.58 4 12 4s8 3.58 8 8v10l-2.5-2.5L15 22l-3-3-3 3-2.5-2.5L4 22z" fill={color} />
      <circle cx="9" cy="11" r="2" fill="white" />
      <circle cx="15" cy="11" r="2" fill="white" />
      <circle cx="9.5" cy="11.5" r="1" fill="#111" />
      <circle cx="15.5" cy="11.5" r="1" fill="#111" />
    </svg>
  );
}

const inputClass =
  "w-full px-3 py-2 bg-[#0a0a1a] border-2 border-[#2121de] rounded-lg text-[#ffff00] text-base focus:outline-none focus:border-[#33b5e5] focus:shadow-[0_0_10px_rgba(33,33,222,0.5)] transition-all placeholder-[#2121de]/60";
const labelClass = "block text-[11px] font-bold tracking-widest text-[#66d4f0] mb-1.5";

/**
 * Inline HITL meeting form rendered in the chat.
 * Phases: form → confirm → done/cancelled
 */
export function InlineMeetingForm() {
  const { state, submitForm, confirm, cancel } = useHITL();
  const { addEvent } = useCalendar();

  // Local form inputs
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(
    state.pending?.meetingDuration?.toString() || "30"
  );

  const canSubmit = name.trim() && date && time;
  const reason = state.pending?.reasonForScheduling || "SCHEDULE MEETING";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitForm({
      name: name.trim(),
      date,
      time,
      duration: parseInt(duration, 10),
    });
  };

  const handleConfirm = () => {
    // Add event to calendar
    if (state.formData) {
      addEvent({
        title: state.formData.name,
        date: state.formData.date,
        startTime: state.formData.time,
        durationMinutes: state.formData.duration,
      });
    }
    confirm();
  };

  // ─── Phase: Form ───
  if (state.phase === "form") {
    return (
      <div
        className="rounded-lg w-full border-2 border-[#2121de] bg-black overflow-hidden mb-4 animate-[score-pop_0.3s_ease-out]"
        style={{ animation: "maze-glow 3s ease-in-out infinite" }}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <GhostIcon color="#ffb852" size={26} />
            <div>
              <h3 className="text-[#ffff00] font-bold text-sm tracking-widest">
                {reason.toUpperCase()}
              </h3>
              <p className="text-[#66d4f0] text-[10px] tracking-widest">FILL IN THE DETAILS</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={labelClass}>QUEST NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CopilotKit Demo"
                className={inputClass}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className={labelClass}>DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>TIME</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>DURATION</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={inputClass}
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 px-5 py-2 rounded-lg font-bold text-sm tracking-widest text-black bg-[#ffff00] hover:bg-[#ffb852] hover:shadow-[0_0_15px_rgba(255,255,0,0.4)] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
              <button
                type="button"
                onClick={cancel}
                className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-[#ff0000] border border-[#ff0000]/30 hover:border-[#ff0000] hover:bg-[#ff0000]/10 transition-all cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── Phase: Confirm ───
  if (state.phase === "confirm" && state.formData) {
    const d = state.formData;
    return (
      <div
        className="rounded-lg w-full border-2 border-[#ffb852] bg-black overflow-hidden mb-4 animate-[score-pop_0.3s_ease-out]"
        style={{ boxShadow: "0 0 15px rgba(255,184,82,0.3)" }}
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <GhostIcon color="#ffb852" size={26} />
            <h3 className="text-[#ffb852] font-bold text-sm tracking-widest">CONFIRM QUEST</h3>
          </div>

          <div className="space-y-2 mb-4 p-3 rounded-lg bg-[#1a1a2e] border border-[#2121de]">
            <div className="flex justify-between text-sm">
              <span className="text-[#66d4f0] tracking-wider">NAME</span>
              <span className="text-[#ffff00] font-bold">{d.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#66d4f0] tracking-wider">DATE</span>
              <span className="text-[#ffff00] font-bold">{d.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#66d4f0] tracking-wider">TIME</span>
              <span className="text-[#ffff00] font-bold">{d.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#66d4f0] tracking-wider">DURATION</span>
              <span className="text-[#ffff00] font-bold">{d.duration} min</span>
            </div>
          </div>

          <p className="text-[11px] text-[#ffb852] tracking-wider text-center mb-3">
            ADD THIS QUEST TO YOUR CALENDAR?
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 px-5 py-2 rounded-lg font-bold text-sm tracking-widest text-black bg-[#ffff00] hover:bg-[#ffb852] hover:shadow-[0_0_15px_rgba(255,255,0,0.4)] transition-all cursor-pointer"
            >
              CONFIRM
            </button>
            <button
              onClick={cancel}
              className="px-5 py-2 rounded-lg font-bold text-[11px] tracking-widest text-[#ff0000] border border-[#ff0000]/30 hover:border-[#ff0000] hover:bg-[#ff0000]/10 transition-all cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Phase: Done ───
  if (state.phase === "done" && state.formData) {
    return (
      <div className="rounded-lg w-full border-2 border-[#33b679] bg-black overflow-hidden mb-4 animate-[score-pop_0.3s_ease-out]">
        <div className="p-5 text-center">
          <div className="flex justify-center mb-2">
            <GhostIcon color="#33b5e5" size={31} />
          </div>
          <h3 className="text-[#ffff00] font-bold text-base tracking-widest mb-2">QUEST SCHEDULED!</h3>
          <p className="text-[#66d4f0] text-sm tracking-wider">{state.formData.name}</p>
          <p className="text-[#ffd0c8] text-sm tracking-wider">
            {state.formData.date} @ {state.formData.time}
          </p>
          <div className="flex justify-center mt-2">
            <span className="text-[#ffff00] font-bold text-sm animate-[score-pop_0.3s_ease-out]">+500 PTS</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Phase: Cancelled ───
  if (state.phase === "cancelled") {
    return (
      <div className="rounded-lg w-full border-2 border-[#ff0000]/30 bg-black overflow-hidden mb-4">
        <div className="p-5 text-center">
          <div className="flex justify-center mb-2">
            <GhostIcon color="#ff0000" size={31} />
          </div>
          <h3 className="text-[#ff0000] font-bold text-base tracking-widest">CANCELLED</h3>
          <p className="text-[#66d4f0] text-sm tracking-wider mt-1">Maybe next time...</p>
        </div>
      </div>
    );
  }

  return null;
}
