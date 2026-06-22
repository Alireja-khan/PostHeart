"use client"

import { Bell } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"
import { useSession } from "next-auth/react"

export default function TopBar() {
  const { unreadCount, setSidebarOpen } = useNotification()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="absolute top-8 right-8 z-30 flex items-center space-x-4">
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
