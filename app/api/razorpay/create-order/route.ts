import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/UserModel";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { amount = 499 } = await req.json();

    // Check authentication
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please log in to upgrade your plan" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as { id: string; email: string };

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User account not found" },
        { status: 404 }
      );
    }

    const amountInPaise = amount * 100; // e.g. 499 * 100 = 49900 paise
    const razorpay = getRazorpayInstance();

    // If real Razorpay instance is available (user has configured valid keys)
    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${user._id.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
          notes: {
            userId: user._id.toString(),
            userEmail: user.email,
            plan: "Professional Plan",
          },
        });

        return NextResponse.json({
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
          isDevelopmentMode: false,
          user: {
            name: user.name,
            email: user.email,
          },
        });
      } catch (rzpErr: any) {
        console.warn("Razorpay API error, falling back to development mode:", rzpErr.message);
      }
    }

    // ── Development Mode Sandbox Order ──
    const devOrderId = `order_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      orderId: devOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_devmode",
      isDevelopmentMode: true,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}
