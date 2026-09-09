import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { plan, editRequest, section } = await req.json();

    if (!plan || !editRequest || !section) {
      return NextResponse.json(
        { error: "Missing plan, editRequest, or section" },
        { status: 400 }
      );
    }

    let sectionContext = "";
    let sectionData = "";

    if (section === "hotels") {
      sectionData = JSON.stringify(plan.hotels, null, 2);
      sectionContext = `You need to update the HOTELS section of a trip plan for ${plan.destination}.
Current hotels:
${sectionData}

Trip context: ${plan.duration} trip, ${plan.group_size} travelers, ${plan.budget} budget, from ${plan.origin}.

User's edit request: "${editRequest}"

Return ONLY a JSON object with an updated "hotels" array using the EXACT same schema as the input.
Keep geo_coordinates as real, accurate latitude/longitude numbers for ${plan.destination}.
Do NOT include markdown, explanations, or any text outside the JSON.

Response format:
{
  "hotels": [
    {
      "hotel_name": "string",
      "hotel_address": "string",
      "price_per_night": "string",
      "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
      "rating": 4.5,
      "description": "string"
    }
  ]
}`;
    } else if (section.startsWith("day_")) {
      const dayNumber = parseInt(section.replace("day_", ""));
      const dayData = plan.itinerary.find((d: any) => d.day === dayNumber);
      sectionData = JSON.stringify(dayData, null, 2);
      sectionContext = `You need to update DAY ${dayNumber} of a trip itinerary for ${plan.destination}.
Current Day ${dayNumber} plan:
${sectionData}

Trip context: ${plan.duration} trip, ${plan.group_size} travelers, ${plan.budget} budget.

User's edit request: "${editRequest}"

Return ONLY a JSON object with an updated day object using the EXACT same schema.
Keep geo_coordinates as real, accurate latitude/longitude numbers for places in ${plan.destination}.
Do NOT include markdown, explanations, or any text outside the JSON.

Response format:
{
  "day": ${dayNumber},
  "day_plan": "string",
  "best_time_to_visit_day": "string",
  "activities": [
    {
      "place_name": "string",
      "place_details": "string",
      "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
      "place_address": "string",
      "ticket_pricing": "string",
      "time_travel_each_location": "string",
      "best_time_to_visit": "string"
    }
  ]
}`;
    } else {
      return NextResponse.json({ error: "Invalid section. Use 'hotels' or 'day_N'" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4-1-mini",
      messages: [
        { role: "system", content: sectionContext },
        { role: "user", content: `Apply the edit: "${editRequest}"` },
      ],
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, section, updated: parsed });
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Edit plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to edit plan" },
      { status: 500 }
    );
  }
}
