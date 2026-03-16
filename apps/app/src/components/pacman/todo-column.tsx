"use client";

import { PacManTodoCard } from "./todo-card";

interface Todo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "pending" | "completed";
}

interface PacManTodoColumnProps {
  title: string;
  todos: Todo[];
  questNumbers: Map<string, number>;
  emptyMessage: string;
  showAddButton?: boolean;
  onAddTodo?: () => void;
  onToggleStatus: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onUpdateTitle: (todoId: string, title: string) => void;
  onUpdateDescription: (todoId: string, description: string) => void;
  isAgentRunning: boolean;
  ghostColor: string;
}

function GhostSmall({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "ghost-float 2s ease-in-out infinite" }}>
      <path d="M4 22V12C4 7.58 7.58 4 12 4s8 3.58 8 8v10l-2.5-2.5L15 22l-3-3-3 3-2.5-2.5L4 22z" fill={color} />
      <circle cx="9" cy="11" r="1.5" fill="white" />
      <circle cx="15" cy="11" r="1.5" fill="white" />
      <circle cx="9.5" cy="11.5" r="0.8" fill="#111" />
      <circle cx="15.5" cy="11.5" r="0.8" fill="#111" />
    </svg>
  );
}

export function PacManTodoColumn({
  title,
  todos,
  questNumbers,
  emptyMessage,
  showAddButton = false,
  onAddTodo,
  onToggleStatus,
  onDelete,
  onUpdateTitle,
  onUpdateDescription,
  isAgentRunning,
  ghostColor,
}: PacManTodoColumnProps) {
  return (
    <section aria-label={`${title} column`} className="flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <GhostSmall color={ghostColor} />
          <h2 className="text-sm font-bold tracking-widest text-[#ffff00]">{title}</h2>
          <span
            className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full text-black bg-[#ffff00]"
            style={{ animation: "score-pop 0.3s ease-out" }}
          >
            {String(todos.length).padStart(2, "0")}
          </span>
        </div>
        {showAddButton && onAddTodo && (
          <button
            onClick={onAddTodo}
            className="rounded-lg cursor-pointer transition-all p-1.5 text-[#ffff00] border border-[#2121de] hover:bg-[#2121de] hover:shadow-[0_0_10px_rgba(33,33,222,0.5)]"
            aria-label="Add new quest"
            disabled={isAgentRunning}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center text-xs rounded-lg border-2 border-dashed p-5 min-h-[120px] flex items-center justify-center text-[#5555ff] border-[#2121de] tracking-wider">
            {/* Power pellet in empty state */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-4 h-4 rounded-full bg-[#ffb8ae]"
                style={{ animation: "power-pellet 1.5s ease-in-out infinite" }}
              />
              {emptyMessage.toUpperCase()}
            </div>
          </div>
        ) : (
          todos.map((todo) => (
            <PacManTodoCard
              key={todo.id}
              todo={todo}
              questNumber={questNumbers.get(todo.id) ?? 0}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              onUpdateTitle={onUpdateTitle}
              onUpdateDescription={onUpdateDescription}
            />
          ))
        )}
      </div>
    </section>
  );
}
