import { NextRequest } from "next/server";
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

const SYSTEM_PROMPT = `
You are a Trip Planner AI — an expert, friendly travel assistant.

Your job is to collect trip details by asking EXACTLY ONE question at a time,
in this strict order:

1. Starting location (origin)
2. Destination
3. Travel dates (ask for approximate start date and duration, e.g. "I plan to go in March for 7 days")
4. Group size (Solo, Couple, Family, Friends)
5. Budget level (Low, Medium, High)

========================
RESPONSE FORMAT RULES
========================
- ALWAYS respond with valid JSON ONLY
- Never use markdown, code blocks, or plain text
- Never include explanations outside JSON

For questions or confirmations:
{
  "resp": "string",
  "ui": "none | groupSize | budget | datePicker"
}

When asking:
- Travel dates → ui = "datePicker"
- Group size → ui = "groupSize"
- Budget → ui = "budget"

========================
EDGE CASE HANDLING (IMPORTANT)
========================
During the planning flow:

If the user asks ANY question that does NOT answer the current required question:

1. Check the CONTEXT below (retrieved from travel guides).

2. If the CONTEXT contains relevant information:
   - Answer using ONLY the CONTEXT
   - Keep the response concise and travel-focused

3. If the CONTEXT is not relevant:
   - Answer using general travel knowledge

4. After answering:
   - Gently return to the SAME pending planning question
   - Do NOT skip, reorder, or auto-fill steps

5. NEVER mention:
   - Pinecone, Vector search, Context retrieval, Internal logic

========================
NORMAL FLOW
========================
If the user provides a valid answer to the current planning question:
- Acknowledge briefly
- Proceed to the NEXT question in order

========================
FINAL STEP — TRIP PLAN GENERATION
========================
IMMEDIATELY after receiving the 5th answer (budget level),
generate the COMPLETE trip plan in ONE response using EXACTLY this structure:

{
  "resp": "Here is your complete personalized trip plan!",
  "ui": "final",
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "startDate": "string (e.g. March 15, 2026)",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "weather_note": "Brief seasonal weather note for the destination during travel dates",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
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
            "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
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

========================
CONTEXT
========================
{{CONTEXT}}

If relevant context is provided, use it to enhance recommendations.
Always prioritize user preferences.

========================
FINAL CONSTRAINTS
========================
- Do NOT include image URLs
- Do NOT say "Please wait", "Generating…", etc.
- Output must be perfectly valid JSON
- No trailing commas
- {{DATE_CONTEXT}}
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], startDate } = await req.json();

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

      const relevantResults = searchResults.matches.filter(
        (match) => match.score && match.score > 0.7
      );

      if (relevantResults.length > 0) {
        hasRelevantContext = true;
        contextText = relevantResults
          .map((match, idx) => {
            const filename = match.metadata?.filename || "Unknown";
            const text = match.metadata?.text || "";
            const score = (match.score! * 100).toFixed(1);
            return `[Source ${idx + 1}: ${filename} (${score}% relevant)]\n${text}`;
          })
          .join("\n\n---\n\n");
      }
    } catch (error) {
      console.warn("RAG context retrieval failed, continuing without context:", error);
    }

    const tripPlanningKeywords = [
      "plan", "trip", "travel", "itinerary", "visit", "destination",
      "hotel", "budget", "days", "duration", "group", "solo", "couple", "family",
    ];

    const lowerMessage = message.toLowerCase();
    const isTripPlanningQuery =
      tripPlanningKeywords.some((keyword) => lowerMessage.includes(keyword)) ||
      history.length > 0;

    const dateContext = getCurrentDateContext();

    let messages;

    if (hasRelevantContext && !isTripPlanningQuery) {
      const generalPrompt = `You are a knowledgeable travel assistant. Answer the user's question using the provided context from travel guides.

CONTEXT FROM TRAVEL GUIDES:
${contextText}

INSTRUCTIONS:
- Provide a helpful, conversational response based on the context above
- Be friendly and informative
- Keep responses concise but comprehensive
- Always respond with valid JSON in this format: {"resp": "your response text", "ui": "none"}`;

      messages = [
        { role: "system", content: generalPrompt },
        { role: "user", content: message },
      ];
    } else {
      const contextForPrompt = hasRelevantContext
        ? contextText
        : "No relevant travel guide information available.";

      const systemPromptWithContext = SYSTEM_PROMPT
        .replace("{{CONTEXT}}", contextForPrompt)
        .replace("{{DATE_CONTEXT}}", dateContext);

      const startDateNote = startDate
        ? `\n[User's planned start date: ${startDate}]`
        : "";

      messages = [
        { role: "system", content: systemPromptWithContext },
        ...history.flatMap((entry: { user: string; ai?: string }) => [
          { role: "user", content: entry.user },
          ...(entry.ai ? [{ role: "assistant", content: entry.ai }] : []),
        ]),
        { role: "user", content: message + startDateNote },
      ];
    }

    // =============================================
    // STREAMING RESPONSE using SSE
    // =============================================
    const stream = await client.chat.completions.create({
      model: "x-ai/grok-4.3",
      messages: messages as any,
      temperature: 0.2,
      max_tokens: 6000,
      stream: true,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content || "";
            if (delta) {
              fullContent += delta;
              // Send each token chunk as SSE
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`)
              );
            }

            // Check if stream is done
            if (chunk.choices?.[0]?.finish_reason === "stop" || chunk.choices?.[0]?.finish_reason === "length") {
              // Parse and send the final structured data
              try {
                const cleaned = fullContent
                  .replace(/```json\n?/g, "")
                  .replace(/```\n?/g, "")
                  .trim();
                const parsed = JSON.parse(cleaned);

                // Send final structured event
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ type: "done", data: parsed })}\n\n`
                  )
                );
              } catch (parseErr) {
                // If JSON parse fails, send raw content
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: "done",
                      data: { resp: fullContent, ui: "none" },
                    })}\n\n`
                  )
                );
              }
              controller.close();
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}