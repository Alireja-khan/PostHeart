import { PrismaClient } from '@prisma/client'
import Desk from '@/components/Desk'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'
import { Suspense } from 'react'
import { PackageOpen } from 'lucide-react'

const prisma = new PrismaClient()

import BirdLoader from "@/components/BirdLoader"

function DeskSkeleton() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg-primary">
      <BirdLoader className="w-16 h-16 text-[#c2410c]" />
    </div>
  )
}

async function MailboxData() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return <Desk initialLetters={[]} />
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser) {
    return <Desk initialLetters={[]} />
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

  return <Desk initialLetters={formattedLetters} />
}

export default function Home() {
  return (
    <main className="w-full h-full">
      <Suspense fallback={<DeskSkeleton />}>
        <MailboxData />
      </Suspense>
    </main>
  )
}
