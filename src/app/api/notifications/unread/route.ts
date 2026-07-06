import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { checkAndDeliverLetters } from "@/lib/delivery";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ unread: 0 }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ unread: 0 }, { status: 404 });

    // Deliver any in-transit letters and create notifications
    await checkAndDeliverLetters(user.id);

    const [unreadNotifications, pendingRequests] = await Promise.all([
      prisma.notification.count({
        where: { userId: user.id, read: false }
      }),
      prisma.connectionRequest.count({
        where: { receiverId: user.id, status: "PENDING" }
      })
    ]);

    return NextResponse.json({ unread: unreadNotifications + pendingRequests }, { status: 200 });
  } catch (error) {
    console.error("Fetch unread notifications error:", error);
    return NextResponse.json({ unread: 0 }, { status: 500 });
  }
}
