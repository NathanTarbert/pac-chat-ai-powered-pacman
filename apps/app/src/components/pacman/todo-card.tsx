"use client";

import { useState, useRef, useEffect } from "react";

interface Todo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "pending" | "completed";
}

interface PacManTodoCardProps {
  todo: Todo;
  questNumber: number;
  onToggleStatus: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onUpdateTitle: (todoId: string, title: string) => void;
  onUpdateDescription: (todoId: string, description: string) => void;
}

export function PacManTodoCard({
  todo,
  questNumber,
  onToggleStatus,
  onDelete,
  onUpdateTitle,
  onUpdateDescription,
}: PacManTodoCardProps) {
  const [editingField, setEditingField] = useState<"title" | "description" | null>(null);
  const [editValue, setEditValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isCompleted = todo.status === "completed";
  const truncatedDescription =
    todo.description.length > 120 ? todo.description.slice(0, 120) + "..." : todo.description;

  const startEdit = (field: "title" | "description") => {
    setEditingField(field);
    setEditValue(field === "title" ? todo.title : todo.description);
  };

  const saveEdit = (field: "title" | "description") => {
    if (editValue.trim()) {
      if (field === "title") onUpdateTitle(todo.id, editValue.trim());
      else onUpdateDescription(todo.id, editValue.trim());
    }
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editValue]);

  return (
    <div
      className={`group relative rounded-lg p-4 transition-all duration-150 border-2 animate-[score-pop_0.3s_ease-out] ${
        isCompleted
          ? "bg-[#0a0a1a] border-[#1a3a1a] opacity-80"
          : "bg-[#1a1a2e] border-[#2121de] hover:shadow-[0_0_15px_rgba(33,33,222,0.4)]"
      }`}
      style={!isCompleted ? { animation: "maze-glow 4s ease-in-out infinite" } : undefined}
    >
      {/* Delete button */}
      <button
        onClick={() => onDelete(todo)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-100 cursor-pointer rounded p-1 text-[#ff0000] hover:text-[#ffb8ae] hover:bg-[#2121de]/30"
        aria-label="Delete quest"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        {/* Pac-dot checkbox */}
        <button
          onClick={() => onToggleStatus(todo)}
          className="flex-shrink-0 mt-0.5 cursor-pointer transition-transform hover:scale-110"
          aria-label={isCompleted ? "Mark as active" : "Mark as cleared"}
        >
          {isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-[#ffff00] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12l4 4 8-8" />
              </svg>
            </div>
          ) : (
            <div
              className="w-5 h-5 rounded-full border-2 border-[#ffb8ae] bg-transparent"
              style={{ animation: "power-pellet 2s ease-in-out infinite" }}
            />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editingField === "title" ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit("title")}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit("title");
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-full text-sm font-bold tracking-wider focus:outline-none bg-transparent text-[#ffff00] border-b border-[#ffff00] pb-0.5"
              autoFocus
              aria-label="Edit quest title"
            />
          ) : (
            <div
              onClick={() => startEdit("title")}
              className={`text-sm font-bold tracking-wider cursor-text break-words leading-snug ${
                isCompleted ? "text-[#ffff00] opacity-60 line-through" : "text-[#ffff00]"
              }`}
            >
              #{questNumber} {todo.title}
            </div>
          )}

          {editingField === "description" ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => saveEdit("description")}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-full mt-1 text-xs leading-relaxed focus:outline-none resize-none bg-transparent text-[#66d4f0] border-b border-[#33b5e5] pb-0.5"
              rows={1}
              autoFocus
              aria-label="Edit quest description"
            />
          ) : (
            <p
              onClick={() => startEdit("description")}
              className={`mt-1 text-xs leading-relaxed cursor-text tracking-wide ${
                isCompleted ? "text-[#88aaff] line-through" : "text-[#66d4f0]"
              }`}
            >
              {truncatedDescription}
            </p>
          )}

          {/* Point value decoration */}
          <div className="flex items-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[#ffb8ae] opacity-40" />
            ))}
            <span className="text-[9px] text-[#ffd0c8] opacity-60 ml-1 tracking-widest">
              {isCompleted ? "200 PTS" : "100 PTS"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
