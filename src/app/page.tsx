import { PrismaClient } from '@prisma/client'
import Desk from '@/components/Desk'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'
import { Suspense } from 'react'
import { PackageOpen } from 'lucide-react'

const prisma = new PrismaClient()

function DeskSkeleton() {
  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12 flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#c2410c]/20 flex items-center justify-center mb-6">
          <PackageOpen className="text-[#c2410c] opacity-50" size={32} />
        </div>
        <div className="h-4 w-48 bg-[#333] rounded mb-3"></div>
        <div className="h-3 w-32 bg-[#222] rounded"></div>
      </div>
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
    voices: letter.voices || [],
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
