import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User.model.ts";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// ✅ POST: Save pricing
export async function POST(req: NextRequest) {
  try {
    const { pricing } = await req.json();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as { email: string };

    await connectDB();

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.price = pricing;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Price saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}