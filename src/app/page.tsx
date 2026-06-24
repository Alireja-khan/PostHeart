import { PrismaClient } from '@prisma/client'
import Desk from '@/components/Desk'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    // If not logged in, return empty desk or handle redirect
    return (
      <main className="w-full h-full">
        <Desk initialLetters={[]} />
      </main>
    )
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!currentUser) {
    return (
      <main className="w-full h-full">
        <Desk initialLetters={[]} />
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

  // Format letters cleanly for client-side consumption
  const formattedLetters = letters.map(letter => ({
    id: letter.id.toString(),
    content: letter.content,
    sender: {
      id: letter.sender.id.toString(),
      email: letter.sender.email,
      name: letter.sender.name
    },
    receiver: letter.receiver ? {
      id: letter.receiver.id.toString(),
      email: letter.receiver.email,
      name: letter.receiver.name
    } : null
  }))

  return (
    <main className="w-full h-full">
      <Desk initialLetters={formattedLetters} />
    </main>
  )
}
