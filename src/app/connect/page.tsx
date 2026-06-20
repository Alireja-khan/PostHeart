"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Mail, ArrowRight } from "lucide-react"

export default function ConnectPartner() {
  const router = useRouter()
  const [partnerEmail, setPartnerEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/partner/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ partnerEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess("Successfully connected with partner!")
        setTimeout(() => {
          router.push("/")
        }, 2000)
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Users className="text-white h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-semibold text-center mb-2">Connect Partner</h1>
        <p className="text-zinc-400 text-center mb-8">Enter your partner's email address to link your accounts together.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-sm p-3 rounded-xl mb-6 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input 
                type="email" 
                required
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                placeholder="Partner's Email"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4 shadow-lg shadow-pink-500/20 disabled:opacity-50"
          >
            {loading ? "Connecting..." : (
              <>
                Connect <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
