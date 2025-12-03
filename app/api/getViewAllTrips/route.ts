import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Trip } from "@/models/Trip.model";

interface DecodedData {
  id: string;
  email: string;
}

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "User not logged in" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedData;

    const email = decoded.email;

    // 3️⃣ Fetch saved trips using email
    const savedTrips = await Trip.find({ email: email });

    if (!savedTrips || savedTrips.length === 0) {
      return NextResponse.json(
        { success: false, message: "No trips found" },
        { status: 404 }
      );
    }

    // 4️⃣ Send response
    return NextResponse.json({
      success: true,
      trips: savedTrips,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired token",
        error: error.message,
      },
      { status: 401 }
    );
  }
}
