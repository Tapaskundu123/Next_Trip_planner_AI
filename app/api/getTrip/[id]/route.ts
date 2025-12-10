import { NextRequest, NextResponse } from "next/server";
import { Trip } from "@/models/TripModel";
import { connectDB } from "@/lib/mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params; // ✅ FIXED — no await

    const trip = await Trip.findById(id);

    if (!trip) {
      return NextResponse.json(
        { success: false, message: "Trip not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: trip,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}