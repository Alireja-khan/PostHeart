import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { Mail, Heart } from "lucide-react"
import SearchForm from "./SearchForm"
import DisconnectButton from "./DisconnectButton"

const prisma = new PrismaClient()

export default async function ConnectPartnerPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return <SearchForm /> // Fallback, though middleware usually protects this route
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { partner: true }
  })

  // If user is partnered, show partner profile
  if (currentUser?.partner) {
    const partner = currentUser.partner
    const currentAvatar = partner.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.name || partner.email}`

    const existingDisconnectRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: partner.id, status: "PENDING", type: "DISCONNECT" },
          { senderId: partner.id, receiverId: currentUser.id, status: "PENDING", type: "DISCONNECT" }
        ]
      }
    });
    const isPending = !!existingDisconnectRequest;

    return (
      <div className="min-h-screen p-8 lg:p-12 font-sans bg-bg-primary flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-3xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 bg-bg-primary rounded-full flex items-center justify-center border-4 border-[#ffd5c2] shadow-md overflow-hidden relative">
              <img src={currentAvatar} alt={partner.name || "Partner"} className="w-full h-full object-cover" />
              <div className="absolute -bottom-2 right-0 bg-[#c2410c] text-text-primary p-1.5 rounded-full border-2 border-text-primary">
                <Heart className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-text-primary mb-2">{partner.name || "Anonymous User"}</h1>
          
          {partner.showEmail && (
            <div className="flex items-center justify-center text-text-secondary mb-6">
              <Mail className="w-4 h-4 mr-2" />
              {partner.email}
            </div>
          )}

          {partner.bio && (
            <div className="bg-bg-primary border border-border-primary rounded-2xl p-6 text-text-primary text-left mb-8">
              <p className="whitespace-pre-wrap">{partner.bio}</p>
            </div>
          )}

          <div className="w-full bg-[#fff5f0] text-[#c2410c] rounded-xl py-3 font-medium text-center border border-[#ffd5c2]">
            You are Officially Partners!
          </div>

          <DisconnectButton initialPending={isPending} />
        </div>
      </div>
    )
  }

  // Otherwise, show the search form
  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-bg-primary flex items-center justify-center">
      <SearchForm />
    </div>
  )
}
