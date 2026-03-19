"use client";

import React, { useEffect, useRef } from "react";

interface PacManToolReasoningProps {
  name: string;
  args?: object | unknown;
  status: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  executing: (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full bg-[#ffff00]"
      style={{ animation: "waka 0.4s ease-in-out infinite" }}
    />
  ),
  inProgress: (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full bg-[#ffb852]"
      style={{ animation: "waka 0.4s ease-in-out infinite" }}
    />
  ),
  complete: <span className="text-[#ffff00] text-sm font-bold">+100</span>,
};

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object" && value !== null) return `{${Object.keys(value).length} keys}`;
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

export function PacManToolReasoning({ name, args, status }: PacManToolReasoningProps) {
  const entries = args ? Object.entries(args) : [];
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const toolStatus = status as "complete" | "inProgress" | "executing";

  useEffect(() => {
    if (!detailsRef.current) return;
    detailsRef.current.open = status === "executing";
  }, [status]);

  return (
    <div className="my-2 text-sm">
      {entries.length > 0 ? (
        <details ref={detailsRef} open>
          <summary className="flex items-center gap-2 text-[#66d4f0] cursor-pointer list-none">
            {statusIcon[toolStatus]}
            <span className="font-bold tracking-wider">{name.toUpperCase()}</span>
            <span className="text-[9px] text-[#5555ff]">&#9660;</span>
          </summary>
          <div className="pl-5 mt-1 space-y-0.5 text-[11px] text-[#ffd0c8]">
            {entries.map(([key, value]) => (
              <div key={key} className="flex gap-2 min-w-0">
                <span className="font-bold shrink-0 text-[#ffb852]">{key}:</span>
                <span className="truncate">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <div className="flex items-center gap-2 text-[#66d4f0]">
          {statusIcon[toolStatus]}
          <span className="font-bold tracking-wider">{name.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
