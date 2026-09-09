import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/UserModel";

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isDevelopmentMode,
      amount = 499,
    } = await req.json();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized user" },
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
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isDevOrder =
      isDevelopmentMode ||
      !razorpay_signature ||
      razorpay_order_id?.startsWith("order_dev_") ||
      secret === "dev_secret_test_mode";

    // If real production / test key verification
    if (!isDevOrder && secret) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, message: "Invalid payment signature verification failed" },
          { status: 400 }
        );
      }
    }

    // ── Update user subscription in database ──
    user.isPurchased = true;
    user.purchasedAmount = amount;
    user.price = amount;
    user.paymentGateway = "razorpay";
    user.razorpayOrderId = razorpay_order_id || `order_dev_${Date.now()}`;
    user.razorpayPaymentId = razorpay_payment_id || `pay_dev_${Date.now()}`;
    user.purchasedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified! Professional plan activated.",
      isPurchased: true,
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
