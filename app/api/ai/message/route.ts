import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEmbedding } from "@/lib/embeddings";
import { getPineconeIndex } from "@/lib/pinecone";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
You are a Trip Planner AI.

Your job is to collect trip details by asking EXACTLY ONE question at a time,
in this strict order:

1. Starting location (origin)
2. Destination
3. Group size (Solo, Couple, Family, Friends)
4. Budget level (Low, Medium, High)
5. Trip duration (e.g. 5 days, 7–10 days, 2 weeks)

========================
RESPONSE FORMAT RULES
========================
- ALWAYS respond with valid JSON ONLY
- Never use markdown, code blocks, or plain text
- Never include explanations outside JSON

For questions or confirmations:
{
  "resp": "string",
  "ui": "none | groupSize | budget | tripDuration"
}

When asking:
- Group size → ui = "groupSize"
- Budget → ui = "budget"
- Duration → ui = "tripDuration"

========================
EDGE CASE HANDLING (IMPORTANT)
========================
During the 5-question flow (origin → destination → group → budget → duration):

If the user asks ANY question that does NOT answer the current required question:

1. Check the CONTEXT below (retrieved from travel guides).

2. If the CONTEXT contains relevant information:
   - Answer using ONLY the CONTEXT
   - Do NOT add assumptions or unrelated facts
   - Keep the response concise and travel-focused

3. If the CONTEXT is not relevant OR the place is not covered:
   - Answer using general travel knowledge
   - Ensure the answer is:
     - Reasonable
     - Commonly accepted
     - Non-speculative
     - Helpful for travelers

4. If CONTEXT is empty or fully irrelevant:
   Respond with:
   {
     "resp": "I’m a travel planning assistant. I can help plan trips and answer travel questions. What would you like to know about your adventure?",
     "ui": "none"
   }

5. After answering:
   - Gently return to the SAME pending planning question
   - Do NOT skip, reorder, or auto-fill steps

6. NEVER mention:
   - Pinecone
   - Vector search
   - Context retrieval
   - Internal logic

========================
NORMAL FLOW
========================
If the user provides a valid answer to the current planning question:
- Acknowledge briefly
- Proceed to the NEXT question in order

========================
FINAL STEP — TRIP PLAN GENERATION
========================
IMMEDIATELY after receiving the 5th answer (trip duration),
generate the COMPLETE trip plan in ONE response using EXACTLY this structure:

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
- Do NOT say “Please wait”, “Generating…”, etc.
- Output must be perfectly valid JSON
- No trailing commas
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
      max_tokens: 4000, // Increased to handle full trip plans
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

      // Check if response was truncated
      if (completion.choices?.[0]?.finish_reason === 'length') {
        return NextResponse.json({
          resp: "The trip plan is too detailed. Please try asking for a shorter duration or I'll create a more concise plan.",
          ui: "none",
          error: "Response truncated - token limit reached"
        });
      }

      // Return the raw content if JSON parsing fails
      return NextResponse.json({
        resp: "I encountered an error generating the response. Please try again.",
        ui: "none",
        error: "JSON parse error"
      });
    }
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}