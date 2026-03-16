"use client";

import { useAgent, useCopilotKit, useRenderToolCall } from "@copilotkit/react-core/v2";
import { useCallback, useState, useRef, useEffect, useMemo, startTransition } from "react";
import { useHITL } from "./hitl-store";
import { InlineMeetingForm } from "./meeting-picker";

// Ghost colors for different message types
const GHOST_COLORS = {
  user: { body: "#ffff00", name: "PAC-MAN" },
  assistant: { body: "#ff0000", name: "BLINKY" },
  system: { body: "#33b5e5", name: "INKY" },
} as const;

/**
 * Proper Pac-Man using CSS clip-path for the animated mouth.
 * The mouth opens and closes via the chomp keyframe.
 */
function PacManSprite({ size = 24 }: { size?: number }) {
  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {/* Body */}
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
        style={{
          width: size * 0.14,
          height: size * 0.14,
          top: size * 0.18,
          left: size * 0.52,
        }}
      />
    </div>
  );
}

function GhostIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "ghost-float 2s ease-in-out infinite" }}>
      <path
        d="M4 22V12C4 7.58 7.58 4 12 4s8 3.58 8 8v10l-2.5-2.5L15 22l-3-3-3 3-2.5-2.5L4 22z"
        fill={color}
      />
      <circle cx="9" cy="11" r="2" fill="white" />
      <circle cx="15" cy="11" r="2" fill="white" />
      <circle cx="9.5" cy="11.5" r="1" fill="#111" />
      <circle cx="15.5" cy="11.5" r="1" fill="#111" />
    </svg>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-[#ffb8ae]"
          style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  role: string;
  content: string;
}

function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const ghost = GHOST_COLORS[role as keyof typeof GHOST_COLORS] || GHOST_COLORS.system;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4 animate-[score-pop_0.3s_ease-out]`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border-2 border-[#ffff00] flex items-center justify-center">
            <PacManSprite size={20} />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#1a1a2e] border-2 border-[#ff0000] flex items-center justify-center">
            <GhostIcon color={ghost.body} size={20} />
          </div>
        )}
      </div>

      {/* Message */}
      <div className={`max-w-[75%] ${isUser ? "text-right" : ""}`}>
        <div className={`text-[10px] font-bold tracking-widest mb-1 ${isUser ? "text-[#ffff00]" : "text-[#ff0000]"}`}>
          {ghost.name}
        </div>
        <div
          className={`relative px-4 py-3 rounded-lg text-sm leading-relaxed ${
            isUser
              ? "bg-[#ffff00] text-black rounded-tr-none"
              : "bg-[#1a1a2e] text-[#66d4f0] border border-[#2121de] rounded-tl-none"
          }`}
          style={!isUser ? { animation: "maze-glow 3s ease-in-out infinite" } : undefined}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "Add quests about CopilotKit",
  "Schedule a meeting",
  "Show a pie chart",
  "Toggle dark mode",
];

export function PacManChat() {
  const { agent } = useAgent();
  const { copilotkit } = useCopilotKit();
  const renderToolCall = useRenderToolCall();
  const { state: hitlState } = useHITL();
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const extraLifeShownAt = useRef<Set<number>>(new Set());

  const userMessageCount = useMemo(
    () => agent.messages.filter((m: { role: string }) => m.role === "user").length,
    [agent.messages]
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [agent.messages, hitlState.phase, scrollToBottom]);

  // Extra life toast every 10 user messages
  useEffect(() => {
    if (userMessageCount > 0 && userMessageCount % 5 === 0 && !extraLifeShownAt.current.has(userMessageCount)) {
      extraLifeShownAt.current.add(userMessageCount);
      startTransition(() => setToast("1UP! You won an extra life!"));
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [userMessageCount]);

  const sendMessage = useCallback(
    (msg: string) => {
      if (!msg.trim()) return;
      agent.addMessage({
        role: "user",
        id: crypto.randomUUID(),
        content: msg.trim(),
      });
      copilotkit.runAgent({ agent }).catch((err: unknown) => {
        console.error("runAgent failed:", err);
      });
      setMessage("");
      inputRef.current?.focus();
    },
    [agent, copilotkit]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(message);
    }
  };

  // Filter to visible messages (text + tool calls)
  const visibleMessages = agent.messages.filter(
    (m: { role: string; content?: string | unknown; toolCalls?: { id: string }[] }) => {
      if (m.role === "user" && typeof m.content === "string" && m.content.trim()) return true;
      if (m.role === "assistant") {
        const hasText = typeof m.content === "string" && m.content.trim();
        const hasToolCalls = m.toolCalls && m.toolCalls.length > 0;
        return hasText || hasToolCalls;
      }
      return false;
    }
  );

  const showHITLForm = hitlState.phase !== "idle";

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b-2 border-[#2121de] bg-[#0a0a1a]">
        <div className="flex items-center gap-3 min-w-0">
          <PacManSprite size={28} />
          <div className="min-w-0">
            <h2 className="text-[#ffff00] text-sm font-bold tracking-wider truncate">PAC-CHAT</h2>
            <div className="text-[10px] text-[#66d4f0] tracking-wider truncate">
              {agent.isRunning ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff0000] animate-pulse" />
                  GHOST IS THINKING...
                </span>
              ) : (
                "READY PLAYER 1"
              )}
            </div>
          </div>
          {/* Score */}
          <div className="flex-shrink-0 border-l-2 border-[#2121de] pl-3">
            <div className="text-[10px] text-[#ffd0c8] tracking-wider">MESSAGES</div>
            <div className="text-[#ffff00] font-bold text-sm tabular-nums">
              {String(userMessageCount).padStart(4, "0")}
            </div>
          </div>
        </div>
      </div>

      {/* Extra life toast */}
      {toast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-[#1a1a2e] border-2 border-[#ffff00] rounded-lg shadow-[0_0_20px_rgba(255,255,0,0.4)] animate-[score-pop_0.3s_ease-out]">
          <span className="text-[#ffff00] font-bold text-sm tracking-wider">{toast}</span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {visibleMessages.length === 0 && !showHITLForm ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            {/* Animated Pac-Man with dot trail */}
            <div className="relative flex items-center gap-3">
              <PacManSprite size={64} />
              <div className="flex gap-2.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#ffb8ae]"
                    style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
            <div className="text-[#ffff00] font-bold text-lg tracking-wider mt-4">READY!</div>
            <div className="text-[#66d4f0] text-xs tracking-wider max-w-xs">
              INSERT MESSAGE TO START
            </div>
            {/* Suggestion pills */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="px-3 py-1.5 text-[11px] rounded-full border border-[#2121de] text-[#66d4f0] hover:bg-[#2121de] hover:text-[#ffff00] transition-colors cursor-pointer tracking-wide"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {visibleMessages.map((msg: { id: string; role: string; content?: string | unknown; toolCalls?: { id: string }[] }) => (
              <div key={msg.id}>
                {typeof msg.content === "string" && msg.content.trim() && (
                  <MessageBubble
                    role={msg.role}
                    content={msg.content}
                  />
                )}
                {msg.toolCalls?.map((tc: { id: string }) => {
                  const toolMessage = agent.messages.find(
                    (m: { role: string; toolCallId?: string }) => m.role === "tool" && m.toolCallId === tc.id
                  );
                  const rendered = renderToolCall({ toolCall: tc, toolMessage });
                  return rendered ? <div key={tc.id} className="my-2">{rendered}</div> : null;
                })}
              </div>
            ))}

            {/* HITL form rendered inline in the chat */}
            {showHITLForm && <InlineMeetingForm />}

            {agent.isRunning && !showHITLForm && <Dots />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 py-3 border-t-2 border-[#2121de] bg-[#0a0a1a]">
        {/* Collapsible suggestions */}
        {showSuggestions && visibleMessages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 animate-[score-pop_0.2s_ease-out]">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { sendMessage(s); setShowSuggestions(false); }}
                disabled={agent.isRunning || showHITLForm}
                className="px-2.5 py-1 text-[10px] rounded-full border border-[#2121de] text-[#66d4f0] hover:bg-[#2121de] hover:text-[#ffff00] transition-colors cursor-pointer tracking-wide disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-1 mb-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-[#ffb8ae] opacity-30" />
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {visibleMessages.length > 0 && (
            <button
              onClick={() => setShowSuggestions((v) => !v)}
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                showSuggestions
                  ? "bg-[#2121de] text-[#ffff00]"
                  : "bg-[#1a1a2e] border-2 border-[#2121de] text-[#66d4f0] hover:border-[#33b5e5]"
              }`}
              aria-label="Toggle suggestions"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
              </svg>
            </button>
          )}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="WAKA WAKA..."
              disabled={agent.isRunning || showHITLForm}
              className="w-full px-4 py-2.5 bg-[#1a1a2e] border-2 border-[#2121de] rounded-lg text-[#ffff00] text-sm placeholder-[#2121de] focus:outline-none focus:border-[#33b5e5] focus:shadow-[0_0_10px_rgba(33,33,222,0.5)] disabled:opacity-50 transition-all"
              aria-label="Type your message"
            />
          </div>
          <button
            onClick={() => sendMessage(message)}
            disabled={!message.trim() || agent.isRunning || showHITLForm}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#ffff00] text-black flex items-center justify-center disabled:opacity-30 hover:bg-[#ffb852] transition-colors cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
