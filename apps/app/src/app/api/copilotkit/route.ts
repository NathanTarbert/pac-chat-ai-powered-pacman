import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const serviceAdapter = new OpenAIAdapter({ model: "gpt-4o-mini" });
  const model = `${serviceAdapter.provider}/${serviceAdapter.model}`;

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    serviceAdapter,
    runtime: new CopilotRuntime({
      agents: {
        default: new BuiltInAgent({ model }),
      },
    }),
  });

  return handleRequest(req);
};
