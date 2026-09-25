import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import ConnectPartnerClient from "./ConnectPartnerClient"
import PartneredSanctuaryView from "./PartneredSanctuaryView"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export default async function ConnectPartnerPage() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error("Session error:", err)
  }

  if (!session?.user?.email) {
    redirect("/login")
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      partner: true,
      sentRequests: {
        where: { status: "PENDING", type: "CONNECT" },
        include: {
          receiver: {
            select: { id: true, name: true, email: true, avatarUrl: true, bio: true }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      receivedRequests: {
        where: { status: "PENDING", type: "CONNECT" },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatarUrl: true, bio: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!currentUser) {
    redirect("/login")
  }

  // If user is partnered, render the Partnered Sanctuary
  if (currentUser.partner) {
    const partner = currentUser.partner

    // Fetch letter statistics between the two partners
    const [lettersSentCount, lettersReceivedCount, existingDisconnectRequest] = await Promise.all([
      prisma.letter.count({
        where: { senderId: currentUser.id, receiverId: partner.id }
      }),
      prisma.letter.count({
        where: { senderId: partner.id, receiverId: currentUser.id }
      }),
      prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: partner.id, status: "PENDING", type: "DISCONNECT" },
            { senderId: partner.id, receiverId: currentUser.id, status: "PENDING", type: "DISCONNECT" }
          ]
        }
      })
    ])

    return (
      <PartneredSanctuaryView 
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatarUrl: currentUser.avatarUrl,
          bio: currentUser.bio
        }}
        partner={{
          id: partner.id,
          name: partner.name,
          email: partner.email,
          avatarUrl: partner.avatarUrl,
          bio: partner.bio,
          createdAt: partner.createdAt
        }}
        lettersSentCount={lettersSentCount}
        lettersReceivedCount={lettersReceivedCount}
        isDisconnectPending={!!existingDisconnectRequest}
      />
    )
  }

  // Otherwise, render the Unpartnered Connect & Search Client
  return (
    <ConnectPartnerClient 
      currentUser={{
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatarUrl: currentUser.avatarUrl,
        bio: currentUser.bio
      }}
      initialIncomingRequests={currentUser.receivedRequests.map(req => ({
        id: req.id,
        createdAt: req.createdAt,
        sender: req.sender ? {
          id: req.sender.id,
          name: req.sender.name,
          email: req.sender.email,
          avatarUrl: req.sender.avatarUrl,
          bio: req.sender.bio
        } : undefined
      }))}
      initialOutgoingRequests={currentUser.sentRequests.map(req => ({
        id: req.id,
        createdAt: req.createdAt,
        receiver: req.receiver ? {
          id: req.receiver.id,
          name: req.receiver.name,
          email: req.receiver.email,
          avatarUrl: req.receiver.avatarUrl,
          bio: req.receiver.bio
        } : undefined
      }))}
    />
  )
}
