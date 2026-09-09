import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { Trip } from "@/models/TripModel";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "User not logged in" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as { id: string; email: string };

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Trip ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedTrip = await Trip.findOneAndDelete({
      _id: id,
      user: decoded.id,
    });

    if (!deletedTrip) {
      return NextResponse.json(
        { success: false, message: "Trip not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete trip", error: error.message },
      { status: 500 }
    );
  }
}
