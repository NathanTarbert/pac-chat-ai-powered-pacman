"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useFrontendTool, useAgentContext } from "@copilotkit/react-core/v2";
import { z } from "zod";

export interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  status: "pending" | "completed";
}

interface QuestContextValue {
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
  addQuest: (quest: Omit<Quest, "id">) => void;
}

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>([]);

  const addQuest = useCallback((quest: Omit<Quest, "id">) => {
    setQuests((prev) => [...prev, { ...quest, id: crypto.randomUUID() }]);
  }, []);

  // Expose quests to the LLM
  useAgentContext({
    description: "The current list of quests (todos) with their id, title, description, emoji, and status (pending or completed).",
    value: JSON.parse(JSON.stringify(quests)),
  });

  // Let the LLM manage quests
  useFrontendTool({
    name: "manage_quests",
    description: "Add, update, or replace the quests list. Pass the full updated quests array. Each quest needs: title (must be descriptive, at least 4-6 words), description, emoji, status ('pending' or 'completed'). Existing quests should keep their id.",
    parameters: z.object({
      quests: z.array(z.object({
        id: z.string().optional().describe("Existing quest id, omit for new quests"),
        title: z.string().describe("Quest title — must be descriptive, at least 4-6 words long"),
        description: z.string().describe("Quest description"),
        emoji: z.string().describe("An emoji for the quest"),
        status: z.enum(["pending", "completed"]).describe("Quest status"),
      })),
    }),
    handler: async ({ quests: newQuests }) => {
      const normalized = newQuests.map((q) => ({
        id: q.id || crypto.randomUUID(),
        title: q.title || "Untitled Quest",
        description: q.description || "",
        emoji: q.emoji || "👾",
        status: q.status || "pending" as const,
      }));
      setQuests(normalized);
    },
  }, [setQuests]);

  return (
    <QuestContext.Provider value={{ quests, setQuests, addQuest }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error("useQuests must be used within QuestProvider");
  return ctx;
}
