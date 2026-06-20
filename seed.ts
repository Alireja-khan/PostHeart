import "dotenv/config"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

async function main() {
  console.log('Seeding database with demo data...')
  
  // Create demo users
  const user1 = await prisma.user.create({
    data: {
      name: 'Sarah',
      email: `sarah_${Date.now()}@example.com`,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: 'Alex',
      email: `alex_${Date.now()}@example.com`,
    },
  })

  // Create a demo letter
  const letter = await prisma.letter.create({
    data: {
      content: 'Dear Alex, I am writing this letter from the past...',
      status: 'DELIVERED',
      delayHours: 24,
      senderId: user1.id,
      receiverId: user2.id,
    },
  })

  console.log('Successfully created demo users and letter!')
  console.log('Users:', { user1, user2 })
  console.log('Letter:', letter)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
