"use client"
import { useState, useEffect } from "react"
import { Bell, Check, X, Loader2, UserPlus, Info } from "lucide-react"

type Request = {
  id: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
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
        if (action === "ACCEPT") {
          // You might want to show a success message or redirect here
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
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark as read", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f6]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c2410c]" />
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-[#f9f8f6]">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#e6e4df] pb-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[#1a1a1a] mb-2 flex items-center">
              <Bell className="w-8 h-8 mr-3 text-[#c2410c]" />
              Notifications
            </h1>
            <p className="text-[#707070]">Manage your connection requests and alerts.</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-sm font-medium text-[#c2410c] hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Connection Requests */}
        {requests.length > 0 && (
          <section className="bg-white rounded-3xl border border-[#e6e4df] p-6 shadow-sm">
            <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6 flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-[#c2410c]" />
              Connection Requests
            </h2>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-[#f9f8f6] rounded-2xl border border-[#e6e4df]">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={req.sender.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${req.sender.name || req.sender.email}`} 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full border border-[#e6e4df]"
                    />
                    <div>
                      <p className="font-bold text-[#1a1a1a]">{req.sender.name || "Anonymous User"}</p>
                      <p className="text-sm text-[#707070]">{req.sender.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRequest(req.id, "DECLINE")}
                      disabled={actionLoading === req.id}
                      className="p-2 text-[#707070] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Decline"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleRequest(req.id, "ACCEPT")}
                      disabled={actionLoading === req.id}
                      className="p-2 text-white bg-[#c2410c] hover:bg-[#a3360a] rounded-xl transition-colors disabled:opacity-50"
                      title="Accept"
                    >
                      {actionLoading === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* System Notifications */}
        <section>
          <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6 flex items-center">
            <Info className="w-5 h-5 mr-2 text-[#707070]" />
            Recent Alerts
          </h2>
          {notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#e6e4df] shadow-sm">
              <Bell className="w-12 h-12 text-[#e6e4df] mx-auto mb-4" />
              <p className="text-[#707070]">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-5 rounded-2xl border transition-colors ${notif.read ? 'bg-white border-[#e6e4df]' : 'bg-[#fff5f0] border-[#ffd5c2]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${notif.read ? 'text-[#1a1a1a]' : 'text-[#c2410c]'}`}>{notif.title}</h3>
                    <span className="text-xs text-[#707070]">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[#707070] text-sm">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
