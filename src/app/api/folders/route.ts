import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (!type) return NextResponse.json({ error: 'Missing folder type' }, { status: 400 });

    const folders = await prisma.folder.findMany({
      where: { userId: user.id, type },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(folders);
  } catch (err) {
    console.error('Folders GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { name, type } = body;

    if (!name || !type) return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });

    // Get the max order for this type
    const lastFolder = await prisma.folder.findFirst({
      where: { userId: user.id, type },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = lastFolder ? lastFolder.order + 1 : 0;

    const folder = await prisma.folder.create({
      data: {
        name,
        type,
        order: newOrder,
        userId: user.id,
        items: []
      }
    });

    return NextResponse.json(folder);
  } catch (err) {
    console.error('Folders POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('id');

    if (!folderId) return NextResponse.json({ error: 'Missing folder ID' }, { status: 400 });

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: user.id }
    });

    if (!folder) return NextResponse.json({ error: 'Folder not found or unauthorized' }, { status: 404 });

    await prisma.folder.delete({
      where: { id: folderId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Folders DELETE error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
