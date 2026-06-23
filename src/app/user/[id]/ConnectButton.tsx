"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowRight, Loader2, Clock } from "lucide-react"

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

    const interval = setInterval(checkStatus, 5000);
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
        router.refresh()
      } else {
        setError(data.message || "Failed to connect")
      }
    } catch (err) {
      setError("An error occurred. Make sure you are logged in.")
    } finally {
      setLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="w-full bg-[#111111] text-[#a0a0a0] rounded-xl py-3 font-medium flex items-center justify-center gap-2 border border-[#333333]">
        <Clock className="w-5 h-5" /> Request Pending...
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-4 text-center border border-red-100">
          {error}
        </div>
      )}
      <button 
        onClick={handleConnect}
        disabled={loading}
        className="w-full bg-[#c2410c] text-white rounded-xl py-3 font-medium hover:bg-[#a3360a] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            <Users className="w-5 h-5" /> Connect Partner <ArrowRight className="w-5 h-5 ml-1" />
          </>
        )}
      </button>
    </>
  )
}
