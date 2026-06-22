"use client"

import { Bell, Settings } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"
import { useSession } from "next-auth/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function TopBar() {
  const { unreadCount, setSidebarOpen } = useNotification()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  if (!session) return null

  const isProfile = pathname === "/profile"
  const isEditing = searchParams.get("edit") === "true"

  const toggleEditMode = () => {
    if (isEditing) {
      router.push("/profile", { scroll: false })
    } else {
      router.push("/profile?edit=true", { scroll: false })
    }
  }

  return (
    <div className="absolute top-8 right-8 z-30 flex items-center space-x-4">
      {isProfile && (
        <button 
          onClick={toggleEditMode}
          className={`relative p-3 rounded-full shadow-sm transition-colors border ${
            isEditing 
              ? "bg-[#c2410c] border-[#c2410c] text-white" 
              : "bg-white border-[#e6e4df] hover:bg-[#f9f8f6] text-[#1a1a1a]"
          }`}
        >
          <Settings className="w-6 h-6" />
        </button>
      )}

      <button 
        onClick={() => setSidebarOpen(true)}
        className="relative p-3 bg-white border border-[#e6e4df] rounded-full shadow-sm hover:bg-[#f9f8f6] transition-colors"
      >
        <Bell className="w-6 h-6 text-[#1a1a1a]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
