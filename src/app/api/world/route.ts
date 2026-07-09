import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const userId = currentUser.id;

    // Fetch sent letters
    const sentLetters = await prisma.letter.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch received letters (only count delivered letters for received stats)
    const receivedLetters = await prisma.letter.findMany({
      where: { 
        receiverId: userId,
        status: 'DELIVERED'
      },
      orderBy: { createdAt: 'desc' }
    });

    // 1. Total Music sent
    const musicSentCount = sentLetters.filter(l => l.music && l.music.trim() !== "").length;

    // 2. Total Music received
    const musicReceivedCount = receivedLetters.filter(l => l.music && l.music.trim() !== "").length;

    // 3. Total Images sent
    const imagesSentCount = sentLetters.reduce((sum, l) => sum + (l.images?.length || 0), 0);

    // 4. Total Images received
    const imagesReceivedCount = receivedLetters.reduce((sum, l) => sum + (l.images?.length || 0), 0);

    // 5. Total voice note sent
    const voicesSentCount = sentLetters.reduce((sum, l) => sum + (l.voices?.length || 0), 0);

    // 6. Total Voice note received
    const voicesReceivedCount = receivedLetters.reduce((sum, l) => sum + (l.voices?.length || 0), 0);

    // 7. Total letters sent
    const lettersSentCount = sentLetters.length;

    // 8. Total letters received
    const lettersReceivedCount = receivedLetters.length;

    // 9. Last letter sent time/date
    const lastLetterSent = sentLetters[0] ? sentLetters[0].createdAt : null;

    // 10. Last letter received time/date
    const lastLetterReceived = receivedLetters[0] ? (receivedLetters[0].deliverAt || receivedLetters[0].createdAt) : null;

    // 11. Extra interesting facts:
    // Total words written in all sent letters
    const totalWordsWritten = sentLetters.reduce((sum, l) => {
      const words = l.content ? l.content.trim().split(/\s+/).filter(Boolean).length : 0;
      return sum + words;
    }, 0);

    // Days since the first letter
    let daysConnected = 0;
    const allLetters = [...sentLetters, ...receivedLetters].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    if (allLetters.length > 0) {
      const firstLetterDate = allLetters[0].createdAt;
      const msDiff = Date.now() - firstLetterDate.getTime();
      daysConnected = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    }

    // Letters in transit
    const lettersInTransitCount = await prisma.letter.count({
      where: {
        senderId: userId,
        status: 'IN_TRANSIT'
      }
    });

    // Average delivery delay of sent letters (excluding drafts if any)
    const averageDelayHours = sentLetters.length > 0
      ? Math.round(sentLetters.reduce((sum, l) => sum + (l.delayHours || 0), 0) / sentLetters.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        worldImage: currentUser.worldImage || null,
        stats: {
          musicSent: musicSentCount,
          musicReceived: musicReceivedCount,
          imagesSent: imagesSentCount,
          imagesReceived: imagesReceivedCount,
          voicesSent: voicesSentCount,
          voicesReceived: voicesReceivedCount,
          lettersSent: lettersSentCount,
          lettersReceived: lettersReceivedCount,
        },
        facts: {
          lastLetterSent,
          lastLetterReceived,
          totalWordsWritten,
          daysConnected,
          lettersInTransit: lettersInTransitCount,
          averageDelayHours
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/world:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { worldImage } = body;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { worldImage }
    });

    return NextResponse.json({
      success: true,
      message: "Dashboard photo updated successfully",
      worldImage: user.worldImage
    });
  } catch (error) {
    console.error('Error in PUT /api/world:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dashboard photo' },
      { status: 500 }
    );
  }
}
