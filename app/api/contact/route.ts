import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/contact.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  
    try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    await Contact.create({ name, email, message });

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API Error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
