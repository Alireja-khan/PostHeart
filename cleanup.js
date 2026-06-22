const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log("Starting cleanup...")
  
  // Find all users
  const users = await prisma.user.findMany({
    include: { partnerOf: true }
  })

  let count = 0;

  for (const user of users) {
    if (user.partnerOf && user.partnerOf.length > 1) {
      console.log(`User ${user.email} has ${user.partnerOf.length} partners. Cleaning up...`);
      // Keep the first one, remove the rest
      const [first, ...rest] = user.partnerOf;
      for (const extra of rest) {
        await prisma.user.update({
          where: { id: extra.id },
          data: { partnerId: null }
        });
        console.log(`  Removed partnerId from ${extra.email}`);
        count++;
      }
    }
  }

  // Ensure two-way connections are strict
  // If A points to B, but B points to C, we should probably reset A.
  // The simplest is just checking if A -> B means B -> A. If not, reset A.
  for (const user of users) {
    if (user.partnerId) {
      const partner = await prisma.user.findUnique({ where: { id: user.partnerId } });
      if (partner && partner.partnerId !== user.id) {
        console.log(`User ${user.email} points to ${partner.email}, but ${partner.email} points to ${partner.partnerId}. Resetting ${user.email}...`);
        await prisma.user.update({
          where: { id: user.id },
          data: { partnerId: null }
        });
        count++;
      }
    }
  }

  console.log(`Cleanup complete. Fixed ${count} records.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
