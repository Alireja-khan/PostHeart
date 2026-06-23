import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

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

    const letters = await prisma.letter.findMany({
      where: {
        OR: [
          { senderId: currentUser.id },
          { receiverId: currentUser.id }
        ]
      },
      include: {
        sender: true,
        receiver: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      count: letters.length,
      data: letters,
    });
  } catch (error) {
    console.error('Error in GET /api/letters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch letters' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sender = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!sender) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const body = await req.json();
    const { content, delayHours } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const hours = parseInt(delayHours) || 24;
    const deliverAt = new Date(Date.now() + hours * 3600 * 1000);

    let finalReceiverId = sender.partnerId;
    
    // Fallback: If not partnered, try to find a user by name or email if provided
    if (!finalReceiverId && body.receiverName) {
      const fallbackReceiver = await prisma.user.findFirst({
        where: { name: { equals: body.receiverName, mode: 'insensitive' } }
      });
      if (fallbackReceiver) {
        finalReceiverId = fallbackReceiver.id;
      }
    }

    // Check if the sender already has a letter in transit
    const activeLetter = await prisma.letter.findFirst({
      where: {
        senderId: sender.id,
        status: 'IN_TRANSIT'
      }
    });

    if (activeLetter) {
      return NextResponse.json(
        { success: false, error: 'You already have a letter in transit. Please wait for it to be delivered before sending another one.' },
        { status: 400 }
      );
    }

    const letter = await prisma.letter.create({
      data: {
        content,
        delayHours: hours,
        deliverAt,
        status: 'IN_TRANSIT',
        senderId: sender.id,
        receiverId: finalReceiverId, 
      },
      include: {
        sender: true,
        receiver: true
      }
    });

    return NextResponse.json({
      success: true,
      data: letter
    });
  } catch (error: any) {
    console.error('Error in POST /api/letters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create letter' },
      { status: 500 }
    );
  }
}
