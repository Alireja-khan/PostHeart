import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkAndDeliverLetters(userId: string) {
  try {
    // Find all IN_TRANSIT letters for this user that have reached their delivery time
    const arrivedLetters = await prisma.letter.findMany({
      where: {
        receiverId: userId,
        status: "IN_TRANSIT",
        deliverAt: { lte: new Date() }
      },
      include: {
        sender: true
      }
    });

    if (arrivedLetters.length === 0) return;

    // Create a notification and update status to DELIVERED for each letter
    for (const letter of arrivedLetters) {
      await prisma.$transaction([
        prisma.notification.create({
          data: {
            userId: userId,
            title: "New Letter Received!",
            message: `You received a new letter from ${letter.sender.name || "your partner"}!`,
            type: "SYSTEM",
            read: false
          }
        }),
        prisma.letter.update({
          where: { id: letter.id },
          data: { status: "DELIVERED" }
        })
      ]);
    }
  } catch (error) {
    console.error("Error in checkAndDeliverLetters:", error);
  }
}
