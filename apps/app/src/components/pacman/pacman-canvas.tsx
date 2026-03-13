"use client";

import { useQuests } from "./quest-store";
import { PacManTodoList } from "./todo-list";

export function PacManCanvas() {
  const { quests, setQuests } = useQuests();

  return (
    <div className="h-full overflow-y-auto bg-black relative">
      {/* Maze-style background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2121de 1px, transparent 1px),
            linear-gradient(to bottom, #2121de 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, #ffb8ae 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "12px 12px",
        }}
      />
      <div className="relative max-w-4xl mx-auto px-8 py-10 h-full">
        <PacManTodoList
          todos={quests}
          onUpdate={setQuests}
          isAgentRunning={false}
        />
      </div>
    </div>
  );
}
