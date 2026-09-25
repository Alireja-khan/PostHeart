import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: "A valid dispatch address (email) is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json({ message: "Please provide a valid email format." }, { status: 400 });
    }

    // Validate password security
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ message: "Passcode must be at least 6 characters long." }, { status: 400 });
    }

    if (password.length > 128) {
      return NextResponse.json({ message: "Passcode cannot exceed 128 characters." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json({ message: "A sealed mailbox already exists with this dispatch address." }, { status: 400 });
    }

    // Hash password with 12 salt rounds for enhanced cryptographic security
    const hashedPassword = await bcrypt.hash(password, 12);

    const sanitizedName = typeof name === 'string' && name.trim().length > 0
      ? name.trim().slice(0, 50)
      : null;

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ 
      message: "Sanctuary created successfully.",
      user 
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An unexpected error occurred while sealing your mailbox." }, { status: 500 });
  }
}
