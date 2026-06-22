import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { avatarUrl, bio, isPublic, showEmail } = body

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        avatarUrl,
        bio,
        isPublic,
        showEmail
      }
    })

    return NextResponse.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
