"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  Mail, 
  ArrowRight, 
  Copy, 
  Check, 
  Send, 
  Heart, 
  Clock, 
  Sparkles, 
  Feather, 
  X, 
  UserCheck, 
  Inbox, 
  ExternalLink,
  ShieldCheck,
  Compass
} from "lucide-react"
import toast from "react-hot-toast"
import BirdLoader from "@/components/BirdLoader"
import Link from "next/link"

interface UserSummary {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  bio?: string | null
}

interface ConnectionRequestItem {
  id: string
  createdAt: string | Date
  sender?: UserSummary
  receiver?: UserSummary
}

interface ConnectPartnerClientProps {
  currentUser: UserSummary
  initialIncomingRequests: ConnectionRequestItem[]
  initialOutgoingRequests: ConnectionRequestItem[]
}

export default function ConnectPartnerClient({
  currentUser,
  initialIncomingRequests,
  initialOutgoingRequests,
}: ConnectPartnerClientProps) {
  const router = useRouter()

  // State
  const [partnerEmail, setPartnerEmail] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [searchedUser, setSearchedUser] = useState<UserSummary | null>(null)
  const [sendingInvite, setSendingInvite] = useState(false)

  // Requests state
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    initialIncomingRequests.length > 0 ? "incoming" : "outgoing"
  )
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequestItem[]>(initialIncomingRequests)
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequestItem[]>(initialOutgoingRequests)
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null)

  // Copy feedback states
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedTelegram, setCopiedTelegram] = useState(false)

  // Copy own email address
  const handleCopyAddress = () => {
    if (!currentUser.email) return
    navigator.clipboard.writeText(currentUser.email)
    setCopiedAddress(true)
    toast.success("Dispatch address copied to clipboard!", {
      icon: "✉️",
      style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
    })
    setTimeout(() => setCopiedAddress(false), 2500)
  }

  // Copy quick invite note for messaging apps
  const handleCopyTelegram = () => {
    const inviteText = `I have opened a private letterbox on Dear You. Find my station with my postal address: ${currentUser.email} 🕊️✉️`
    navigator.clipboard.writeText(inviteText)
    setCopiedTelegram(true)
    toast.success("Telegram invite copied! Share with your soulmate.", {
      icon: "🕊️",
      style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
    })
    setTimeout(() => setCopiedTelegram(false), 2500)
  }

  // Search partner by email
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerEmail.trim()) return

    setSearchError("")
    setSearchedUser(null)
    setSearchLoading(true)

    try {
      const res = await fetch(`/api/partner/search?email=${encodeURIComponent(partnerEmail.trim())}`)
      const data = await res.json()

      if (res.ok) {
        setSearchedUser(data)
      } else {
        setSearchError(data.message || "No registered public station found with this address.")
      }
    } catch (err) {
      setSearchError("Failed to reach the postal registry. Check your connection.")
    } finally {
      setSearchLoading(false)
    }
  }

  // Send connection request
  const handleSendInvite = async (partnerId: string) => {
    setSendingInvite(true)
    try {
      const res = await fetch("/api/partner/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Invitation dispatched by carrier bird! 🕊️", {
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
        // Add to outgoing requests
        if (searchedUser) {
          const newRequest: ConnectionRequestItem = {
            id: `temp-${Date.now()}`,
            createdAt: new Date(),
            receiver: searchedUser
          }
          setOutgoingRequests(prev => [newRequest, ...prev])
          setActiveTab("outgoing")
        }
        setSearchedUser(null)
        setPartnerEmail("")
      } else {
        toast.error(data.message || "Failed to dispatch invitation.", {
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
      }
    } catch (err) {
      toast.error("An error occurred while dispatching the invitation.")
    } finally {
      setSendingInvite(false)
    }
  }

  // Handle incoming request (Accept / Decline)
  const handleIncomingAction = async (requestId: string, action: "ACCEPT" | "DECLINE") => {
    setRequestActionLoading(requestId)
    try {
      const res = await fetch("/api/partner/requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action })
      })

      const data = await res.json()

      if (res.ok) {
        if (action === "ACCEPT") {
          toast.success("Bond sealed! You are officially partners in correspondence! ❤️", {
            duration: 4000,
            icon: "💌",
            style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #c2410c" }
          })
          router.refresh()
        } else {
          toast("Invitation declined.", {
            icon: "✖️",
            style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
          })
          setIncomingRequests(prev => prev.filter(req => req.id !== requestId))
        }
      } else {
        toast.error(data.message || "Failed to update invitation.")
      }
    } catch (err) {
      toast.error("Communication error with registry.")
    } finally {
      setRequestActionLoading(null)
    }
  }

  // Cancel outgoing request
  const handleCancelOutgoing = async (requestId: string) => {
    setRequestActionLoading(requestId)
    try {
      const res = await fetch("/api/partner/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Invitation withdrawn.", {
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
        setOutgoingRequests(prev => prev.filter(req => req.id !== requestId))
      } else {
        toast.error(data.message || "Failed to cancel invitation.")
      }
    } catch (err) {
      toast.error("Communication error with registry.")
    } finally {
      setRequestActionLoading(null)
    }
  }

  // Check if searched user already has a pending outgoing request
  const isAlreadyPending = searchedUser && outgoingRequests.some(
    req => req.receiver?.id === searchedUser.id || req.receiver?.email === searchedUser.email
  )

  const myAvatar = currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name || currentUser.email}`

  return (
    <div className="w-full min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 md:px-10 lg:px-12 pt-28 md:pt-36 lg:pt-32 pb-20 max-w-7xl mx-auto flex flex-col justify-start">
      
      {/* Header Banner - Vintage Postmark Atmosphere */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full mb-10 pb-6 border-b border-border-primary flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c2410c] animate-pulse"></span>
            <span className="font-typewriter text-xs uppercase tracking-widest text-[#c2410c]">
              Postal District • Registry of Two
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text-primary tracking-tight">
            The Recipient&apos;s Desk
          </h1>
          <p className="mt-2 text-text-secondary font-serif text-sm sm:text-base max-w-2xl leading-relaxed">
            &ldquo;In an era of fleeting whispers, handwritten letters require someone patient enough to wait for the carrier bird.&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614] border border-border-primary text-xs font-mono text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Station Registry Active</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Edge-to-Edge 2-Column Creative Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: Your Calling Card & Guide (5 Cols) ================= */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          {/* User's Stationery Calling Card */}
          <div className="relative bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden group">
            {/* Vintage Postmark Stamp Watermark in top right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none select-none opacity-20 group-hover:opacity-30 transition-opacity">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#c2410c] flex flex-col items-center justify-center p-1 text-center rotate-12">
                <span className="text-[7px] font-mono tracking-tighter uppercase text-[#c2410c]">POST HEART</span>
                <span className="text-[9px] font-serif font-bold text-text-primary my-0.5">AIR DISPATCH</span>
                <span className="text-[6px] font-mono text-text-secondary">EST. 1924</span>
              </div>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex items-center gap-5 mb-6 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-[#1b1917] border-2 border-[#3d362e] p-1 overflow-hidden shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={myAvatar} 
                    alt={currentUser.name || "Station Master"} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#c2410c] text-white p-1 rounded-full border-2 border-[#131211] shadow-sm">
                  <Feather className="w-3 h-3" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block">
                  Station Master
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                  {currentUser.name || "Anonymous Scribe"}
                </h3>
                <span className="text-xs text-text-secondary font-serif italic">
                  Awaiting partner in correspondence
                </span>
              </div>
            </div>

            {/* User Bio snippet if present */}
            {currentUser.bio && (
              <div className="mb-6 p-4 rounded-2xl bg-[#1a1917]/70 border border-[#2b2722] text-xs sm:text-sm text-text-secondary font-serif leading-relaxed italic">
                &ldquo;{currentUser.bio}&rdquo;
              </div>
            )}

            {/* Postal Address Field (One-Click Copy) */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#c2410c]" />
                  Your Postal Dispatch Address
                </label>
                <span className="text-[10px] font-serif text-[#c2410c]/80">Share with partner</span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0d0c0b] border border-[#2b2722] group-hover:border-[#3d372f] transition-colors">
                <span className="font-typewriter text-xs sm:text-sm text-text-primary tracking-wide select-all truncate">
                  {currentUser.email}
                </span>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221f1c] hover:bg-[#2e2a26] text-text-primary border border-[#3b352e] text-xs font-mono transition-all hover:scale-105 active:scale-95"
                  title="Copy postal address"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCopyTelegram}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedTelegram ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Telegram Note Copied!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>Copy Invitation Telegram</span>
                  </>
                )}
              </button>

              <Link
                href="/profile"
                className="py-3 px-4 rounded-xl bg-transparent hover:bg-[#1b1917] text-text-secondary hover:text-text-primary border border-transparent hover:border-[#2e2a25] text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Edit Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Romantic 3-Step Postal Lore Guide */}
          <div className="bg-[#100f0e] border border-[#24211d] rounded-3xl p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#c2410c]" />
              <h4 className="text-sm font-serif font-bold text-text-primary uppercase tracking-wider">
                The Three Seals of Connection
              </h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#1c1a18] border border-[#332e27] text-text-secondary font-typewriter text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h5 className="text-xs font-serif font-semibold text-text-primary">Exchange Dispatch Address</h5>
                  <p className="text-[11px] text-text-secondary font-serif leading-relaxed mt-0.5">
                    Share your postal email with your intended partner so they can locate your station.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#1c1a18] border border-[#332e27] text-text-secondary font-typewriter text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h5 className="text-xs font-serif font-semibold text-text-primary">Dispatch the Invitation</h5>
                  <p className="text-[11px] text-text-secondary font-serif leading-relaxed mt-0.5">
                    Enter their address in the telegraph terminal to seal a formal bond request.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#1c1a18] border border-[#332e27] text-text-secondary font-typewriter text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h5 className="text-xs font-serif font-semibold text-text-primary">The Unbroken Thread</h5>
                  <p className="text-[11px] text-text-secondary font-serif leading-relaxed mt-0.5">
                    Once accepted, your letterboxes unite. Carrier birds will deliver your letters with real-time transit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* ================= RIGHT COLUMN: Telegraph Search & Registry Terminal (7 Cols) ================= */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          {/* Card 1: Search Console */}
          <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#1e1b18] border border-[#332e27] text-[#c2410c]">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-text-primary">
                    Search Postal Registry
                  </h3>
                  <p className="text-xs text-text-secondary font-serif">
                    Lookup a recipient by their dispatch address to seal a connection.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-secondary">
                  <Search className="w-5 h-5 text-text-secondary" />
                </div>
                
                <input 
                  type="email" 
                  required
                  value={partnerEmail}
                  onChange={(e) => {
                    setPartnerEmail(e.target.value)
                    if (searchError) setSearchError("")
                  }}
                  className="w-full bg-[#0d0c0b] border border-[#2b2722] rounded-2xl py-3.5 pl-12 pr-28 text-sm sm:text-base font-typewriter text-text-primary focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors placeholder:text-text-secondary/40 placeholder:font-serif"
                  placeholder="partner@domain.com..."
                />

                <div className="absolute inset-y-0 right-1.5 flex items-center">
                  <button 
                    type="submit"
                    disabled={searchLoading || !partnerEmail.trim()}
                    className="h-10 px-4 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-medium transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none shadow-md active:scale-95"
                  >
                    {searchLoading ? (
                      <BirdLoader className="w-5 h-5 text-white" />
                    ) : (
                      <>
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {searchError && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs sm:text-sm font-serif leading-relaxed flex items-start gap-3"
              >
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Station Not Located</span>
                  {searchError}
                </div>
              </motion.div>
            )}

            {/* Live Searched User Result Card */}
            <AnimatePresence>
              {searchedUser && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 rounded-2xl bg-[#181614] border border-[#383129] shadow-lg relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#221f1c] border-2 border-[#3d362e] p-0.5 overflow-hidden shrink-0 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={searchedUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${searchedUser.name || searchedUser.email}`} 
                          alt={searchedUser.name || "Station"} 
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-serif font-bold text-text-primary">
                            {searchedUser.name || "Anonymous Scribe"}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono">
                            Public Station
                          </span>
                        </div>
                        {searchedUser.email && (
                          <span className="text-xs font-typewriter text-text-secondary block mt-0.5">
                            {searchedUser.email}
                          </span>
                        )}
                        {searchedUser.bio && (
                          <p className="text-xs font-serif text-text-secondary italic line-clamp-2 mt-1.5">
                            &ldquo;{searchedUser.bio}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action on Found User */}
                    <div className="w-full sm:w-auto shrink-0">
                      {isAlreadyPending ? (
                        <div className="px-4 py-2.5 rounded-xl bg-[#201d1a] border border-[#3a342c] text-text-secondary text-xs font-mono flex items-center justify-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#c2410c]" />
                          <span>Request Pending</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendInvite(searchedUser.id)}
                          disabled={sendingInvite}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {sendingInvite ? (
                            <BirdLoader className="w-4 h-4 text-white" />
                          ) : (
                            <>
                              <Heart className="w-3.5 h-3.5 fill-current" />
                              <span>Dispatch Bond Invitation</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 2: Active Dispatches Registry (Incoming & Sent Tabs) */}
          <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-8 shadow-2xl flex-1 flex flex-col">
            
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-[#24211d] pb-4 mb-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("incoming")}
                  className={`relative pb-1 text-xs sm:text-sm font-serif font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "incoming" ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Incoming Invitations</span>
                  {incomingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c2410c] text-white text-[10px] font-mono font-bold">
                      {incomingRequests.length}
                    </span>
                  )}
                  {activeTab === "incoming" && (
                    <motion.div 
                      layoutId="activeTabUnderline" 
                      className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#c2410c]"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("outgoing")}
                  className={`relative pb-1 text-xs sm:text-sm font-serif font-medium transition-colors flex items-center gap-2 ${
                    activeTab === "outgoing" ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Sent Invitations</span>
                  {outgoingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#27231f] border border-[#3d372e] text-text-secondary text-[10px] font-mono">
                      {outgoingRequests.length}
                    </span>
                  )}
                  {activeTab === "outgoing" && (
                    <motion.div 
                      layoutId="activeTabUnderline" 
                      className="absolute -bottom-4 left-0 right-0 h-0.5 bg-[#c2410c]"
                    />
                  )}
                </button>
              </div>

              <span className="text-[10px] font-mono text-text-secondary hidden sm:inline-block">
                UPDATED LIVE
              </span>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col">
              
              {/* TAB 1: INCOMING INVITATIONS */}
              {activeTab === "incoming" && (
                <div className="flex-1">
                  {incomingRequests.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#1b1917] border border-[#2b2722] flex items-center justify-center mb-3 text-text-secondary">
                        <Mail className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-serif font-semibold text-text-primary">
                        No Incoming Invitations
                      </h4>
                      <p className="text-xs text-text-secondary font-serif max-w-sm mt-1">
                        When someone searches your postal address and dispatches an invitation, it will manifest here awaiting your wax seal.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incomingRequests.map((req) => {
                        const sender = req.sender
                        const senderAvatar = sender?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${sender?.name || sender?.email}`
                        const isLoading = requestActionLoading === req.id

                        return (
                          <div 
                            key={req.id}
                            className="p-5 rounded-2xl bg-[#171614] border border-[#2e2924] hover:border-[#3d372f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-[#201d1a] border border-[#3b342c] p-0.5 overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={senderAvatar} alt={sender?.name || "Sender"} className="w-full h-full object-cover rounded-xl" />
                              </div>
                              <div>
                                <h4 className="text-base font-serif font-bold text-text-primary">
                                  {sender?.name || "Anonymous Scribe"}
                                </h4>
                                <span className="text-xs font-typewriter text-text-secondary block">
                                  {sender?.email}
                                </span>
                                <span className="text-[10px] font-mono text-[#c2410c] mt-1 block">
                                  Has requested to bond correspondence stations
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2.5 self-end sm:self-auto">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleIncomingAction(req.id, "DECLINE")}
                                className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-red-950/20 text-text-secondary hover:text-red-400 border border-transparent hover:border-red-900/40 text-xs font-serif transition-colors disabled:opacity-50"
                              >
                                Decline
                              </button>

                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleIncomingAction(req.id, "ACCEPT")}
                                className="px-4 py-2 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <BirdLoader className="w-4 h-4 text-white" />
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Accept & Seal</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SENT INVITATIONS */}
              {activeTab === "outgoing" && (
                <div className="flex-1">
                  {outgoingRequests.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-[#1b1917] border border-[#2b2722] flex items-center justify-center mb-3 text-text-secondary">
                        <Send className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-serif font-semibold text-text-primary">
                        No Dispatched Invitations
                      </h4>
                      <p className="text-xs text-text-secondary font-serif max-w-sm mt-1">
                        Use the search terminal above to find your partner&apos;s station and dispatch an invitation seal.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {outgoingRequests.map((req) => {
                        const receiver = req.receiver
                        const receiverAvatar = receiver?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${receiver?.name || receiver?.email}`
                        const isLoading = requestActionLoading === req.id

                        return (
                          <div 
                            key={req.id}
                            className="p-5 rounded-2xl bg-[#171614] border border-[#2e2924] hover:border-[#3d372f] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-[#201d1a] border border-[#3b342c] p-0.5 overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={receiverAvatar} alt={receiver?.name || "Recipient"} className="w-full h-full object-cover rounded-xl" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-serif font-bold text-text-primary">
                                    {receiver?.name || "Anonymous Scribe"}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full bg-[#24211d] border border-[#3d372f] text-text-secondary text-[10px] font-mono">
                                    In Flight
                                  </span>
                                </div>
                                <span className="text-xs font-typewriter text-text-secondary block mt-0.5">
                                  {receiver?.email}
                                </span>
                                <span className="text-[10px] font-serif text-[#c2410c] mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Awaiting recipient&apos;s wax seal...
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="self-end sm:self-auto">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleCancelOutgoing(req.id)}
                                className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-red-950/20 text-text-secondary hover:text-red-400 border border-[#2e2924] hover:border-red-900/40 text-xs font-serif transition-colors flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <BirdLoader className="w-3.5 h-3.5" />
                                ) : (
                                  <>
                                    <X className="w-3.5 h-3.5" />
                                    <span>Withdraw</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </motion.div>

      </div>
    </div>
  )
}
