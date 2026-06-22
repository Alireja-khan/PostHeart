import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        isPublic: true,
        showEmail: true,
        createdAt: true,
        partnerId: true,
        received: {
          where: { status: 'IN_TRANSIT' },
          orderBy: { deliverAt: 'asc' },
          take: 1,
          select: { id: true, createdAt: true, deliverAt: true, delayHours: true }
        },
        _count: {
          select: {
            letters: true,
            received: true,
            milestones: true,
            keepsakes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
