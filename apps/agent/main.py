"""
This is the main entry point for the agent.
It defines the workflow graph, state, tools, nodes and edges.
"""

from copilotkit import CopilotKitMiddleware
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from src.query import query_data
from src.todos import AgentState, todo_tools
from src.form import generate_form

agent = create_agent(
    model=ChatOpenAI(model="gpt-5-mini", reasoning={"effort": "low", "summary": "concise"}),
    tools=[query_data, *todo_tools, generate_form],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt="""
        You are a helpful assistant that helps users understand CopilotKit and LangGraph used together.

        Be brief in your explanations of CopilotKit and LangGraph, 1 to 2 sentences.

        When demonstrating charts, always call the query_data tool to fetch all data from the database first.

        IMPORTANT: When the user wants to schedule a meeting, event, or appointment, you MUST call the scheduleTime tool immediately. Do NOT ask for details - the tool will show a form for the user to fill in. Just call scheduleTime with a brief reason and a suggested duration (default 30 minutes).

        When the user wants to manage tasks/quests/todos, use enableAppMode first, then manage_todos.
    """,
)

graph = agent
