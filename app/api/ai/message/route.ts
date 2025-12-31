import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEmbedding } from "@/lib/embeddings";
import { getPineconeIndex } from "@/lib/pinecone";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
You are a Trip Planner AI. Your job is to collect travel details step by asking exactly ONE question at a time, in this strict order:

1. Starting location (origin)
2. Destination
3. Group size (e.g. Solo, Couple, Family, Friends)
4. Budget level (Low, Medium, High)
5. Trip duration (e.g. 5 days, 7-10 days, 2 weeks)

CRITICAL RULES:
- Always respond with valid JSON only. Never use markdown, code blocks, or plain text.
- For the first 4 questions, respond like this:
  {"resp": "Your question or confirmation", "ui": "none" or "budget/groupSize/tripDuration"}

- When asking for group size → {"resp": "Who are you traveling with?", "ui": "groupSize"}
- When asking for budget → {"resp": "What's your budget level?", "ui": "budget"}
- When asking for duration → {"resp": "How many days will your trip be?", "ui": "tripDuration"}

- THE MOMENT you receive the duration (5th answer), you MUST generate the FULL trip plan in ONE single JSON response with this exact structure:
{
  "resp": "Here is your complete personalized trip plan!",
  "ui": "final",
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "https://images.unsplash.com/...",
        "geo_coordinates": {"latitude": 0.0, "longitude": 0.0},
        "rating": 4.7,
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
            "place_details": "Detailed description",
            "place_image_url": "https://images.unsplash.com/...",
            "geo_coordinates": {"latitude": 0.0, "longitude": 0.0},
            "place_address": "string",
            "ticket_pricing": "Free / $20-40 / etc.",
            "time_travel_each_location": "10 min walk / 30 min by car",
            "best_time_to_visit": "Morning / Sunset"
          }
        ]
      }
    ]
  }
}

CONTEXT FROM TRAVEL GUIDES:
{{CONTEXT}}

If relevant context is provided above from uploaded travel guides, use this information to enhance your trip recommendations.
Always prioritize user preferences while incorporating insights from the travel guides.

FINAL INSTRUCTIONS:
- Do NOT say "Please wait", "One moment", or "Generating..." → frontend handles loading.
- Always output perfectly valid JSON with no trailing commas or comments.
- Current date: December 2025
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    // Query Pinecone for relevant context
    let contextText = "";
    let hasRelevantContext = false;

    try {
      const queryEmbedding = await generateEmbedding(message);
      const index = await getPineconeIndex();

      const searchResults = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
      });

      // Filter results with good similarity scores (> 0.7)
      const relevantResults = searchResults.matches.filter(
        match => match.score && match.score > 0.7
      );

      if (relevantResults.length > 0) {
        hasRelevantContext = true;
        contextText = relevantResults
          .map((match, idx) => {
            const filename = match.metadata?.filename || 'Unknown';
            const text = match.metadata?.text || '';
            const score = (match.score! * 100).toFixed(1);
            return `[Source ${idx + 1}: ${filename} (${score}% relevant)]\n${text}`;
          })
          .join('\n\n---\n\n');
      }
    } catch (error) {
      console.warn('RAG context retrieval failed, continuing without context:', error);
    }

    // Check if this is a trip planning query or a general question
    const tripPlanningKeywords = [
      'plan', 'trip', 'travel', 'itinerary', 'visit', 'destination',
      'hotel', 'budget', 'days', 'duration', 'group', 'solo', 'couple', 'family'
    ];

    const lowerMessage = message.toLowerCase();
    const isTripPlanningQuery = tripPlanningKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    ) || history.length > 0; // If there's conversation history, continue trip planning

    let messages;

    if (hasRelevantContext && !isTripPlanningQuery) {
      // General Q&A Mode: Use RAG context directly with a conversational prompt
      const generalPrompt = `You are a knowledgeable travel assistant. Answer the user's question using the provided context from travel guides.

CONTEXT FROM TRAVEL GUIDES:
${contextText}

INSTRUCTIONS:
- Provide a helpful, conversational response based on the context above
- If the context is relevant, use it to enhance your answer
- Be friendly and informative
- Keep responses concise but comprehensive
- Always respond with valid JSON in this format: {"resp": "your response text", "ui": "none"}`;

      messages = [
        { role: "system", content: generalPrompt },
        { role: "user", content: message },
      ];
    } else {
      // Trip Planning Mode: Use the structured SYSTEM_PROMPT
      const contextForPrompt = hasRelevantContext
        ? contextText
        : "No relevant travel guide information available.";

      const systemPromptWithContext = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextForPrompt);

      messages = [
        { role: "system", content: systemPromptWithContext },
        ...history.flatMap((entry: { user: string; ai?: string }) => [
          { role: "user", content: entry.user },
          ...(entry.ai ? [{ role: "assistant", content: entry.ai }] : []),
        ]),
        { role: "user", content: message },
      ];
    }

    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4.1-fast",
      messages,
      temperature: 0.2,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";

    // Clean and parse JSON
    let cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);

      // If trip_plan exists, return it as an object (not stringified)
      if (parsed.trip_plan) {
        return NextResponse.json({
          resp: parsed.resp || "Your trip plan is ready!",
          ui: "final",
          trip_plan: parsed.trip_plan,
        });
      }

      // Normal response
      if (parsed && typeof parsed === "object") {
        return NextResponse.json(parsed);
      }

      return NextResponse.json({ resp: content, ui: "none" });
    } catch (err) {
      console.error("JSON Parse Error:", err, "\nRaw content:", content);
      return NextResponse.json({ resp: content, ui: "none" });
    }
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}