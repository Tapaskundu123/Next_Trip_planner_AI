import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEmbedding } from "@/lib/embeddings";
import { getPineconeIndex } from "@/lib/pinecone";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

function getCurrentDateContext(): string {
  const now = new Date();
  const formatted = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const month = now.getMonth();
  let season = "winter";
  if (month >= 2 && month <= 4) season = "spring";
  else if (month >= 5 && month <= 7) season = "summer";
  else if (month >= 8 && month <= 10) season = "autumn/fall";
  return `Current date: ${formatted}\nCurrent season (Northern Hemisphere): ${season}`;
}

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, startDate, duration, groupSize, budget } = await req.json();

    if (!origin || !destination || !duration || !groupSize || !budget) {
      return NextResponse.json({ error: "Missing required trip details" }, { status: 400 });
    }

    // Try RAG context enrichment
    let contextText = "";
    try {
      const queryText = `${destination} travel guide ${duration} ${budget} budget`;
      const queryEmbedding = await generateEmbedding(queryText);
      const index = await getPineconeIndex();
      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      });
      const relevantResults = searchResults.matches.filter(
        (match) => match.score && match.score > 0.7
      );
      if (relevantResults.length > 0) {
        contextText = relevantResults
          .map((match, idx) => {
            const filename = match.metadata?.filename || "Unknown";
            const text = match.metadata?.text || "";
            const score = (match.score! * 100).toFixed(1);
            return `[Source ${idx + 1}: ${filename} (${score}% relevant)]\n${text}`;
          })
          .join("\n\n---\n\n");
      }
    } catch {
      // RAG failure is non-fatal
    }

    const dateContext = getCurrentDateContext();

    const prompt = `You are an expert AI trip planner. Generate a COMPLETE, detailed trip plan.

Origin: ${origin}
Destination: ${destination}
Start Date: ${startDate || "Flexible"}
Duration: ${duration}
Group Size: ${groupSize}
Budget Level: ${budget}
${dateContext}
${contextText ? `\nTRAVEL GUIDE CONTEXT:\n${contextText}` : ""}

Return ONLY valid JSON with NO markdown, NO code fences, NO extra text:

{
  "destination": "string",
  "duration": "string",
  "startDate": "string",
  "origin": "string",
  "budget": "string",
  "group_size": "string",
  "weather_note": "Brief seasonal weather note for destination during travel dates",
  "hotels": [
    {
      "hotel_name": "string",
      "hotel_address": "string",
      "price_per_night": "string",
      "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
      "rating": 4.5,
      "description": "string"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "day_plan": "Brief overview of the day",
      "best_time_to_visit_day": "Morning to evening",
      "activities": [
        {
          "place_name": "string",
          "place_details": "Detailed description (2-3 sentences)",
          "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
          "place_address": "string",
          "ticket_pricing": "Free / $20 / etc.",
          "time_travel_each_location": "10 min walk",
          "best_time_to_visit": "Morning / Sunset"
        }
      ]
    }
  ]
}

RULES:
- Include 3-4 hotels matching the ${budget} budget
- Generate one day object PER DAY for the full duration
- Include 3-5 activities per day with REAL accurate geo_coordinates for ${destination}
- Do NOT include image URLs
- Output must be valid parseable JSON only`;

    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4.3",
      messages: [
        {
          role: "system",
          content:
            "You are a world-class travel planner. Return ONLY valid JSON - no markdown, no code blocks, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let tripPlan;
    try {
      tripPlan = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI trip plan. Please try again." },
        { status: 500 }
      );
    }

    if (!tripPlan.destination || !tripPlan.hotels || !tripPlan.itinerary) {
      return NextResponse.json(
        { error: "Incomplete trip plan generated. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, trip_plan: tripPlan });
  } catch (error: any) {
    console.error("Generate trip error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate trip plan" },
      { status: 500 }
    );
  }
}
