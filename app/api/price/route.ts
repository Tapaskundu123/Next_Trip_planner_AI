import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import stripe from "@/lib/stripe-server";

// ✅ POST: Save pricing
export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

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

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Premium Plan - Trip Planner AI",
              description: "Unlimited trip planning with AI assistance",
            },
            unit_amount: amount * 100, // ₹ → paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        userEmail: decoded.email, // Store for webhook
        userId: user._id.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}