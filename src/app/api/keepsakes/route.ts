import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) return NextResponse.json({ message: "User not found" }, { status: 404 })

    const targetUserIds = [currentUser.id];
    if (currentUser.partnerId) {
      targetUserIds.push(currentUser.partnerId);
    }

    const keepsakes = await prisma.keepsakeItem.findMany({
      where: {
        userId: { in: targetUserIds }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ success: true, data: keepsakes });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    
    const user = await prisma.user.findUnique({ where: { email: session.user.email }})
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 })

    const body = await req.json();
    
    const keepsake = await prisma.keepsakeItem.create({
      data: {
        type: body.type,
        title: body.title,
        image: body.image,
        note: body.note,
        date: body.date,
        seat: body.seat,
        memo: body.memo,
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, data: keepsake });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID missing" }, { status: 400 });

    await prisma.keepsakeItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
