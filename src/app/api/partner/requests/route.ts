import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const incomingRequests = await prisma.connectionRequest.findMany({
      where: { receiverId: user.id, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    const outgoingRequests = await prisma.connectionRequest.findMany({
      where: { senderId: user.id, status: "PENDING" },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return NextResponse.json({ incomingRequests, outgoingRequests }, { status: 200 });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !["ACCEPT", "DECLINE"].includes(action)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const request = await prisma.connectionRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== user.id) {
      return NextResponse.json({ message: "Request not found or unauthorized" }, { status: 404 });
    }

    if (request.status !== "PENDING") {
      return NextResponse.json({ message: "Request is no longer pending" }, { status: 400 });
    }

    if (action === "ACCEPT") {
      // Update request
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" }
      });

      if (request.type === "DISCONNECT") {
        // Disconnect users
        await prisma.user.update({
          where: { id: user.id },
          data: { partnerId: null }
        });
        await prisma.user.update({
          where: { id: request.senderId },
          data: { partnerId: null }
        });

        // Notify sender
        await prisma.notification.create({
          data: {
            userId: request.senderId,
            title: "Disconnected",
            message: `${user.name || user.email} has accepted your disconnect request. You are no longer partners.`,
            type: "SYSTEM"
          }
        });

        return NextResponse.json({ message: "Disconnected successfully" }, { status: 200 });
      } else {
        // Connect users
        await prisma.user.update({
          where: { id: user.id },
          data: { partnerId: request.senderId }
        });
        await prisma.user.update({
          where: { id: request.senderId },
          data: { partnerId: user.id }
        });

        // Notify sender
        await prisma.notification.create({
          data: {
            userId: request.senderId,
            title: "Connection Accepted!",
            message: `${user.name || user.email} has accepted your connection request.`,
            type: "CONNECTION_ACCEPTED"
          }
        });

        return NextResponse.json({ message: "Connection accepted" }, { status: 200 });
      }
    } else {
      // Decline
      await prisma.connectionRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" }
      });
      
      if (request.type === "DISCONNECT") {
        await prisma.notification.create({
          data: {
            userId: request.senderId,
            title: "Disconnect Declined",
            message: `${user.name || user.email} has declined your disconnect request.`,
            type: "SYSTEM"
          }
        });
      } else {
        await prisma.notification.create({
          data: {
            userId: request.senderId,
            title: "Connection Declined",
            message: `${user.name || user.email} has declined your connection request.`,
            type: "SYSTEM"
          }
        });
      }

      return NextResponse.json({ message: "Request declined" }, { status: 200 });
    }
  } catch (error) {
    console.error("Update request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
