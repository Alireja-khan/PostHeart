import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { folderId, itemId, action } = body; // action: 'add' or 'remove'

    if (!folderId || !itemId || !action) {
      return NextResponse.json({ error: 'folderId, itemId, and action are required' }, { status: 400 });
    }

    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: user.id }
    });

    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 });

    let newItems = [...folder.items];

    if (action === 'add') {
      if (!newItems.includes(itemId)) {
        newItems.push(itemId);
      }
    } else if (action === 'remove') {
      newItems = newItems.filter(id => id !== itemId);
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be add or remove' }, { status: 400 });
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folder.id },
      data: { items: newItems }
    });

    return NextResponse.json(updatedFolder);
  } catch (err) {
    console.error('Folders Items POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
