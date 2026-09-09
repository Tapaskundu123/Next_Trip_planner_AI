import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { destination, duration, budget, group_size, hotels, itinerary } = await req.json();

    const hotelPrices = hotels?.map((h: any) => h.price_per_night).join(", ") || "N/A";
    const ticketPrices = itinerary
      ?.flatMap((d: any) => d.activities?.map((a: any) => a.ticket_pricing) || [])
      .slice(0, 8)
      .join(", ") || "N/A";

    const prompt = `Estimate the total trip cost breakdown for this journey:

Destination: ${destination}
Duration: ${duration}
Budget Level: ${budget}
Group Size: ${group_size}
Hotel prices mentioned: ${hotelPrices}
Activity ticket prices mentioned: ${ticketPrices}

Return ONLY valid JSON in this exact format (amounts in USD unless destination is clearly India/South Asia, then use INR):
{
  "currency": "USD",
  "currency_symbol": "$",
  "per_person": true,
  "flights_estimate": 450,
  "hotels_total": 350,
  "activities_total": 120,
  "food_total": 180,
  "transport_local": 60,
  "misc_buffer": 80,
  "grand_total": 1240,
  "note": "Estimates based on ${budget} budget for ${group_size} traveler(s). Actual costs may vary."
}

Rules:
- Use realistic 2025/2026 market rates
- flights_estimate: Round-trip international/domestic flight cost per person
- hotels_total: Total hotel cost for the full ${duration} (per person if group)
- activities_total: Sum of ticket prices + entrance fees for the whole trip
- food_total: Estimated meal costs for the full duration
- transport_local: Local transport (taxi, metro, buses) for the trip
- misc_buffer: 10-15% buffer for unexpected expenses
- grand_total: Sum of all above
- If destination is India or South Asia, use INR currency and currency_symbol "₹"
- Numbers must be integers, not strings`;

    const completion = await client.chat.completions.create({
      model: "x-ai/grok-4-1-mini",
      messages: [
        { role: "system", content: "You are a travel finance expert. Always return valid JSON only with realistic cost estimates." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, breakdown: parsed });
    } catch {
      return NextResponse.json({ error: "Failed to parse breakdown" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Budget breakdown error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate budget breakdown" },
      { status: 500 }
    );
  }
}
