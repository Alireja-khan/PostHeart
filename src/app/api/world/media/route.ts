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
        if (mediaType === 'images') {
          whereClause = { 
            OR: [
              { senderId: user.id, pinnedImages: { isEmpty: false } },
              { receiverId: user.id, pinnedImages: { isEmpty: false } }
            ]
          };
        } else if (mediaType === 'voices') {
          whereClause = { 
            OR: [
              { senderId: user.id, pinnedVoices: { isEmpty: false } },
              { receiverId: user.id, pinnedVoices: { isEmpty: false } }
            ]
          };
        } else {
          whereClause = { 
            OR: [
              { senderId: user.id, isPinned: true },
              { receiverId: user.id, isPinned: true }
            ]
          };
        }
        break;
      case 'special_me':
        if (mediaType === 'images') {
          whereClause = { senderId: user.id, specialImages: { isEmpty: false } };
        } else if (mediaType === 'voices') {
          whereClause = { senderId: user.id, specialVoices: { isEmpty: false } };
        } else {
          whereClause = { senderId: user.id, isSpecial: true };
        }
        break;
      case 'special_them':
        if (mediaType === 'images') {
          whereClause = { receiverId: user.id, specialImages: { isEmpty: false } };
        } else if (mediaType === 'voices') {
          whereClause = { receiverId: user.id, specialVoices: { isEmpty: false } };
        } else {
          whereClause = { receiverId: user.id, isSpecial: true };
        }
        break;
      default:
        // Check if tab is a custom folder ID
        if (tab.length === 24) { // MongoDB ObjectId length
          const folder = await prisma.folder.findUnique({ where: { id: tab } });
          if (folder && folder.userId === user.id) {
            if (mediaType === 'letters') {
              whereClause = { id: { in: folder.items } };
            } else if (mediaType === 'images') {
              whereClause = { images: { hasSome: folder.items } };
            } else if (mediaType === 'songs') {
              whereClause = { music: { in: folder.items } };
            } else if (mediaType === 'voices') {
              whereClause = { voices: { hasSome: folder.items } };
            }
          } else {
             whereClause = { senderId: user.id };
          }
        } else {
          whereClause = { senderId: user.id };
        }
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

    const search = searchParams.get('search') || '';

    // Fetch the raw letters
    let letters = await prisma.letter.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { name: true, avatarUrl: true } },
        receiver: { select: { name: true, avatarUrl: true } }
      }
    });

    if (search) {
      const s = search.toLowerCase();
      letters = letters.filter(l => 
        (l.content && l.content.toLowerCase().includes(s)) ||
        (l.coverTitle && l.coverTitle.toLowerCase().includes(s)) ||
        (l.coverSubtitle && l.coverSubtitle.toLowerCase().includes(s)) ||
        (l.musicTitle && l.musicTitle.toLowerCase().includes(s)) ||
        (l.voiceTitles && l.voiceTitles.some(vt => vt.toLowerCase().includes(s)))
      );
    }

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

    const { id, isPinned, isSpecial, specialFor, imageUrl, togglePinImage, toggleSpecialImage, voiceUrl, togglePinVoice, toggleSpecialVoice } = await request.json();

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

    let updateData: any = {
      isPinned: isPinned !== undefined ? isPinned : letter.isPinned,
      isSpecial: isSpecial !== undefined ? isSpecial : letter.isSpecial,
      specialFor: specialFor !== undefined ? specialFor : letter.specialFor
    };

    if (togglePinImage && imageUrl) {
      const currentPinned = letter.pinnedImages || [];
      if (currentPinned.includes(imageUrl)) {
        updateData.pinnedImages = currentPinned.filter((url: string) => url !== imageUrl);
      } else {
        updateData.pinnedImages = [...currentPinned, imageUrl];
      }
    }

    if (toggleSpecialImage && imageUrl) {
      const currentSpecial = letter.specialImages || [];
      if (currentSpecial.includes(imageUrl)) {
        updateData.specialImages = currentSpecial.filter((url: string) => url !== imageUrl);
      } else {
        updateData.specialImages = [...currentSpecial, imageUrl];
      }
    }

    if (togglePinVoice && voiceUrl) {
      const currentPinned = letter.pinnedVoices || [];
      if (currentPinned.includes(voiceUrl)) {
        updateData.pinnedVoices = currentPinned.filter((url: string) => url !== voiceUrl);
      } else {
        updateData.pinnedVoices = [...currentPinned, voiceUrl];
      }
    }

    if (toggleSpecialVoice && voiceUrl) {
      const currentSpecial = letter.specialVoices || [];
      if (currentSpecial.includes(voiceUrl)) {
        updateData.specialVoices = currentSpecial.filter((url: string) => url !== voiceUrl);
      } else {
        updateData.specialVoices = [...currentSpecial, voiceUrl];
      }
    }

    const updated = await prisma.letter.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error('Error updating media letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
