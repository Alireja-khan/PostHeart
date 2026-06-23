import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Find the first IN_TRANSIT letter where the current user is either sender or receiver
    const inTransitLetter = await prisma.letter.findFirst({
      where: {
        status: 'IN_TRANSIT',
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ]
      },
      orderBy: {
        deliverAt: 'asc'
      },
      select: {
        id: true,
        createdAt: true,
        deliverAt: true,
        delayHours: true,
        senderId: true,
        receiverId: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: inTransitLetter ? {
        ...inTransitLetter,
        isSender: inTransitLetter.senderId === currentUser.id
      } : null,
    });
  } catch (error) {
    console.error('Error in GET /api/letters/in-transit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch in-transit letter' },
      { status: 500 }
    );
  }
}
