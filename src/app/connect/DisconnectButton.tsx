"use client"

import { useState, useEffect } from "react"
import { UserMinus, Loader2, Clock } from "lucide-react"

export default function DisconnectButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to request a disconnect? Your partner will have to approve this request.")) return;

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
      <div className="w-full mt-4 bg-[#f9f8f6] text-[#707070] rounded-xl py-3 font-medium flex items-center justify-center gap-2 border border-[#e6e4df]">
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
        className="w-full mt-4 bg-white text-[#707070] border border-[#e6e4df] rounded-xl py-3 font-medium hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            <UserMinus className="w-4 h-4" /> Request Disconnect
          </>
        )}
      </button>
    </>
  )
}
