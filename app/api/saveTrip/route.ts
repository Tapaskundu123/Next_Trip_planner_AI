import { NextRequest, NextResponse } from "next/server";
import { Trip } from "@/models/Trip.model";
import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";

interface SaveTripRequest {
  destination: string;
  duration: string;
  origin: string;
  budget: string;
  group_size: string;
  hotels: Array<any>;
  itinerary: Array<any>;
}

export async function POST(req: NextRequest) {
  try {
    const body:SaveTripRequest = await req.json();

    // Check auth
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "User not verified",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    const userId = decoded.id;

    await connectDB();

    const savedTrip = await Trip.create({
      user: userId,
      destination: body.destination,
      duration: body.duration,
      origin: body.origin,
      budget: body.budget,
      group_size: body.group_size,
      hotels: body.hotels,
      itinerary: body.itinerary,
    });

    return NextResponse.json({
      success: true,
      message: "Trip saved successfully",
      data: savedTrip,
    });
  } catch (error) {
    console.log("Save Trip Error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to save trip",
      error,
    });
  }
}
