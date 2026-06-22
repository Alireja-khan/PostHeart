import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { User, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ConnectButton from "./ConnectButton"

const prisma = new PrismaClient()

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const currentAvatar = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`

  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-[#f9f8f6] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <Link href="/connect" className="inline-flex items-center text-[#707070] hover:text-[#1a1a1a] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Link>
        
        <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 bg-[#f9f8f6] rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentAvatar} alt={user.name || "User"} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">{user.name || "Anonymous User"}</h1>
          
          {user.showEmail && (
            <div className="flex items-center justify-center text-[#707070] mb-6">
              <Mail className="w-4 h-4 mr-2" />
              {user.email}
            </div>
          )}

          {user.bio && (
            <div className="bg-[#f9f8f6] border border-[#e6e4df] rounded-2xl p-6 text-[#1a1a1a] text-left mb-8">
              <p className="whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          <ConnectButton partnerId={user.id} />
        </div>
      </div>
    </div>
  )
}
