"use client"

import { Mail } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"
import { useSession } from "next-auth/react"

export default function TopBar() {
  const { unreadCount, setSidebarOpen } = useNotification()
  const { data: session } = useSession()

  if (!session) return null

  return (
    <div className="fixed top-4 right-4 md:top-40 md:left-72 md:right-auto z-50 flex flex-col space-y-4">
      <button 
        onClick={() => setSidebarOpen(true)}
        className="relative p-3 bg-bg-secondary border border-border-primary rounded-full shadow-sm hover:bg-bg-tertiary transition-colors"
      >
        <Mail className="w-6 h-6 text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-text-primary bg-red-500 border-2 border-[#1a1a1a] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
