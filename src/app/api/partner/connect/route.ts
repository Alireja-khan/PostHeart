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

    // Check if user has a partner
    if (currentUser.partnerId) {
      return NextResponse.json({ message: "You already have a partner" }, { status: 400 });
    }

    if (partner.partnerId) {
      return NextResponse.json({ message: "This user already has a partner" }, { status: 400 });
    }

    // Check if a request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: partner.id, status: "PENDING" },
          { senderId: partner.id, receiverId: currentUser.id, status: "PENDING" }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "A connection request is already pending between you two" }, { status: 400 });
    }

    // Create a pending connection request
    await prisma.connectionRequest.create({
      data: {
        senderId: currentUser.id,
        receiverId: partner.id,
        status: "PENDING"
      }
    });

    // Notify the partner
    await prisma.notification.create({
      data: {
        userId: partner.id,
        title: "New Connection Request",
        message: `${currentUser.name || currentUser.email} wants to connect with you!`,
        type: "CONNECTION_REQUEST"
      }
    });

    return NextResponse.json({ message: "Connection request sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Partner connect error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
