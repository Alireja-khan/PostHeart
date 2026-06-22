"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Mail, ArrowRight } from "lucide-react"

export default function SearchForm() {
  const router = useRouter()
  const [partnerEmail, setPartnerEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/partner/search?email=${encodeURIComponent(partnerEmail)}`)
      const data = await res.json()

      if (res.ok) {
        // Redirect to the public profile page
        router.push(`/user/${data.id}`)
      } else {
        setError(data.message || "Failed to find user")
      }
    } catch (err) {
      setError("An error occurred. Make sure you are logged in.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm"
    >
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-[#f9f8f6] rounded-full border border-[#e6e4df] flex items-center justify-center shadow-sm">
          <Search className="text-[#c2410c] h-8 w-8" />
        </div>
      </div>
      
      <h1 className="text-3xl font-serif font-bold text-center text-[#1a1a1a] mb-2">Search Partner</h1>
      <p className="text-[#707070] text-center mb-8">Enter an email address to search for your partner's public profile.</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6 text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#707070]" />
            </div>
            <input 
              type="email" 
              required
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors text-[#1a1a1a]"
              placeholder="Partner's Email"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#c2410c] text-white rounded-xl py-3 font-medium hover:bg-[#a3360a] transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
        >
          {loading ? "Searching..." : (
            <>
              Search Profile <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
