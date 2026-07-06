"use client"

import { useState, useEffect } from "react"
import { Mail, Check, X, Loader2, UserPlus, Info } from "lucide-react"
import { useNotification } from "@/contexts/NotificationContext"

type Request = {
  id: string;
  type: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationSidebar() {
  const { isSidebarOpen, setSidebarOpen, clearUnread, decrementUnread, fetchUnread } = useNotification()
  const [requests, setRequests] = useState<Request[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isSidebarOpen) {
      fetchData();
      markAllRead();
    }
  }, [isSidebarOpen]);

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, notifRes] = await Promise.all([
        fetch("/api/partner/requests"),
        fetch("/api/notifications")
      ])
      
      if (reqRes.ok) {
        const data = await reqRes.json()
        setRequests(data.incomingRequests || [])
      }
      
      if (notifRes.ok) {
        const data = await notifRes.json()
        setNotifications(data || [])
      }
    } catch (error) {
      console.error("Failed to load data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (id: string, action: "ACCEPT" | "DECLINE") => {
    setActionLoading(id)
    try {
      const res = await fetch("/api/partner/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action })
      })

      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id))
        decrementUnread() // Decrement instantly
        if (action === "ACCEPT") {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Failed to update request", error)
    } finally {
      setActionLoading(null)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
      await fetchUnread() // Recalculate and update the unread badge from the server
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }

  if (!isSidebarOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity" 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#111111] shadow-xl border-l border-[#333333] transform transition-transform duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-[#333333] bg-[#1a1a1a]">
          <h2 className="text-2xl font-serif font-bold text-[#f9f8f6] flex items-center">
            <Mail className="w-6 h-6 mr-3 text-[#c2410c]" />
            Notifications
          </h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#a0a0a0] hover:text-[#f9f8f6] hover:bg-[#111111] rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c2410c]" />
            </div>
          ) : (
            <>
              {/* Requests */}
              {requests.length > 0 && (
                <section>
                  <h3 className="text-lg font-serif font-bold text-[#f9f8f6] mb-4 flex items-center">
                    <UserPlus className="w-5 h-5 mr-2 text-[#c2410c]" />
                    Action Requests
                  </h3>
                  <div className="space-y-4">
                    {requests.map(req => (
                      <div key={req.id} className="p-4 bg-[#1a1a1a] rounded-2xl border border-[#333333] shadow-sm flex flex-col gap-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={req.sender.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${req.sender.name || req.sender.email}`} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full border border-[#333333]"
                          />
                          <div>
                            <p className="font-bold text-[#f9f8f6] leading-tight">{req.sender.name || "Anonymous User"}</p>
                            <p className="text-xs text-[#a0a0a0] leading-tight">
                              {req.type === "DISCONNECT" 
                                ? "Requested to disconnect." 
                                : "Wants to connect as your partner."}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 w-full pt-2 border-t border-[#f9f8f6]">
                          <button 
                            onClick={() => handleRequest(req.id, "DECLINE")}
                            disabled={actionLoading === req.id}
                            className="flex-1 py-2 px-3 text-[#a0a0a0] text-sm font-medium hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                          >
                            Decline
                          </button>
                          <button 
                            onClick={() => handleRequest(req.id, "ACCEPT")}
                            disabled={actionLoading === req.id}
                            className={`flex-1 py-2 px-3 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${
                              req.type === "DISCONNECT" ? "bg-red-600 hover:bg-red-700" : "bg-[#c2410c] hover:bg-[#a3360a]"
                            }`}
                          >
                            {actionLoading === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* System Alerts */}
              <section>
                <h3 className="text-lg font-serif font-bold text-[#f9f8f6] mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-[#a0a0a0]" />
                  Alerts
                </h3>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 bg-[#1a1a1a] rounded-2xl border border-[#333333] shadow-sm">
                    <Mail className="w-10 h-10 text-[#e6e4df] mx-auto mb-3" />
                    <p className="text-sm text-[#a0a0a0]">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div key={notif.id} className={`p-4 rounded-2xl border transition-colors ${notif.read ? 'bg-[#1a1a1a] border-[#333333]' : 'bg-[#fff5f0] border-[#ffd5c2]'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold text-sm ${notif.read ? 'text-[#f9f8f6]' : 'text-[#c2410c]'}`}>{notif.title}</h4>
                          <span className="text-[10px] text-[#a0a0a0]">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#a0a0a0] text-xs">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

        </div>
      </div>
    </>
  )
}
