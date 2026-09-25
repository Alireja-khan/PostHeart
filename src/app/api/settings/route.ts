import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        accentColor: true,
        emailNotifications: true,
        ambientSound: true,
        isPublic: true,
        showEmail: true,
        partnerId: true,
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        accounts: {
          select: {
            provider: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isGoogleLinked = user.accounts.some(acc => acc.provider === "google")
    const hasPassword = Boolean(user.password)

    return NextResponse.json({
      id: user.id,
      name: user.name || "",
      email: user.email,
      accentColor: user.accentColor || "rust",
      emailNotifications: user.emailNotifications ?? true,
      ambientSound: user.ambientSound || "none",
      isPublic: user.isPublic ?? true,
      showEmail: user.showEmail ?? false,
      isPartnered: Boolean(user.partnerId),
      partnerName: user.partner?.name || "",
      partnerEmail: user.partner?.email || "",
      partnerAvatar: user.partner?.avatarUrl || null,
      hasPassword,
      isGoogleLinked
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      accentColor, 
      emailNotifications, 
      ambientSound, 
      isPublic, 
      showEmail 
    } = body

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(accentColor !== undefined ? { accentColor } : {}),
        ...(emailNotifications !== undefined ? { emailNotifications: Boolean(emailNotifications) } : {}),
        ...(ambientSound !== undefined ? { ambientSound } : {}),
        ...(isPublic !== undefined ? { isPublic: Boolean(isPublic) } : {}),
        ...(showEmail !== undefined ? { showEmail: Boolean(showEmail) } : {})
      },
      select: {
        name: true,
        accentColor: true,
        emailNotifications: true,
        ambientSound: true,
        isPublic: true,
        showEmail: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Preferences updated successfully",
      data: updatedUser 
    })
  } catch (error) {
    console.error("Settings PUT error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters long." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // If user already has a password, verify current password
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password is required." }, { status: 400 })
      }

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ message: "Incorrect current password." }, { status: 400 })
      }
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: user.password ? "Password changed successfully" : "Password set successfully"
    })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
