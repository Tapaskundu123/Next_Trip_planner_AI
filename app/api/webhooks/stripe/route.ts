import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/UserModel";
import stripe from "@/lib/stripe-server";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 }
        );
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            await connectDB();

            // Get user email from session metadata
            const userEmail = session.metadata?.userEmail;
            const userId = session.metadata?.userId;

            if (!userEmail) {
                console.error("No user email in session metadata");
                return NextResponse.json(
                    { error: "Missing user email" },
                    { status: 400 }
                );
            }

            // Update user premium status
            const user = await User.findOne({ email: userEmail });

            if (!user) {
                console.error("User not found:", userEmail);
                return NextResponse.json(
                    { error: "User not found" },
                    { status: 404 }
                );
            }

            // Update user with premium details
            user.isPurchased = true;
            user.purchasedAmount = (session.amount_total || 0) / 100; // Convert from paise to rupees
            user.stripeSessionId = session.id;
            user.purchasedAt = new Date();

            await user.save();

            console.log(`✅ Premium activated for user: ${userEmail}`);

            return NextResponse.json({
                success: true,
                message: "Premium status updated",
            });
        } catch (error) {
            console.error("Error updating user:", error);
            return NextResponse.json(
                { error: "Failed to update user" },
                { status: 500 }
            );
        }
    }

    // Return 200 for other event types
    return NextResponse.json({ received: true });
}
