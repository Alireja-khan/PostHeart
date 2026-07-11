import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { User, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ConnectButton from "./ConnectButton"

import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  let currentUser = null;
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  }

  const user = await prisma.user.findUnique({
    where: { id },
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

  if (!user || !user.isPublic) {
    notFound()
  }

  // Check connection status
  let isPending = false;
  let isPartner = false;

  if (currentUser) {
    if (currentUser.partnerId === user.id) {
      isPartner = true;
    } else {
      const existingRequest = await prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: user.id, status: "PENDING" },
            { senderId: user.id, receiverId: currentUser.id, status: "PENDING" }
          ]
        }
      });
      if (existingRequest) {
        isPending = true;
      }
    }
  }

  const currentAvatar = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`

  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-bg-primary flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Link href="/connect" className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
        
        <div className="bg-bg-secondary border border-border-primary rounded-3xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 bg-bg-primary rounded-full flex items-center justify-center border-4 border-text-primary shadow-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentAvatar} alt={user.name || "User"} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">{user.name || "Anonymous User"}</h1>
          
          {user.showEmail && (
            <div className="flex items-center justify-center text-text-secondary mb-6">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </div>
          )}

          {user.bio && (
            <div className="bg-bg-primary border border-border-primary rounded-2xl p-6 text-text-primary text-left mb-8">
              <p className="whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {currentUser && currentUser.id !== user.id && !isPartner && (
            <ConnectButton partnerId={user.id} initialPending={isPending} />
          )}
          
          {isPartner && (
            <div className="w-full bg-[#e8f5e9] text-[#2e7d32] rounded-xl py-3 font-medium text-center border border-[#c8e6c9]">
              You are Partners
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
