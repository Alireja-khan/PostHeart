"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Clock, Heart, Check } from "lucide-react"
import BirdLoader from "@/components/BirdLoader"
import toast from "react-hot-toast"

export default function ConnectButton({ partnerId, initialPending = false }: { partnerId: string, initialPending?: boolean }) {
  const router = useRouter()
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

    const interval = setInterval(checkStatus, 6000);
    return () => clearInterval(interval);
  }, [isPending, router]);

  const handleConnect = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/partner/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId })
      })

      const data = await res.json()

      if (res.ok) {
        setIsPending(true)
        toast.success("Invitation dispatched by carrier bird! 🕊️", {
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
        router.refresh()
      } else {
        setError(data.message || "Failed to dispatch invitation")
        toast.error(data.message || "Failed to connect", {
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
      }
    } catch (err) {
      setError("An error occurred. Make sure you are logged in.")
      toast.error("Failed to reach registry.", {
        style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
      })
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="w-full py-3.5 px-4 rounded-xl bg-[#1b1917] text-[#c2410c] text-xs font-mono flex items-center justify-center gap-2 border border-[#383129] shadow-inner">
        <Clock className="w-4 h-4 text-[#c2410c] animate-pulse" />
        <span>Invitation In Flight • Awaiting Seal</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="bg-red-950/20 text-red-300 text-xs p-3 rounded-xl text-center border border-red-900/40 font-serif">
          {error}
        </div>
      )}
      <button 
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white font-serif text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#c2410c]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <BirdLoader className="w-5 h-5 text-white" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Dispatch Bond Invitation</span>
          </>
        )}
      </button>
    </div>
  )
}
