import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LetterClientView from './LetterClientView';

export default async function LetterPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/login');
  }

  const letter = await prisma.letter.findUnique({
    where: { id: params.id },
    include: {
      sender: true,
      receiver: true
    }
  });

  if (!letter) {
    redirect('/'); // Not found
  }

  // Security: only sender or receiver can view
  if (letter.senderId !== user.id && letter.receiverId !== user.id) {
    redirect('/');
  }

  // Format letter for client
  const formattedLetter = {
    id: letter.id.toString(),
    content: letter.content,
    images: letter.images || [],
    music: letter.music || null,
    voices: letter.voices || [],
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
  };

  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12">
      <LetterClientView letter={formattedLetter} />
    </div>
  );
}
