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
      className="inline-block w-3 h-3 rounded-full bg-[#ffff00]"
      style={{ animation: "waka 0.4s ease-in-out infinite" }}
    />
  ),
  inProgress: (
    <span
      className="inline-block w-3 h-3 rounded-full bg-[#ffb852]"
      style={{ animation: "waka 0.4s ease-in-out infinite" }}
    />
  ),
  complete: <span className="text-[#ffff00] text-xs font-bold">+100</span>,
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
    <div className="my-2 text-xs">
      {entries.length > 0 ? (
        <details ref={detailsRef} open>
          <summary className="flex items-center gap-2 text-[#33b5e5] cursor-pointer list-none">
            {statusIcon[toolStatus]}
            <span className="font-bold tracking-wider">{name.toUpperCase()}</span>
            <span className="text-[8px] text-[#2121de]">&#9660;</span>
          </summary>
          <div className="pl-5 mt-1 space-y-0.5 text-[10px] text-[#ffb8ae]">
            {entries.map(([key, value]) => (
              <div key={key} className="flex gap-2 min-w-0">
                <span className="font-bold shrink-0 text-[#ffb852]">{key}:</span>
                <span className="truncate">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </details>
      ) : (
        <div className="flex items-center gap-2 text-[#33b5e5]">
          {statusIcon[toolStatus]}
          <span className="font-bold tracking-wider">{name.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
