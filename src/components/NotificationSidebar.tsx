"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Check, X, UserPlus, Info, ArrowRight, Users, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BirdLoader from "@/components/BirdLoader";
import { useNotification } from "@/contexts/NotificationContext";

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
  type?: string;
  createdAt: string;
};

export default function NotificationSidebar() {
  const router = useRouter();
  const { isSidebarOpen, setSidebarOpen, decrementUnread, fetchUnread } = useNotification();
  const [requests, setRequests] = useState<Request[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isSidebarOpen) {
      fetchData();
      markAllRead();
    }
  }, [isSidebarOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.all([
        fetch("/api/partner/requests"),
        fetch("/api/notifications"),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.incomingRequests || []);
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Failed to load notifications data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (id: string, action: "ACCEPT" | "DECLINE") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/partner/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        decrementUnread();
        if (action === "ACCEPT") {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Failed to update request", error);
    } finally {
      setActionLoading(null);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchUnread();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const getNotificationDetails = (notif: NotificationItem) => {
    const t = (notif.title || "").toLowerCase();
    const m = (notif.message || "").toLowerCase();
    const type = (notif.type || "").toUpperCase();

    // Letters & replies
    if (
      type === "LETTER" ||
      type === "LETTER_REPLY" ||
      t.includes("letter") ||
      m.includes("letter") ||
      t.includes("reply") ||
      m.includes("reply") ||
      t.includes("whisper") ||
      t.includes("echo")
    ) {
      return {
        href: "/",
        actionLabel: "Open Mailbox",
        category: "letter" as const,
      };
    }

    // Partner & connection
    if (
      type.includes("CONNECTION") ||
      type === "DISCONNECT" ||
      t.includes("partner") ||
      m.includes("partner") ||
      t.includes("connection") ||
      m.includes("connection")
    ) {
      return {
        href: "/connect",
        actionLabel: "View Partner Hub",
        category: "partner" as const,
      };
    }

    // Settings & profile
    if (
      type === "SECURITY" ||
      t.includes("password") ||
      t.includes("security") ||
      t.includes("setting")
    ) {
      return {
        href: "/settings",
        actionLabel: "Account Settings",
        category: "settings" as const,
      };
    }

    // Default
    return {
      href: "/",
      actionLabel: "Go to Mailbox",
      category: "general" as const,
    };
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    const details = getNotificationDetails(notif);

    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      decrementUnread();

      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
      } catch (err) {
        console.error("Failed to mark single notification read", err);
      }
    }

    setSidebarOpen(false);
    router.push(details.href);
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Smooth Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Smooth Sliding Sidebar Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#130f0d] shadow-2xl border-l border-[#2e261f] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#2e261f] bg-[#181310]">
              <h2 className="text-xl font-serif font-bold text-[#f5f2eb] flex items-center">
                <Mail className="w-5 h-5 mr-3 text-[#ea580c]" />
                Notifications
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-[#a89e91] hover:text-[#f5f2eb] hover:bg-[#251e18] rounded-full transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {loading ? (
                <div className="flex justify-center py-16">
                  <BirdLoader className="w-12 h-12 text-[#ea580c]" />
                </div>
              ) : (
                <>
                  {/* Action Requests */}
                  {requests.length > 0 && (
                    <section>
                      <h3 className="text-base font-serif font-bold text-[#f5f2eb] mb-3.5 flex items-center">
                        <UserPlus className="w-4 h-4 mr-2 text-[#ea580c]" />
                        Action Requests
                      </h3>
                      <div className="space-y-3.5">
                        {requests.map((req) => (
                          <div
                            key={req.id}
                            className="p-4 bg-[#1a1410] rounded-2xl border border-[#2e261f] shadow-sm flex flex-col gap-3"
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  req.sender.avatarUrl ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                                    req.sender.name || req.sender.email
                                  }`
                                }
                                alt="Avatar"
                                className="w-10 h-10 rounded-full border border-[#3d3328]"
                              />
                              <div>
                                <p className="font-bold text-[#f5f2eb] text-sm leading-tight">
                                  {req.sender.name || "Anonymous User"}
                                </p>
                                <p className="text-xs text-[#a89e91] leading-tight mt-0.5">
                                  {req.type === "DISCONNECT"
                                    ? "Requested to disconnect."
                                    : "Wants to connect as your partner."}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2 w-full pt-2.5 border-t border-[#26201a]">
                              <button
                                onClick={() => handleRequest(req.id, "DECLINE")}
                                disabled={actionLoading === req.id}
                                className="flex-1 py-2 px-3 text-[#a89e91] text-xs font-medium hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleRequest(req.id, "ACCEPT")}
                                disabled={actionLoading === req.id}
                                className={`flex-1 py-2 px-3 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer ${
                                  req.type === "DISCONNECT"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-[#c2410c] hover:bg-[#ea580c]"
                                }`}
                              >
                                {actionLoading === req.id ? (
                                  <BirdLoader className="w-4 h-4" />
                                ) : (
                                  "Accept"
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* System Alerts */}
                  <section>
                    <h3 className="text-base font-serif font-bold text-[#f5f2eb] mb-3.5 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-[#a89e91]" />
                      Alerts
                    </h3>
                    {notifications.length === 0 ? (
                      <div className="text-center py-12 bg-[#181411] rounded-2xl border border-[#2a221b] shadow-sm">
                        <Mail className="w-9 h-9 text-[#473b2f] mx-auto mb-2.5" />
                        <p className="text-xs text-[#a89e91]">You&apos;re all caught up!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notif) => {
                          const details = getNotificationDetails(notif);
                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleNotificationClick(notif);
                                }
                              }}
                              className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-[0.985] text-left select-none ${
                                notif.read
                                  ? "bg-[#181411]/90 border-[#2a221b]/80 hover:bg-[#201a15] hover:border-[#ea580c]/50"
                                  : "bg-[#1f1712] border-[#ea580c]/50 hover:bg-[#271d16] hover:border-[#ea580c] shadow-[0_4px_20px_rgba(234,88,12,0.12)]"
                              }`}
                            >
                              {/* Pulse glow dot for unread */}
                              {!notif.read && (
                                <div className="absolute top-3.5 right-3.5 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c2410c]"></span>
                                </div>
                              )}

                              {/* Header: Category Icon + Title + Timestamp */}
                              <div className="flex items-center justify-between gap-2 mb-1.5 pr-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`p-1.5 rounded-lg shrink-0 ${
                                      notif.read
                                        ? "bg-[#251e18] text-[#a89e91]"
                                        : "bg-[#c2410c]/20 text-[#ea580c]"
                                    }`}
                                  >
                                    {details.category === "letter" && (
                                      <Mail className="w-3.5 h-3.5" />
                                    )}
                                    {details.category === "partner" && (
                                      <Users className="w-3.5 h-3.5" />
                                    )}
                                    {details.category === "settings" && (
                                      <Settings className="w-3.5 h-3.5" />
                                    )}
                                    {details.category === "general" && (
                                      <Sparkles className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                  <h4
                                    className={`font-serif font-bold text-sm truncate tracking-wide transition-colors ${
                                      notif.read
                                        ? "text-[#e8e2d8] group-hover:text-white"
                                        : "text-white group-hover:text-[#ea580c]"
                                    }`}
                                  >
                                    {notif.title}
                                  </h4>
                                </div>

                                <span className="text-[10px] text-[#8a7f72] font-mono shrink-0">
                                  {formatNotificationTime(notif.createdAt)}
                                </span>
                              </div>

                              {/* Notification Message */}
                              <p className="text-xs text-[#a89e91] group-hover:text-[#c4bbb0] transition-colors leading-relaxed line-clamp-2 pl-8">
                                {notif.message}
                              </p>

                              {/* Action Cue with interactive arrow */}
                              <div className="mt-3 pt-2.5 border-t border-[#26201a]/80 flex items-center justify-between text-[11px] text-[#8a7f72] group-hover:text-[#ea580c] transition-colors pl-8">
                                <span className="font-serif tracking-wide font-medium">
                                  {details.actionLabel}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
