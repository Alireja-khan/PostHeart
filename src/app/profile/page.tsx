"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail } from "lucide-react"

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div className="p-8 font-sans text-zinc-400">Loading profile...</div>
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-[#f9f8f6]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm"
      >
        <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-[#e6e4df]">
          <div className="h-24 w-24 bg-[#f9f8f6] rounded-full flex items-center justify-center border border-[#e6e4df]">
            <User className="text-[#c2410c] h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">My Profile</h1>
            <p className="text-[#707070] mt-1">Manage your account and connections</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Name</label>
            <div className="flex items-center text-[#1a1a1a] bg-[#f9f8f6] px-4 py-3 rounded-xl border border-[#e6e4df]">
              <User className="h-5 w-5 text-[#c2410c] mr-3" />
              <span className="font-medium">{session?.user?.name || "No name provided"}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Email Address</label>
            <div className="flex items-center text-[#1a1a1a] bg-[#f9f8f6] px-4 py-3 rounded-xl border border-[#e6e4df]">
              <Mail className="h-5 w-5 text-[#c2410c] mr-3" />
              <span className="font-medium">{session?.user?.email}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
