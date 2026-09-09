import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { destination, duration, budget, group_size, itinerary } = await req.json();

    const activityTypes = itinerary
      ?.flatMap((d: any) => d.activities?.map((a: any) => a.place_name) || [])
      .slice(0, 10)
      .join(", ") || "general sightseeing";

    const currentMonth = new Date().toLocaleString("default", { month: "long" });

    const prompt = `Generate a smart, practical packing list for this trip:

Destination: ${destination}
Duration: ${duration}
Budget Level: ${budget}
Group Size: ${group_size}
Travel Month: ${currentMonth}
Activities planned: ${activityTypes}

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "categories": [
    {
      "name": "Documents & Money",
      "emoji": "📄",
      "items": ["Passport", "Travel insurance", "Hotel bookings printout", "Local currency"]
    },
    {
      "name": "Clothing",
      "emoji": "👕",
      "items": ["5 t-shirts", "2 pairs of jeans", "Comfortable walking shoes", "Light jacket"]
    },
    {
      "name": "Toiletries",
      "emoji": "🧴",
      "items": ["Toothbrush & paste", "Sunscreen SPF 50+", "Deodorant", "Hand sanitizer"]
    },
    {
      "name": "Electronics",
      "emoji": "📱",
      "items": ["Phone + charger", "Power bank", "Universal adapter", "Earphones"]
    },
    {
      "name": "Health & Safety",
      "emoji": "💊",
      "items": ["Basic first aid kit", "Pain relievers", "Anti-diarrhea medicine", "Insect repellent"]
    },
    {
      "name": "Travel Accessories",
      "emoji": "🎒",
      "items": ["Day backpack", "Water bottle", "Neck pillow", "Travel locks"]
    }
  ]
}

Rules:
- Be specific to the destination (e.g., if beach destination, include swimwear; if cold climate, include thermals)
- Include at least 4 items per category
- Keep items practical and realistic for ${group_size} traveler(s)
- Consider the budget level (${budget}) for recommendations`;

    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4.3",
      messages: [
        { role: "system", content: "You are a travel packing expert. Always return valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, packingList: parsed });
    } catch {
      return NextResponse.json({ error: "Failed to parse packing list" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Packing list error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate packing list" },
      { status: 500 }
    );
  }
}
