import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { hotel_address } = await req.json();

  const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";

  const params = new URLSearchParams({
    query: hotel_address, // 🔥 Search by address
    key: process.env.GOOGLE_MAPS_API_KEY!, // Use backend key, not public
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  return NextResponse.json(data);
}
