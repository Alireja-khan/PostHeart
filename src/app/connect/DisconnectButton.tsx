"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserMinus, Clock } from "lucide-react"
import BirdLoader from "@/components/BirdLoader"
import { useDialog } from "@/components/DialogProvider"

export default function DisconnectButton({ initialPending = false }: { initialPending?: boolean }) {
  const router = useRouter()
  const { confirm } = useDialog()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(initialPending)

  // Sync state if props change from a router.refresh()
  useEffect(() => {
    setIsPending(initialPending);
  }, [initialPending]);

  // Poll for connection status if pending
  useEffect(() => {
    if (!isPending) return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          router.refresh();
        }
      } catch (e) {
        // ignore
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [isPending, router]);

  const handleDisconnect = async () => {
    if (!(await confirm("Disconnect Partner", "Are you sure you want to request a disconnect? Your partner will have to approve this request."))) return;

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/partner/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      const data = await res.json()

      if (res.ok) {
        setIsPending(true)
      } else {
        setError(data.message || "Failed to send request")
      }
    } catch (err) {
      setError("An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="w-full mt-4 bg-[#111111] text-[#a0a0a0] rounded-xl py-3 font-medium flex items-center justify-center gap-2 border border-[#333333]">
        <Clock className="w-4 h-4" /> Disconnect Request Pending
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="text-red-500 text-xs mt-2 text-center">
          {error}
        </div>
      )}
      <button 
        onClick={handleDisconnect}
        disabled={loading}
        className="w-full mt-4 bg-[#1a1a1a] text-[#a0a0a0] border border-[#333333] rounded-xl py-3 font-medium hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <BirdLoader className="w-6 h-6" /> : (
          <>
            <UserMinus className="w-4 h-4" /> Request Disconnect
          </>
        )}
      </button>
    </>
  )
}
