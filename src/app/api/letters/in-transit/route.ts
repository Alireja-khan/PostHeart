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
      include: { partner: true }
    })

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Find the first IN_TRANSIT letter where the current user is either sender or receiver AND it hasn't arrived yet
    const inTransitLetter = await prisma.letter.findFirst({
      where: {
        status: 'IN_TRANSIT',
        deliverAt: { gt: new Date() },
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
        sender: { select: { gender: true } },
        receiver: { select: { gender: true } }
      }
    });

    // Find recent letters sent by the current user to help detect already-posted drafts
    const recentSentLetters = await prisma.letter.findMany({
      where: { senderId: currentUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        content: true,
        coverTitle: true,
        coverSubtitle: true,
        receiver: { select: { name: true } },
      }
    });

    const lastSentLetter = recentSentLetters[0] || null;

    return NextResponse.json({
      success: true,
      userGender: currentUser.gender,
      partnerGender: currentUser.partner?.gender,
      data: inTransitLetter ? {
        id: inTransitLetter.id,
        createdAt: inTransitLetter.createdAt,
        deliverAt: inTransitLetter.deliverAt,
        delayHours: inTransitLetter.delayHours,
        senderId: inTransitLetter.senderId,
        receiverId: inTransitLetter.receiverId,
        isSender: inTransitLetter.senderId === currentUser.id,
        senderGender: inTransitLetter.sender?.gender,
        receiverGender: inTransitLetter.receiver?.gender
      } : null,
      lastSentLetter: lastSentLetter ? {
        id: lastSentLetter.id,
        createdAt: lastSentLetter.createdAt,
        content: lastSentLetter.content,
        receiverName: lastSentLetter.receiver?.name || '',
      } : null,
      recentSentLetters: recentSentLetters.map(l => ({
        id: l.id,
        createdAt: l.createdAt,
        content: l.content,
        coverTitle: l.coverTitle,
        coverSubtitle: l.coverSubtitle,
        receiverName: l.receiver?.name || '',
      })),
    });
  } catch (error) {
    console.error('Error in GET /api/letters/in-transit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch in-transit letter' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
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

    // Delete the active IN_TRANSIT letter where the current user is the SENDER
    const activeLetter = await prisma.letter.findFirst({
      where: {
        status: 'IN_TRANSIT',
        senderId: currentUser.id
      }
    });

    if (!activeLetter) {
      return NextResponse.json({ success: false, error: "No active letter found to cancel" }, { status: 404 });
    }

    await prisma.letter.delete({
      where: { id: activeLetter.id }
    });

    return NextResponse.json({ success: true, message: "Letter cancelled" });
  } catch (error) {
    console.error('Error in DELETE /api/letters/in-transit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel letter' },
      { status: 500 }
    );
  }
}
