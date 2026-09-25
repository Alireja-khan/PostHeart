import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import PublicDeskClient from "./PublicDeskClient"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error("Session error:", err)
  }

  let currentUser = null
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      gender: true,
      isPublic: true,
      showEmail: true,
      createdAt: true,
      partnerId: true,
      partner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        }
      },
      _count: {
        select: {
          letters: true,
          received: true,
          milestones: true,
          keepsakes: true,
        }
      }
    }
  })

  const isSelf = currentUser?.id === id

  if (!user || (!user.isPublic && !isSelf)) {
    notFound()
  }

  // Check connection status
  let isPending = false
  let isPartner = false
  let hasOtherPartner = false

  if (currentUser) {
    if (currentUser.partnerId === user.id) {
      isPartner = true
    } else {
      if (user.partnerId) {
        hasOtherPartner = true
      }

      const existingRequest = await prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: user.id, status: "PENDING" },
            { senderId: user.id, receiverId: currentUser.id, status: "PENDING" }
          ]
        }
      })
      if (existingRequest) {
        isPending = true
      }
    }
  }

  return (
    <PublicDeskClient 
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio,
        gender: user.gender,
        isPublic: user.isPublic,
        showEmail: user.showEmail,
        createdAt: user.createdAt,
        partnerId: user.partnerId,
        partner: user.partner,
        _count: user._count,
      }}
      isSelf={isSelf}
      isPartner={isPartner}
      isPending={isPending}
      hasOtherPartner={hasOtherPartner}
      isLoggedIn={!!currentUser}
    />
  )
}
