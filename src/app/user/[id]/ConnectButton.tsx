"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowRight, Loader2 } from "lucide-react"

export default function ConnectButton({ partnerId }: { partnerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
        router.push("/")
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
