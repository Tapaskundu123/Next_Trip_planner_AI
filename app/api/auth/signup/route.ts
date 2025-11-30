import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface Input {
  name: string;
  email: string;
  password: string;
}

interface Payload {
  name: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password }: Input = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "All fields are required",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userDetails = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log(userDetails)

    // JWT Payload
    const payload: Payload = { name, email };

    // Create token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
      expiresIn: "1d",
    });

     // Response with cookie
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV==="production",      // must be false in localhost
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
