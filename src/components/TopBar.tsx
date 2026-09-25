"use client";

import React, { useState } from "react";
import { Mail, Bell, Sparkles } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopBar() {
  const pathname = usePathname();
  const { unreadCount, setSidebarOpen } = useNotification();
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);

  // Do not render on auth pages or unauthenticated sessions
  if (!session || pathname === "/login" || pathname === "/register") return null;

  return (
    <div className="fixed top-5 right-5 sm:top-6 sm:right-8 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className={`group relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full transition-all duration-300 backdrop-blur-xl cursor-pointer border shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
            unreadCount > 0
              ? "bg-[#181310]/85 border-[#c2410c]/50 hover:border-[#c2410c] hover:bg-[#201712]/90 ring-1 ring-[#c2410c]/20"
              : "bg-[#141210]/80 border-[#2d261e]/80 hover:border-[#473b2f] hover:bg-[#1c1814]/90"
          }`}
          title="Open Mailbox & Correspondence Dispatch"
          aria-label="Open notifications"
        >
          {/* Subtle Ambient Glow */}
          <div 
            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
              unreadCount > 0 
                ? "bg-[#c2410c]/10 opacity-100" 
                : "bg-white/5 opacity-0 group-hover:opacity-100"
            }`} 
          />

          {/* Icon with ping effect if unread */}
          <div className="relative flex items-center justify-center">
            {unreadCount > 0 ? (
              <>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c2410c]"></span>
                </span>
                <Mail className="w-4 h-4 text-[#ea580c] transition-transform group-hover:scale-110" />
              </>
            ) : (
              <Mail className="w-4 h-4 text-[#a89e91] group-hover:text-[#f5f2eb] transition-all group-hover:scale-110" />
            )}
          </div>

          {/* Interactive Label and Counter Pill */}
          <AnimatePresence>
            {(isHovered || unreadCount > 0) && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: -5 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -5 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden flex items-center gap-2 whitespace-nowrap text-xs font-serif"
              >
                <span className="text-[#dcd3c5] font-medium tracking-wide text-[11px]">
                  {unreadCount > 0 ? "Dispatches" : "Mailbox"}
                </span>

                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-white bg-[#c2410c] rounded-full shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zero unread subtle indicator dot if not hovered */}
          {!isHovered && unreadCount === 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3d3328] group-hover:bg-[#a89e91] transition-colors" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
