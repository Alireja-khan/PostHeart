"use client"

import { Bell } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"
import { useSession } from "next-auth/react"

export default function TopBar() {
  const { unreadCount, setSidebarOpen } = useNotification()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="fixed top-40 left-72 z-50 flex items-center space-x-4">
      <button 
        onClick={() => setSidebarOpen(true)}
        className="relative p-3 bg-[#1a1a1a] border border-[#333333] rounded-full shadow-sm hover:bg-[#222222] transition-colors"
      >
        <Bell className="w-6 h-6 text-[#f9f8f6]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-[#1a1a1a] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
