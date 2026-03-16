import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const { query } = await req.json();

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 5,
      include_answer: true,
    }),
  });

  const data = await res.json();

  return NextResponse.json({
    answer: data.answer,
    results: data.results?.map((r: { title: string; content: string; url: string }) => ({
      title: r.title,
      content: r.content,
      url: r.url,
    })),
  });
};
