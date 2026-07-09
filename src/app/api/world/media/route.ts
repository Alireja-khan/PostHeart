import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'sent';
    const year = searchParams.get('year') || 'all';
    
    // Determine if we are fetching just letters, or specifically looking for images/music/voices within letters
    const mediaType = searchParams.get('media') || 'letters'; 

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, gender: true, partner: { select: { gender: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Base query conditions based on tabs
    let whereClause: any = {};

    switch (tab) {
      case 'sent':
        whereClause = { senderId: user.id };
        break;
      case 'received':
        whereClause = { receiverId: user.id };
        break;
      case 'pinned':
        whereClause = { 
          OR: [
            { senderId: user.id, isPinned: true },
            { receiverId: user.id, isPinned: true }
          ]
        };
        break;
      case 'special_me':
        whereClause = { senderId: user.id, isSpecial: true };
        break;
      case 'special_them':
        whereClause = { receiverId: user.id, isSpecial: true };
        break;
      default:
        whereClause = { senderId: user.id };
    }

    // Apply Year Filter
    if (year !== 'all') {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      whereClause.createdAt = {
        gte: startOfYear,
        lte: endOfYear
      };
    }

    // Apply Media Filter: If they only want letters with images, we filter out letters with empty image arrays
    if (mediaType === 'images') {
      whereClause.images = { isEmpty: false };
    } else if (mediaType === 'songs') {
      whereClause.music = { not: null };
    } else if (mediaType === 'voices') {
      whereClause.voices = { isEmpty: false };
    }

    // Fetch the raw letters
    const letters = await prisma.letter.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { name: true, avatarUrl: true } },
        receiver: { select: { name: true, avatarUrl: true } }
      }
    });

    // Extract available years for the tabs
    // Note: In a production app with huge data, this should be a distinct query.
    // For now, we fetch all letters for the user to find the years, or just extract from the returned result.
    // We will extract from the returned result for simplicity, but that means "Years" will only show years present in the current Tab.
    const allUserLetters = await prisma.letter.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }]
      },
      select: { createdAt: true }
    });
    
    const yearsSet = new Set<string>();
    allUserLetters.forEach(l => yearsSet.add(l.createdAt.getFullYear().toString()));
    const availableYears = Array.from(yearsSet).sort((a, b) => parseInt(b) - parseInt(a));

    return NextResponse.json({
      success: true,
      data: letters,
      years: availableYears,
      userGender: user?.gender || null,
      partnerGender: user?.partner?.gender || null,
      currentUserId: user?.id
    });

  } catch (error) {
    console.error('Error fetching media letters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isPinned, isSpecial, specialFor } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure the letter belongs to the user
    const letter = await prisma.letter.findFirst({
      where: {
        id: id,
        OR: [{ senderId: user.id }, { receiverId: user.id }]
      }
    });

    if (!letter) {
      return NextResponse.json({ error: 'Letter not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.letter.update({
      where: { id: id },
      data: {
        isPinned: isPinned !== undefined ? isPinned : letter.isPinned,
        isSpecial: isSpecial !== undefined ? isSpecial : letter.isSpecial,
        specialFor: specialFor !== undefined ? specialFor : letter.specialFor
      }
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error('Error updating media letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
