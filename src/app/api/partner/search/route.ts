import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Don't let users search for themselves
    if (email.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json({ message: "You cannot connect with yourself." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        isPublic: true,
        showEmail: true
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found or not registered." }, { status: 404 })
    }

    if (!user.isPublic) {
      return NextResponse.json({ message: "This user's profile is private." }, { status: 403 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.showEmail ? user.email : null,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
