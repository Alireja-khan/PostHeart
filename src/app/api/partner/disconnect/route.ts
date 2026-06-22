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

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser || !currentUser.partnerId) {
      return NextResponse.json({ message: "You don't have a partner to disconnect from." }, { status: 400 });
    }

    const partnerId = currentUser.partnerId;

    // Check if a disconnect request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: partnerId, status: "PENDING", type: "DISCONNECT" },
          { senderId: partnerId, receiverId: currentUser.id, status: "PENDING", type: "DISCONNECT" }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json({ message: "A disconnect request is already pending." }, { status: 400 });
    }

    // Create a pending disconnect request
    await prisma.connectionRequest.create({
      data: {
        senderId: currentUser.id,
        receiverId: partnerId,
        status: "PENDING",
        type: "DISCONNECT"
      }
    });

    // Notify the partner
    await prisma.notification.create({
      data: {
        userId: partnerId,
        title: "Disconnect Request",
        message: `${currentUser.name || currentUser.email} has requested to disconnect. Please review in your notifications.`,
        type: "SYSTEM"
      }
    });

    return NextResponse.json({ message: "Disconnect request sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Disconnect request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
