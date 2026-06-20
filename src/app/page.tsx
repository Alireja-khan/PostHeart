import { PrismaClient } from '@prisma/client'
import Desk from '@/components/Desk'

const prisma = new PrismaClient()

export default async function Home() {
  const letters = await prisma.letter.findMany({
    where: {
      OR: [
        { deliverAt: { lte: new Date() } },
        { deliverAt: null }
      ]
    },
    include: {
      sender: true,
      receiver: true
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
