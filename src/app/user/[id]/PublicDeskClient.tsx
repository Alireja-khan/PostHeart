"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Mail, 
  Copy, 
  Check, 
  Share2, 
  Heart, 
  Calendar, 
  Feather, 
  Sparkles, 
  Send, 
  Inbox, 
  Archive, 
  Compass, 
  ExternalLink,
  PenLine,
  Globe,
  Eye,
  ShieldCheck,
  UserCheck,
  LogIn
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import ConnectButton from "./ConnectButton"

interface UserProfileData {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  coverUrl: string | null
  bio?: string | null
  gender?: string | null
  isPublic: boolean
  showEmail: boolean
  createdAt: string | Date
  partnerId: string | null
  partner?: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
  _count?: {
    letters: number
    received: number
    milestones: number
    keepsakes: number
  }
}

interface PublicDeskClientProps {
  user: UserProfileData
  isSelf: boolean
  isPartner: boolean
  isPending: boolean
  hasOtherPartner: boolean
  isLoggedIn: boolean
}

export default function PublicDeskClient({
  user,
  isSelf,
  isPartner,
  isPending,
  hasOtherPartner,
  isLoggedIn,
}: PublicDeskClientProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const currentAvatar = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`
  const currentCover = user.coverUrl || "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop"

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : ""

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      toast.success("Station desk URL copied to clipboard!", {
        icon: "🔗",
        style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
      })
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email)
    setCopiedEmail(true)
    toast.success("Dispatch address copied!", {
      icon: "✉️",
      style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
    })
    setTimeout(() => setCopiedEmail(false), 2500)
  }

  const canShowEmail = user.showEmail || isPartner || isSelf

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative pb-28">
      
      {/* ================= HERO COVER BANNER ================= */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-[340px] w-full overflow-hidden group border-b border-border-primary">
        {/* Cover Photo with Layered Ambient Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentCover} 
            alt="Station Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/45"></div>
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent"></div>
        </div>

        {/* Top Floating Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-20 flex items-center justify-between">
          <Link
            href={isSelf ? "/profile" : "/connect"}
            className="backdrop-blur-md bg-black/50 hover:bg-black/75 border border-white/15 text-white/90 hover:text-white px-4 py-2 rounded-full text-xs font-serif transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>{isSelf ? "Back to My Profile" : "Back to Registry"}</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="backdrop-blur-md bg-black/50 hover:bg-black/75 border border-white/15 text-white/90 hover:text-white px-4 py-2 rounded-full text-xs font-mono transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95"
            title="Share station desk link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Desk Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>Share Desk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ================= STATION MASTER PASSPORT & IDENTITY DOCK ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 md:-mt-24 pb-8 border-b border-border-primary">
          
          {/* Avatar & Identification */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl bg-[#1b1917] border-4 border-bg-primary p-1 overflow-hidden shadow-2xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentAvatar} 
                  alt={user.name || "Station Master"} 
                  className="w-full h-full object-cover rounded-2xl" 
                />
              </div>

              {/* Status Badge Ring */}
              <div className="absolute -bottom-1 -right-1 bg-[#1b1917] text-[#c2410c] p-2 rounded-full border-2 border-bg-primary shadow-lg">
                <Heart className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="mb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#c2410c]">
                  Public Station Desk
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-text-primary tracking-tight">
                {user.name || "Anonymous Scribe"}
              </h1>

              {canShowEmail ? (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-text-secondary font-typewriter">
                  <Mail className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>{user.email}</span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 rounded hover:bg-[#201d1a] transition-colors text-text-secondary hover:text-text-primary"
                    title="Copy postal address"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-text-secondary font-serif italic mt-1 block">
                  Postal address kept private by station master
                </span>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 mb-1">
            {isPartner ? (
              <span className="inline-flex items-center px-4 py-1.5 bg-[#241c18] text-[#c2410c] text-xs font-mono font-medium rounded-full border border-[#422c22] shadow-sm">
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" /> 
                <span>Your Bonded Partner</span>
              </span>
            ) : hasOtherPartner ? (
              <span className="inline-flex items-center px-4 py-1.5 bg-[#1b1917] text-text-secondary text-xs font-mono font-medium rounded-full border border-[#332e27] shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#c2410c]" /> 
                <span>Bonded Station</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 bg-[#132017] text-emerald-400 text-xs font-mono font-medium rounded-full border border-[#223d29] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                <span>Open for Correspondence</span>
              </span>
            )}

            {memberSince && (
              <span className="inline-flex items-center px-3.5 py-1.5 bg-[#171614] text-text-secondary text-xs font-mono rounded-full border border-[#2b2722] shadow-sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#c2410c]" /> {memberSince}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* ================= MAIN CONTENT WORKSPACE (2-COLUMN GRID) ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: Scribe Manuscript & Records (7 Cols) ================= */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 flex flex-col gap-8"
          >
            {/* Scribe's Manuscript Card */}
            <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#24211d] pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#c2410c]" />
                  <h3 className="text-sm font-serif font-bold text-text-primary uppercase tracking-wider">
                    Scribe&apos;s Desk Note & Biography
                  </h3>
                </div>
                <span className="font-typewriter text-[9px] uppercase tracking-widest text-text-secondary/70">
                  PUBLIC MANUSCRIPT
                </span>
              </div>

              {user.bio ? (
                <div className="space-y-4">
                  <p className="text-base sm:text-lg text-text-primary font-serif leading-relaxed italic whitespace-pre-wrap pl-3 border-l-2 border-[#c2410c]">
                    &ldquo;{user.bio}&rdquo;
                  </p>
                  <span className="font-handwriting text-2xl text-[#c2410c] block text-right pr-4">
                    ~ {user.name || "Station Master"}
                  </span>
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#1b1917] border border-[#2e2a25] flex items-center justify-center text-text-secondary mb-3">
                    <Feather className="w-5 h-5 text-[#c2410c]" />
                  </div>
                  <h4 className="text-sm font-serif font-semibold text-text-primary">
                    A Quiet Station Desk
                  </h4>
                  <p className="text-xs text-text-secondary font-serif max-w-sm mt-1">
                    This scribe has not penned a personal desk note yet, leaving their letters to speak for themselves.
                  </p>
                </div>
              )}
            </div>

            {/* Postal Activity Ledger Grid */}
            {user._count && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Feather className="w-4 h-4 text-[#c2410c]" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-secondary">
                    Station Activity & Postal History
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-[#131211] border border-[#2b2722] shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Send className="w-4 h-4 text-[#c2410c]" />
                      <span className="text-[9px] font-mono text-text-secondary/60">SENT</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary block">
                      {user._count.letters}
                    </span>
                    <span className="text-[11px] text-text-secondary font-serif mt-0.5 block">
                      Dispatched
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131211] border border-[#2b2722] shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Inbox className="w-4 h-4 text-amber-500" />
                      <span className="text-[9px] font-mono text-text-secondary/60">RCVD</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary block">
                      {user._count.received}
                    </span>
                    <span className="text-[11px] text-text-secondary font-serif mt-0.5 block">
                      Delivered
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131211] border border-[#2b2722] shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Archive className="w-4 h-4 text-[#c2410c]" />
                      <span className="text-[9px] font-mono text-text-secondary/60">VAULT</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary block">
                      {user._count.keepsakes}
                    </span>
                    <span className="text-[11px] text-text-secondary font-serif mt-0.5 block">
                      Keepsakes
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#131211] border border-[#2b2722] shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Calendar className="w-4 h-4 text-emerald-400" />
                      <span className="text-[9px] font-mono text-text-secondary/60">DATES</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-text-primary block">
                      {user._count.milestones}
                    </span>
                    <span className="text-[11px] text-text-secondary font-serif mt-0.5 block">
                      Milestones
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>


          {/* ================= RIGHT COLUMN: Connection Terminal & Actions (5 Cols) ================= */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* CASE 1: USER IS VIEWING THEIR OWN DESK */}
            {isSelf && (
              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-[#c2410c]" />
                  <h4 className="text-base font-serif font-bold text-text-primary">
                    Your Public Station Desk
                  </h4>
                </div>
                <p className="text-xs text-text-secondary font-serif leading-relaxed mb-6">
                  This is your public desk as seen by other scribes and pen-pals across Dear You. You can customize your pen-name, public bio, and visibility at any time.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white font-serif text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PenLine className="w-4 h-4" />
                    <span>Edit Profile & Desk Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-3 px-4 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] text-xs font-mono transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#c2410c]" />
                    <span>Copy Shareable Desk Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* CASE 2: USER IS ALREADY PARTNERS WITH THIS SCRIBE */}
            {!isSelf && isPartner && (
              <div className="bg-[#131211] border border-[#3b2a22] rounded-3xl p-6 sm:p-7 shadow-xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#221c18] border border-[#422c22] flex items-center justify-center mx-auto mb-4 text-[#c2410c]">
                  <Heart className="w-7 h-7 fill-current" />
                </div>

                <h4 className="text-lg font-serif font-bold text-text-primary">
                  Bonded Partners
                </h4>
                <p className="text-xs text-text-secondary font-serif mt-1.5 leading-relaxed max-w-sm mx-auto mb-6">
                  You and {user.name || "your partner"} share an unbroken postal route. Carrier birds deliver your letters directly between mailboxes.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/write"
                    className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white font-serif text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PenLine className="w-4 h-4" />
                    <span>Write a Letter to {user.name || "Them"}</span>
                  </Link>

                  <Link
                    href="/world"
                    className="w-full py-3 px-4 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] font-serif text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4 text-[#c2410c]" />
                    <span>Open Shared World</span>
                  </Link>
                </div>
              </div>
            )}

            {/* CASE 3: SCRIBE ALREADY HAS ANOTHER PARTNER */}
            {!isSelf && !isPartner && hasOtherPartner && (
              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-7 shadow-xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1a1917] border border-[#332e27] flex items-center justify-center mx-auto mb-4 text-text-secondary">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <h4 className="text-lg font-serif font-bold text-text-primary">
                  Station Already Bonded
                </h4>
                <p className="text-xs text-text-secondary font-serif mt-1.5 leading-relaxed max-w-sm mx-auto">
                  {user.name || "This scribe"} is already in an exclusive postal correspondence with another partner.
                </p>
              </div>
            )}

            {/* CASE 4: ELIGIBLE TO DISPATCH INVITATION */}
            {!isSelf && !isPartner && !hasOtherPartner && isLoggedIn && (
              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-7 shadow-xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <Compass className="w-5 h-5 text-[#c2410c]" />
                  <h4 className="text-base font-serif font-bold text-text-primary">
                    Dispatch Connection Invitation
                  </h4>
                </div>
                <p className="text-xs text-text-secondary font-serif leading-relaxed mb-6">
                  Dispatch a formal wax-sealed invitation to {user.name || "this scribe"}. Once accepted, your mailboxes become one shared sanctuary.
                </p>

                <ConnectButton partnerId={user.id} initialPending={isPending} />
              </div>
            )}

            {/* CASE 5: VISITOR NOT LOGGED IN */}
            {!isLoggedIn && (
              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-7 shadow-xl text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1b1917] border border-[#332e27] flex items-center justify-center mx-auto mb-4 text-[#c2410c]">
                  <Feather className="w-7 h-7" />
                </div>

                <h4 className="text-lg font-serif font-bold text-text-primary">
                  Write to {user.name || "this Scribe"}
                </h4>
                <p className="text-xs text-text-secondary font-serif mt-1.5 leading-relaxed max-w-sm mx-auto mb-6">
                  Create your private letterbox on Dear You to connect stations and send slow, heartfelt letters across distance.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/register"
                    className="w-full py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white font-serif text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Open Your Letterbox</span>
                  </Link>

                  <Link
                    href="/login"
                    className="w-full py-3 px-4 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] font-serif text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            )}

            {/* The Sanctuary Lore Note */}
            <div className="bg-[#100f0e] border border-[#24211d] rounded-3xl p-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block mb-1">
                POSTAL CREED
              </span>
              <h5 className="text-xs font-serif font-bold text-text-primary">
                A Haven for Slow Correspondence
              </h5>
              <p className="text-[11px] text-text-secondary font-serif leading-relaxed mt-1.5">
                Every letter dispatched takes time to travel through the wind. There are no read receipts or instant typing bubbles — only patience and deliberate ink.
              </p>
            </div>

          </motion.div>

        </div>
      </main>

    </div>
  )
}
