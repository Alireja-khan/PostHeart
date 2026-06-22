import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { partnerEmail, partnerId } = await req.json();

    if (!partnerEmail && !partnerId) {
      return NextResponse.json({ message: "Partner email or ID is required" }, { status: 400 });
    }

    if (partnerEmail === session.user.email) {
      return NextResponse.json({ message: "You cannot connect with yourself" }, { status: 400 });
    }

    const partner = await prisma.user.findUnique({
      where: partnerId ? { id: partnerId } : { email: partnerEmail }
    });

    if (partner?.email === session.user.email) {
      return NextResponse.json({ message: "You cannot connect with yourself" }, { status: 400 });
    }

    if (!partner) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Connect both users to each other
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { partnerId: partner.id }
    });

    await prisma.user.update({
      where: { id: partner.id },
      data: { partnerId: currentUser.id }
    });

    return NextResponse.json({ message: "Successfully connected with partner" }, { status: 200 });
  } catch (error) {
    console.error("Partner connect error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
