import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const letters = await prisma.letter.findMany({
      include: {
        sender: true,
        receiver: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: letters.length,
      data: letters,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch letters' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, receiverName, delayHours } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Grab or seed demo sender
    let sender = await prisma.user.findFirst();
    if (!sender) {
      sender = await prisma.user.create({
        data: {
          name: 'Sarah',
          email: 'sarah@example.com'
        }
      });
    }

    // Find or create receiver
    let receiver = null;
    if (receiverName) {
      const trimmedName = receiverName.trim();
      receiver = await prisma.user.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' } }
      });
      if (!receiver) {
        receiver = await prisma.user.create({
          data: {
            name: trimmedName,
            email: `${trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}@example.com`
          }
        });
      }
    }

    const hours = parseInt(delayHours) || 24;
    const deliverAt = new Date(Date.now() + hours * 3600 * 1000);

    const letter = await prisma.letter.create({
      data: {
        content,
        delayHours: hours,
        deliverAt,
        status: 'IN_TRANSIT',
        senderId: sender.id,
        receiverId: receiver ? receiver.id : null,
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

