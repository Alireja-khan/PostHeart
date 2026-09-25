"use client"

import { Mail } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function TopBar() {
  const pathname = usePathname()
  const { unreadCount, setSidebarOpen } = useNotification()
  const { data: session } = useSession()

  if (!session || pathname === '/login' || pathname === '/register') return null

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center space-x-3">
      <button 
        onClick={() => setSidebarOpen(true)}
        className="relative p-2.5 sm:p-3 bg-bg-secondary/90 backdrop-blur-md border border-border-primary rounded-full shadow-xl hover:bg-bg-tertiary transition-all hover:scale-105 active:scale-95"
        title="Open Correspondence Notifications"
      >
        <Mail className="w-5 h-5 text-text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#c2410c] border-2 border-bg-primary rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}
