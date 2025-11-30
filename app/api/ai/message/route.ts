import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ---------------- SYSTEM PROMPT ----------------
const SYSTEM_PROMPT = `
You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.

Only ask questions about the following details, in exact order, and wait for the user's answer before moving to the next:
1. Starting location (source)
2. Destination city or country
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Trip duration (days)
6. Travel interests (adventure, sightseeing, cultural, food, nightlife, relaxation)
7. Special requirements or preferences

Rules:
- Ask ONLY one question at a time.
- Never ask irrelevant questions.
- If an answer is unclear, politely ask the user to clarify.
- Maintain a friendly, interactive tone.

Along with your response, ALWAYS return a JSON with:
{
  "resp": "Text response to display",
  "ui": "budget | groupSize | tripDuration | final | none"
}

Once all required information is collected, respond ONLY with a strict JSON travel plan (no explanations, no extra text), using this EXACT schema:

{
  "trip_plan":{
     "destination":"string",
     "duration":"string",
     "origin":"string",
     "budget":"string",
     "group_size":"string",
     "hotels":[
       {
         "hotel_name":"string",
         "hotel_address":"string",
         "price_per_night":"string",
         "hotel_image_url":"string",
         "geo_cordinates":{
           "latitude":"number",
           "longitude":"number"
         },
         "rating":"number",
         "description":"string"
       }
     ],
     "itinerary":[
       {
          "day":"number",
          "day_plan":"string",
          "best_time_to_visit_day":"string",
          "activities":[
            {
              "place_name":"string",
              "place_details":"string",
              "place_image_url":"string",
              "geo_coordinates":{
                 "latitude":"number",
                 "longitude":"number"
              },
              "place_address":"string",
              "ticket_pricing":"string",
              "time_travel_each_location":"string",
              "best_time_to_visit":"string"
            }
          ]
       }
     ]
  }
}
`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    // Build message array with system prompt + history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },

      // Convert chatHistory into assistant/user messages
      ...history.flatMap((entry: { user: string; ai?: string }) => [
        { role: "user", content: entry.user },
        ...(entry.ai ? [{ role: "assistant", content: entry.ai }] : [])
      ]),

      // New user message
      { role: "user", content: message }
    ];

    // Call OpenRouter Grok Model
    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4.1-fast:free",
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "No response generated.";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
