import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
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

    const letter = await prisma.letter.findUnique({
      where: { id: params.id },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true, gender: true }
        },
        receiver: {
          select: { id: true, name: true, email: true, avatarUrl: true, gender: true }
        },
        replyTo: {
          include: {
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          }
        },
        replies: {
          include: {
            sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
            receiver: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!letter) {
      return NextResponse.json({ success: false, error: "Letter not found" }, { status: 404 });
    }

    // Security check: Only sender or receiver can view the letter
    if (letter.senderId !== currentUser.id && letter.receiverId !== currentUser.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error in GET /api/letters/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch letter' },
      { status: 500 }
    );
  }
}
