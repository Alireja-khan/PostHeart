import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'
import ClientDesk from '@/components/ClientDesk'

const prisma = new PrismaClient()

export default async function Home() {
  let session = null;
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error("Session retrieval error:", err)
  }
  
  if (!session?.user?.email) {
    return (
      <main className="w-full h-full">
        <ClientDesk initialLetters={[]} />
      </main>
    )
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser) {
    return (
      <main className="w-full h-full">
        <ClientDesk initialLetters={[]} />
      </main>
    )
  }

  const letters = await prisma.letter.findMany({
    where: {
      AND: [
        {
          OR: [
            { senderId: currentUser.id },
            { receiverId: currentUser.id }
          ]
        },
        {
          OR: [
            { deliverAt: { lte: new Date() } },
            { deliverAt: null }
          ]
        }
      ]
    },
    include: {
      sender: true,
      receiver: true
    },
    orderBy: {
      deliverAt: 'desc'
    }
  })

  const formattedLetters = letters.map(letter => ({
    id: letter.id.toString(),
    content: letter.content,
    images: letter.images || [],
    music: letter.music || null,
    musicTitle: letter.musicTitle || null,
    voices: letter.voices || [],
    voiceTitles: letter.voiceTitles || [],
    coverTitle: letter.coverTitle || null,
    coverSubtitle: letter.coverSubtitle || null,
    deliverAt: letter.deliverAt?.toISOString() || letter.createdAt.toISOString(),
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
    isSentByMe: letter.senderId === currentUser.id
  }))

  return (
    <main className="w-full h-full">
      <ClientDesk initialLetters={formattedLetters} />
    </main>
  )
}
