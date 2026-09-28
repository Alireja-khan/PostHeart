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
      data: letters.map(letter => ({
        ...letter,
        isSender: letter.senderId === currentUser.id
      })),
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
    const { content, delayMinutes, images, music, musicTitle, voices, voiceTitles, coverTitle, coverSubtitle } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const minutes = parseInt(delayMinutes) || 24 * 60;
    const deliverAt = new Date(Date.now() + minutes * 60 * 1000);
    const storedDelayHours = Math.round(minutes / 60);

    let finalReceiverId = sender.partnerId;
    
    // Support replying to an existing letter
    let parentLetter = null;
    if (body.replyToId) {
      parentLetter = await prisma.letter.findUnique({
        where: { id: body.replyToId },
        include: { sender: true, receiver: true }
      });
      if (parentLetter) {
        if (parentLetter.senderId !== sender.id) {
          finalReceiverId = parentLetter.senderId;
        } else if (parentLetter.receiverId && parentLetter.receiverId !== sender.id) {
          finalReceiverId = parentLetter.receiverId;
        }
      }
    }
    
    // Fallback: If not partnered, try to find a user by name or email if provided
    if (!finalReceiverId && body.receiverName) {
      const fallbackReceiver = await prisma.user.findFirst({
        where: { name: { equals: body.receiverName, mode: 'insensitive' } }
      });
      if (fallbackReceiver) {
        finalReceiverId = fallbackReceiver.id;
      }
    }

    // Check if the sender already has a letter TRULY in transit (not yet delivered)
    const activeLetter = await prisma.letter.findFirst({
      where: {
        senderId: sender.id,
        status: 'IN_TRANSIT',
        deliverAt: { gt: new Date() }
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
        images: images || [],
        music: music || null,
        musicTitle: musicTitle || null,
        voices: voices || [],
        voiceTitles: voiceTitles || [],
        coverTitle: coverTitle || null,
        coverSubtitle: coverSubtitle || null,
        delayHours: storedDelayHours,
        deliverAt,
        status: 'IN_TRANSIT',
        senderId: sender.id,
        receiverId: finalReceiverId,
        replyToId: parentLetter ? parentLetter.id : null,
      },
      include: {
        sender: true,
        receiver: true,
        replyTo: true,
      }
    });

    if (finalReceiverId) {
      try {
        await prisma.notification.create({
          data: {
            userId: finalReceiverId,
            type: parentLetter ? 'LETTER_REPLY' : 'NEW_LETTER',
            title: parentLetter ? 'Letter Reply' : 'New Letter',
            message: parentLetter 
              ? `${sender.name || 'Your love'} sent a reply to your letter!` 
              : `${sender.name || 'Your love'} sent you a letter!`,
          }
        });
      } catch (notifErr) {
        console.error('Failed to create notification', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error in POST /api/letters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create letter' },
      { status: 500 }
    );
  }
}
