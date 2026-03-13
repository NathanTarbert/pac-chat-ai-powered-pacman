import { z } from "zod";
import { useTheme } from "@/hooks/use-theme";
import { useHITL } from "@/components/pacman/hitl-store";

// CopilotKit imports
import {
  useComponent,
  useFrontendTool,
  useDefaultRenderTool,
  useAgentContext,
} from "@copilotkit/react-core/v2";

// Generative UI imports
import { PieChart, PieChartProps } from "@/components/generative-ui/charts/pie-chart";
import { BarChart, BarChartProps } from "@/components/generative-ui/charts/bar-chart";
import { PacManToolReasoning } from "@/components/pacman/tool-rendering";

export const useGenerativeUIExamples = () => {
  const { theme, setTheme } = useTheme();
  const { showForm } = useHITL();

  // System instructions for the built-in agent (via v2 context)
  useAgentContext({
    description: "System instructions for the assistant",
    value: `You are a helpful Pac-Man themed assistant. Be brief (1-2 sentences).

IMPORTANT RULES:
1. When the user wants to schedule a meeting, event, or appointment, you MUST call the scheduleTime tool immediately. Do NOT ask for details - the tool will show a form. Just call scheduleTime with a brief reason and suggested duration (default 30 minutes).
2. When the user wants to add tasks/quests/todos, you MUST first call enableAppMode, then call manage_quests with the full quests array. Always use tools, never just describe what you would do.
3. When the user asks for a chart, you MUST first call the webSearch tool to find a random interesting fact with real numerical data, then use the pieChart or barChart tool to visualize that data. Never generate an image or markdown chart. Always search first, then chart with real data.
4. Always use your tools to take actions. Never just describe the action in text.`,
  });

  // ------------------
  // Frontend Tools
  // ------------------
  useFrontendTool({
    name: "webSearch",
    description: "Search the web for real facts, statistics, or data on any topic. Returns an answer and relevant results. Use this before creating charts to get real data.",
    parameters: z.object({
      query: z.string().describe("The search query to find facts or data"),
    }),
    handler: async ({ query }) => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      return JSON.stringify(data);
    },
  });

  useFrontendTool({
    name: "toggleTheme",
    description: "Frontend tool for toggling the theme of the app.",
    parameters: z.object({}),
    handler: async () => {
      setTheme(theme === "dark" ? "light" : "dark")
    },
  }, [theme, setTheme]);

  // --------------------------
  // Frontend Generative UI
  // --------------------------
  useComponent({
    name: "pieChart",
    description: "Controlled Generative UI that displays data as a pie chart.",
    parameters: PieChartProps,
    render: PieChart,
  });

  useComponent({
    name: "barChart",
    description: "Controlled Generative UI that displays data as a bar chart.",
    parameters: BarChartProps,
    render: BarChart,
  });

  // --------------------------
  // Default Tool Rendering
  // --------------------------
  const ignoredTools = ["generate_form", "webSearch"]
  useDefaultRenderTool({
    render: ({ name, status, parameters }) => {
      if(ignoredTools.includes(name)) return <></>;
      return <PacManToolReasoning name={name} status={status} args={parameters} />;
    },
  });

  // -------------------------------------
  // Human-in-the-loop via blocking frontend tool
  // The handler returns a Promise that resolves only when the user confirms/cancels.
  // This pauses the agent until the human responds.
  // -------------------------------------
  useFrontendTool({
    name: "scheduleTime",
    description: "Schedule a meeting with the user. This will show a form in the chat for the user to fill in meeting details (name, date, time). The user must confirm before the event is created.",
    parameters: z.object({
      reasonForScheduling: z.string().describe("Reason for scheduling, very brief - 5 words."),
      meetingDuration: z.number().describe("Suggested duration of the meeting in minutes"),
    }),
    handler: async ({ reasonForScheduling, meetingDuration }) => {
      return new Promise<string>((resolve) => {
        showForm({ reasonForScheduling, meetingDuration, resolve });
      });
    },
  }, [showForm]);
};
