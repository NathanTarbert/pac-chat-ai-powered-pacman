"use client";

import { ReactNode, useState, useEffect, useRef, startTransition } from "react";
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { useHITL } from "./hitl-store";
import { useQuests } from "./quest-store";

type Mode = "chat" | "app" | "calendar";

interface PacManLayoutProps {
  chatContent: ReactNode;
  appContent: ReactNode;
  calendarContent: ReactNode;
}

function PacManToggle({ mode, onModeChange }: { mode: Mode; onModeChange: (m: Mode) => void }) {
  const tabs: { key: Mode; label: string }[] = [
    { key: "chat", label: "CHAT" },
    { key: "app", label: "QUESTS" },
    { key: "calendar", label: "CALENDAR" },
  ];

  return (
    <div className="fixed top-3 right-3 z-50 flex rounded-lg border-2 border-[#2121de] bg-black p-0.5 max-lg:top-2 max-lg:right-2 max-lg:scale-90">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onModeChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
            mode === tab.key
              ? "bg-[#ffff00] text-black shadow-[0_0_10px_rgba(255,255,0,0.4)]"
              : "text-[#5555ff] hover:text-[#66d4f0]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function PacManLayout({ chatContent, appContent, calendarContent }: PacManLayoutProps) {
  const [mode, setMode] = useState<Mode>("chat");
  const { quests } = useQuests();
  const { state: hitlState } = useHITL();
  const prevTodoCountRef = useRef(0);

  // Auto-open quests panel when a new quest is added
  useEffect(() => {
    const currentCount = quests.length;
    if (currentCount > prevTodoCountRef.current && prevTodoCountRef.current >= 0) {
      startTransition(() => setMode("app"));
    }
    prevTodoCountRef.current = currentCount;
  }, [quests]);

  // Auto-open calendar when a meeting is confirmed via HITL
  useEffect(() => {
    if (hitlState.phase === "done") {
      startTransition(() => setMode("calendar"));
    }
  }, [hitlState.phase]);

  // Shared state: agent can switch modes
  useFrontendTool({
    name: "enableAppMode",
    description: "Enable app mode to show the quests panel. Always call this before managing quests.",
    parameters: z.object({}),
    handler: async () => {
      setMode("app");
    },
  });

  useFrontendTool({
    name: "enableChatMode",
    description: "Enable chat mode to show the chat panel.",
    parameters: z.object({}),
    handler: async () => {
      setMode("chat");
    },
  });

  useFrontendTool({
    name: "enableCalendarMode",
    description: "Enable calendar mode to show the calendar view.",
    parameters: z.object({}),
    handler: async () => {
      setMode("calendar");
    },
  });

  const showPanel = mode === "app" || mode === "calendar";

  return (
    <div className="h-full flex flex-row bg-black relative">
      {/* Maze-style grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2121de 1px, transparent 1px),
            linear-gradient(to bottom, #2121de 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: "radial-gradient(circle, #ffb8ae 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "12px 12px",
        }}
      />

      <PacManToggle mode={mode} onModeChange={setMode} />

      {/* Maze borders */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-[#2121de] z-40" />
      <div className="fixed bottom-0 left-0 right-0 h-0.5 bg-[#2121de] z-40" />

      {/* Chat */}
      <div
        className={`max-h-full overflow-y-auto transition-all duration-300 ${
          showPanel ? "w-1/3 max-lg:hidden" : "flex-1 max-lg:px-0"
        }`}
      >
        {chatContent}
      </div>

      {/* Right panel (quests or calendar) */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ${
          showPanel
            ? "w-2/3 max-lg:w-full border-l-2 border-[#2121de] max-lg:border-l-0"
            : "w-0 border-l-0"
        }`}
      >
        <div className="w-full lg:w-[66.666vw] h-full">
          {mode === "calendar" ? calendarContent : appContent}
        </div>
      </div>
    </div>
  );
}
