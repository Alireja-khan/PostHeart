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

    const items = await prisma.corkboardItem.findMany({
      where: {
        userId: { in: targetUserIds }
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ success: true, data: items });
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
    
    // We can accept an array of items (sync all) or single.
    if (Array.isArray(body)) {
      // For a quick sync, delete old ones and insert new. 
      // This is simple but effectively saves the board state.
      const targetUserIds = [user.id];
      if (user.partnerId) targetUserIds.push(user.partnerId);

      await prisma.corkboardItem.deleteMany({
        where: { userId: { in: targetUserIds } }
      });

      const creations = body.map((item: any) => ({
        type: item.type,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        content: item.content,
        image: item.image,
        color: item.color,
        userId: user.id
      }));

      if (creations.length > 0) {
        await prisma.corkboardItem.createMany({ data: creations });
      }

      const items = await prisma.corkboardItem.findMany({
        where: { userId: { in: targetUserIds } }
      });
      return NextResponse.json({ success: true, data: items });
    } else {
      const item = await prisma.corkboardItem.create({
        data: {
          type: body.type,
          x: body.x,
          y: body.y,
          rotation: body.rotation,
          content: body.content,
          image: body.image,
          color: body.color,
          userId: user.id
        }
      });
      return NextResponse.json({ success: true, data: item });
    }

  } catch (error) {
    console.error("Board sync err:", error);
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

    await prisma.corkboardItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
