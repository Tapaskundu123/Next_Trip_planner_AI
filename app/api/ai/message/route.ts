import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json(); // Use history!

    // Build messages array with history for context
    const messages = [
      ...history.flatMap((entry: { user: string; ai?: string }) => [
        { role: "user", content: entry.user },
        ...(entry.ai ? [{ role: "assistant", content: entry.ai }] : [])
      ]),
      { role: "user", content: message }
    ];
const completion = await client.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",  // ✅ Updated: Free, latest xAI model
      messages,
      temperature: 0.7,  // Balanced creativity for travel advice
      max_tokens: 800,   // Generous for detailed itineraries
    });

    const reply = completion.choices[0].message.content || "No response generated.";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("OpenRouter Error:", error); // Log for Vercel/Netlify
    return NextResponse.json(
      { error: error.message || "Failed to generate response" }, 
      { status: 500 }
    );
  }
}