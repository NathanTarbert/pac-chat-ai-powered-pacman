# Pac-Chat: AI-Powered Quest Manager

<img width="1504" height="1270" alt="Screenshot 2026-03-16 at 10 11 52 AM" src="https://github.com/user-attachments/assets/0632baba-b98b-4ad6-a083-83e1c8c013b4" />


A retro arcade-themed AI agent app built with [CopilotKit](https://copilotkit.ai). Chat with a Pac-Man-styled AI assistant that manages quests, schedules meetings, queries data, and renders live charts — all through a shared state model where the agent and user both drive the UI.


## What It Does

This isn't a typical chatbot wrapper. The AI agent has direct access to application state — it can add quests, mark them complete, pull up charts, and schedule meetings. You can do the same from the UI. Both sides stay in sync automatically through CopilotKit's v2 agent state pattern.

**Three modes, one interface:**

- **Chat** — Talk to the agent. It responds with Pac-Man flair (ghost avatars, arcade styling) and can take actions on your behalf.
- **Quests** — A two-column kanban (Active / Cleared) where you or the agent manage tasks. Add, edit, delete, toggle status.
- **Calendar** — Schedule meetings with a human-in-the-loop confirmation flow. The agent proposes a time, you approve or reject it.

Plus generative UI: the agent can render pie charts, bar charts, and forms directly in the chat.

## Architecture

```
apps/app/
└── src/
    ├── app/
    │   ├── page.tsx                 Main page (PacManLayout + providers)
    │   ├── layout.tsx               Root layout with CopilotKit wrapper
    │   └── api/
    │       ├── copilotkit/          CopilotKit runtime (OpenAI adapter + BuiltInAgent)
    │       └── search/              Tavily web search integration
    ├── components/
    │   ├── pacman/                  Pac-Man themed UI
    │   │   ├── layout.tsx           Three-panel layout (chat / quests / calendar)
    │   │   ├── headless-chat.tsx    Chat with Pac-Man & Ghost avatars
    │   │   ├── todo-list.tsx        Quest kanban
    │   │   ├── calendar/            Meeting scheduler
    │   │   └── quest-store.tsx      Frontend tools + agent context
    │   └── generative-ui/           Charts and dynamic forms
    └── hooks/
        └── use-generative-ui-examples.tsx   CopilotKit v2 tools & components
```

**How state flows:** CopilotKit's `BuiltInAgent` manages the agent runtime. The frontend reads state via `useAgent()` and writes back via `agent.setState()`. Frontend tools (registered with `useFrontendTool`) let the agent switch UI modes, update quests, and trigger actions — no separate backend needed.

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/installation)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
git clone https://github.com/NathanTarbert/pac-chat-ai-powered-pacman.git
cd pac-chat-ai-powered-pacman
pnpm install

cp .env.example .env
# Add your OpenAI API key to .env
```

### Run

```bash
pnpm dev
```

The Next.js app starts on [localhost:3000](http://localhost:3000).

## Tech Stack

| Layer     | Tech                                         |
|-----------|----------------------------------------------|
| Frontend  | Next.js 16, React 19, TailwindCSS 4          |
| AI Agent  | CopilotKit v2 (BuiltInAgent + OpenAI)        |
| Search    | Tavily API                                    |
| Charts    | Recharts                                      |
| Monorepo  | Turborepo + pnpm workspaces                   |

## Key Patterns

**Agent-driven UI** — State lives in the agent. The frontend is a view layer that reads from and writes to agent state. One source of truth, bidirectional sync, and the agent always knows what's on screen.

**Human-in-the-loop** — For actions like scheduling meetings, the agent proposes and waits. The user confirms or cancels through a form rendered in the UI. Agent execution blocks until the human responds.

**Frontend tools** — CopilotKit lets you register tools on the frontend (like `manage_quests` or `enableAppMode`) that the agent can call. The agent can switch UI modes, update quest lists, or trigger navigation without any backend round-trip for the UI change.

## Available Scripts

| Command       | Description                |
|---------------|----------------------------|
| `pnpm dev`    | Start the dev server       |
| `pnpm build`  | Production build           |
| `pnpm lint`   | Run ESLint                 |
| `pnpm clean`  | Remove build artifacts     |

## Extending This

The project is structured as a template. Fork it and swap out the quest/todo domain for whatever fits your use case:

1. Register frontend tools with `useFrontendTool` for agent-callable UI actions
2. Use `useAgentContext` to expose state the agent should reason about
3. Wire up components that read from `agent.state` and write via `agent.setState()`

The Pac-Man theme is fun but optional — the underlying CopilotKit patterns work with any UI.

## Troubleshooting

**"I'm having trouble connecting to my tools"**
- Verify your OpenAI API key is set in `.env`
- Check the dev server started successfully

## License

MIT — see [LICENSE](./LICENSE) for details.
