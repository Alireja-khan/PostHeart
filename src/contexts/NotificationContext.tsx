"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

type NotificationContextType = {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  unreadCount: number
  fetchUnread: () => Promise<void>
  decrementUnread: () => void
  clearUnread: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session } = useSession()

  const fetchUnread = async () => {
    if (!session) return
    try {
      const res = await fetch("/api/notifications/unread")
      if (res.ok) {
        const data = await res.json()
        setUnreadCount(data.unread)
      }
    } catch (error) {
      console.error("Failed to fetch unread count")
    }
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [session])

  const decrementUnread = () => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const clearUnread = () => {
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{
      isSidebarOpen,
      setSidebarOpen,
      unreadCount,
      fetchUnread,
      decrementUnread,
      clearUnread
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
