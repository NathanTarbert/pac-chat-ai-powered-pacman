"use client";

import { PacManTodoColumn } from "./todo-column";

interface Todo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "pending" | "completed";
}

interface PacManTodoListProps {
  todos: Todo[];
  onUpdate: (todos: Todo[]) => void;
  isAgentRunning: boolean;
}

export function PacManTodoList({ todos, onUpdate, isAgentRunning }: PacManTodoListProps) {
  const pendingTodos = todos.filter((t) => t.status === "pending");
  const completedTodos = todos.filter((t) => t.status === "completed");

  const toggleStatus = (todo: Todo) => {
    const updated = todos.map((t) =>
      t.id === todo.id
        ? { ...t, status: (t.status === "completed" ? "pending" : "completed") as "pending" | "completed" }
        : t
    );
    onUpdate(updated);
  };

  const deleteTodo = (todo: Todo) => {
    onUpdate(todos.filter((t) => t.id !== todo.id));
  };

  const updateTitle = (todoId: string, title: string) => {
    onUpdate(todos.map((t) => (t.id === todoId ? { ...t, title } : t)));
  };

  const updateDescription = (todoId: string, description: string) => {
    onUpdate(todos.map((t) => (t.id === todoId ? { ...t, description } : t)));
  };

  const addTodo = () => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: "New Quest",
      description: "Describe your mission",
      emoji: "🟡",
      status: "pending",
    };
    onUpdate([...todos, newTodo]);
  };

  if (!todos || todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {/* Pac-Man eating dots animation */}
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-full bg-[#ffff00]"
            style={{ animation: "waka 0.4s ease-in-out infinite" }}
          />
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#ffb8ae]"
                style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        </div>
        <p className="text-[#ffff00] font-bold text-lg tracking-wider mt-4">NO QUESTS YET</p>
        <p className="text-[#33b5e5] text-xs tracking-wider">START YOUR ADVENTURE</p>
        <button
          onClick={addTodo}
          className="mt-2 px-6 py-2.5 text-sm font-bold tracking-wider rounded-lg cursor-pointer transition-all text-black bg-[#ffff00] hover:bg-[#ffb852] hover:shadow-[0_0_15px_rgba(255,255,0,0.5)] disabled:opacity-50"
          aria-label="Add your first quest"
          disabled={isAgentRunning}
        >
          INSERT COIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-8 h-full">
      <PacManTodoColumn
        title="ACTIVE QUESTS"
        todos={pendingTodos}
        emptyMessage="No active quests"
        showAddButton
        onAddTodo={addTodo}
        onToggleStatus={toggleStatus}
        onDelete={deleteTodo}
        onUpdateTitle={updateTitle}
        onUpdateDescription={updateDescription}
        isAgentRunning={isAgentRunning}
        ghostColor="#ff0000"
      />
      <PacManTodoColumn
        title="CLEARED"
        todos={completedTodos}
        emptyMessage="No cleared quests yet"
        onToggleStatus={toggleStatus}
        onDelete={deleteTodo}
        onUpdateTitle={updateTitle}
        onUpdateDescription={updateDescription}
        isAgentRunning={isAgentRunning}
        ghostColor="#33b5e5"
      />
    </div>
  );
}
