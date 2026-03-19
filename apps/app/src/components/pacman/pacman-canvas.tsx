"use client";

import { useQuests } from "./quest-store";
import { PacManTodoList } from "./todo-list";

export function PacManCanvas() {
  const { quests, setQuests } = useQuests();

  return (
    <div className="h-full overflow-y-auto relative">
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
