import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LetterClientView from './LetterClientView';

export default async function LetterPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("Session error:", err);
  }
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/login');
  }

  const letter = await prisma.letter.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      receiver: true,
      replyTo: {
        include: {
          sender: true,
          receiver: true
        }
      },
      replies: {
        where: {
          OR: [
            { deliverAt: { lte: new Date() } },
            { deliverAt: null }
          ]
        },
        include: {
          sender: true,
          receiver: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!letter) {
    redirect('/'); // Not found
  }

  // Security: only sender or receiver (or parent letter participant) can view
  const isParticipant = letter.senderId === user.id || letter.receiverId === user.id;
  if (!isParticipant) {
    redirect('/');
  }

  // Format letter for client
  const formattedLetter = {
    id: letter.id.toString(),
    content: letter.content,
    images: letter.images || [],
    music: letter.music || null,
    musicTitle: letter.musicTitle || null,
    voices: letter.voices || [],
    voiceTitles: letter.voiceTitles || [],
    coverTitle: letter.coverTitle,
    coverSubtitle: letter.coverSubtitle,
    deliverAt: letter.deliverAt?.toISOString(),
    createdAt: letter.createdAt.toISOString(),
    sender: {
      id: letter.sender.id.toString(),
      email: letter.sender.email,
      name: letter.sender.name
    },
    receiver: letter.receiver ? {
      id: letter.receiver.id.toString(),
      email: letter.receiver.email,
      name: letter.receiver.name
    } : null,
    replyToId: letter.replyToId,
    replyTo: letter.replyTo ? {
      id: letter.replyTo.id.toString(),
      content: letter.replyTo.content,
      coverTitle: letter.replyTo.coverTitle,
      coverSubtitle: letter.replyTo.coverSubtitle,
      createdAt: letter.replyTo.createdAt.toISOString(),
      sender: {
        id: letter.replyTo.sender.id.toString(),
        name: letter.replyTo.sender.name,
        email: letter.replyTo.sender.email,
      }
    } : null,
    replies: (letter.replies || []).map(r => ({
      id: r.id.toString(),
      content: r.content,
      images: r.images || [],
      music: r.music || null,
      musicTitle: r.musicTitle || null,
      voices: r.voices || [],
      voiceTitles: r.voiceTitles || [],
      coverTitle: r.coverTitle,
      coverSubtitle: r.coverSubtitle,
      deliverAt: r.deliverAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      sender: {
        id: r.sender.id.toString(),
        email: r.sender.email,
        name: r.sender.name
      },
      receiver: r.receiver ? {
        id: r.receiver.id.toString(),
        email: r.receiver.email,
        name: r.receiver.name
      } : null,
    }))
  };

  return <LetterClientView letter={formattedLetter} currentUserId={user.id} />;
}
