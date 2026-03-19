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

  // Stable quest numbers based on order in the full list
  const questNumbers = new Map(todos.map((t, i) => [t.id, i + 1]));

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
      title: "Explore the haunted maze corridors",
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
          <div className="relative w-14 h-14">
            <div
              className="absolute inset-0 rounded-full bg-[#ffff00]"
              style={{
                clipPath: "polygon(100% 74%, 44% 48%, 100% 22%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)",
                animation: "pacman-chomp 0.35s ease-in-out infinite",
              }}
            />
            {/* Eye */}
            <div
              className="absolute rounded-full bg-black"
              style={{ width: "20%", height: "20%", top: "15%", left: "45%" }}
            />
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-[#ffb8ae]"
                style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.15}s infinite` }}
              />
            ))}
          </div>
        </div>
        <p className="text-[#ffff00] font-bold text-xl tracking-wider mt-4">NO QUESTS YET</p>
        <p className="text-[#66d4f0] text-sm tracking-wider">START YOUR ADVENTURE</p>
        <button
          onClick={addTodo}
          className="mt-2 px-6 py-3 text-base font-bold tracking-wider rounded-lg cursor-pointer transition-all text-black bg-[#ffff00] hover:bg-[#ffb852] hover:shadow-[0_0_15px_rgba(255,255,0,0.5)] disabled:opacity-50"
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
        questNumbers={questNumbers}
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
        title="HERO COMPLETED"
        todos={completedTodos}
        questNumbers={questNumbers}
        emptyMessage="No completed quests yet"
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
