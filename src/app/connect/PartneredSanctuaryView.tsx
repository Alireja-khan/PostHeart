"use client"

import { motion } from "framer-motion"
import { 
  Heart, 
  Mail, 
  PenLine, 
  Globe, 
  Clock, 
  Calendar, 
  Sparkles, 
  Send, 
  Inbox, 
  ShieldCheck, 
  ExternalLink 
} from "lucide-react"
import Link from "next/link"
import DisconnectButton from "./DisconnectButton"

interface PartnerData {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  bio?: string | null
  createdAt?: string | Date
}

interface UserData {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  bio?: string | null
}

interface PartneredSanctuaryViewProps {
  currentUser: UserData
  partner: PartnerData
  lettersSentCount: number
  lettersReceivedCount: number
  isDisconnectPending: boolean
}

export default function PartneredSanctuaryView({
  currentUser,
  partner,
  lettersSentCount,
  lettersReceivedCount,
  isDisconnectPending,
}: PartneredSanctuaryViewProps) {
  const userAvatar = currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name || currentUser.email}`
  const partnerAvatar = partner.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.name || partner.email}`

  const totalLetters = lettersSentCount + lettersReceivedCount

  return (
    <div className="w-full min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 md:px-10 lg:px-12 pt-36 md:pt-44 lg:pt-40 pb-20 max-w-7xl mx-auto flex flex-col justify-start">
      
      {/* Header Banner - Sanctuary Lore */}
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
              Postal Sanctuary • Bond of Two
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text-primary tracking-tight">
            The Shared Sanctuary
          </h1>
          <p className="mt-2 text-text-secondary font-serif text-sm sm:text-base max-w-2xl leading-relaxed">
            &ldquo;Two stations intertwined across space and time. Every word written is a quiet bridge between your hearts.&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#181614] border border-[#383129] text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Bond Sealed & Active</span>
          </div>
        </div>
      </motion.div>

      {/* Centerpiece: The Two Crests & The Red Thread of Fate */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-[#121110] border border-[#2b2722] rounded-3xl p-6 sm:p-10 lg:p-12 mb-8 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c2410c]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          
          {/* Left Crest: Current User */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1a1917] border-2 border-[#3d362e] p-1.5 overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={userAvatar} 
                  alt={currentUser.name || "You"} 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-2 right-1 bg-[#221f1c] text-text-primary px-2.5 py-0.5 rounded-full border border-[#3d362e] text-[10px] font-mono shadow-md">
                You
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block">
              Sender Station
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mt-1">
              {currentUser.name || "Anonymous Scribe"}
            </h3>
            <span className="text-xs font-typewriter text-text-secondary mt-1">
              {currentUser.email}
            </span>
          </div>

          {/* Center Connector: Animated Red Thread & Carrier Seal */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/3 px-4">
            {/* The Thread Visual */}
            <div className="w-full flex items-center justify-center relative py-4">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c2410c]/70 to-transparent" />
              
              {/* Central Seal Medallion */}
              <div className="relative z-10 p-3 sm:p-4 rounded-full bg-[#1b1917] border-2 border-[#c2410c] shadow-[0_0_20px_rgba(194,65,12,0.3)] flex flex-col items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#c2410c] fill-[#c2410c] animate-pulse" />
              </div>
            </div>

            <span className="text-xs font-serif italic text-text-secondary mt-2 text-center">
              The Unbroken Thread
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#c2410c] uppercase mt-0.5">
              Postal Route Active
            </span>
          </div>

          {/* Right Crest: Partner */}
          <div className="flex flex-col items-center text-center w-full md:w-1/3">
            <div className="relative mb-4 group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1a1917] border-2 border-[#3d362e] p-1.5 overflow-hidden shadow-xl transition-transform duration-300 group-hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={partnerAvatar} 
                  alt={partner.name || "Partner"} 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-2 right-1 bg-[#c2410c] text-white px-2.5 py-0.5 rounded-full border border-[#1b1917] text-[10px] font-mono shadow-md">
                Partner
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block">
              Recipient Station
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mt-1">
              {partner.name || "Anonymous Scribe"}
            </h3>
            <span className="text-xs font-typewriter text-text-secondary mt-1">
              {partner.email}
            </span>
          </div>

        </div>

        {/* Quick Action Dock */}
        <div className="mt-10 pt-8 border-t border-[#26221d] flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/write"
            className="px-6 py-3 rounded-2xl bg-[#c2410c] hover:bg-[#a3360a] text-white font-serif text-sm font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            <PenLine className="w-4 h-4" />
            <span>Write Letter to {partner.name || "Partner"}</span>
          </Link>

          <Link
            href="/world"
            className="px-5 py-3 rounded-2xl bg-[#1a1816] hover:bg-[#24211e] text-text-primary border border-[#332d26] font-serif text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-[#c2410c]" />
            <span>Our Shared World</span>
          </Link>

          <Link
            href={`/user/${partner.id}`}
            className="px-5 py-3 rounded-2xl bg-transparent hover:bg-[#1a1816] text-text-secondary hover:text-text-primary border border-transparent hover:border-[#332d26] font-serif text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Public Desk</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Grid: Shared Correspondence Metrics & Partner's Desk Note */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        
        {/* Left: 4-Card Correspondence Metrics (7 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Card 1: Letters Sent */}
          <div className="p-6 rounded-3xl bg-[#131211] border border-[#2b2722] shadow-md flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#1b1917] border border-[#383129] text-[#c2410c]">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary block">
                {lettersSentCount}
              </span>
              <span className="text-xs text-text-secondary font-serif">
                Letters Dispatched by You
              </span>
            </div>
          </div>

          {/* Card 2: Letters Received */}
          <div className="p-6 rounded-3xl bg-[#131211] border border-[#2b2722] shadow-md flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#1b1917] border border-[#383129] text-amber-500">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary block">
                {lettersReceivedCount}
              </span>
              <span className="text-xs text-text-secondary font-serif">
                Letters Received from Partner
              </span>
            </div>
          </div>

          {/* Card 3: Total Correspondence */}
          <div className="p-6 rounded-3xl bg-[#131211] border border-[#2b2722] shadow-md flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#1b1917] border border-[#383129] text-[#c2410c]">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-serif font-bold text-text-primary block">
                {totalLetters}
              </span>
              <span className="text-xs text-text-secondary font-serif">
                Total Letters Exchanged
              </span>
            </div>
          </div>

          {/* Card 4: Postal Route Status */}
          <div className="p-6 rounded-3xl bg-[#131211] border border-[#2b2722] shadow-md flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#1b1917] border border-[#383129] text-emerald-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-serif font-bold text-text-primary block">
                Carrier Birds Ready
              </span>
              <span className="text-xs text-text-secondary font-serif">
                Real-Time Route Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right: Partner's Desk Note & Stationery (5 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-[#131211] border border-[#2b2722] shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#c2410c]" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                Partner&apos;s Desk Note
              </h4>
            </div>

            <p className="font-serif text-sm sm:text-base text-text-primary leading-relaxed italic whitespace-pre-wrap">
              {partner.bio ? `\u201C${partner.bio}\u201D` : "\u201CWe write to taste life twice, in the moment and in retrospect.\u201D \u2014 Ana\u00EFs Nin"}
            </p>

            <div className="mt-4 pt-4 border-t border-[#24211d] flex items-center justify-between text-xs font-serif text-text-secondary">
              <span>Station Master</span>
              <span className="font-semibold text-text-primary">{partner.name || "Partner"}</span>
            </div>
          </div>

          {/* Sanctuary Management / Disconnect Section */}
          <div className="p-6 rounded-3xl bg-[#100f0e] border border-[#24211d] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h5 className="text-xs font-serif font-bold text-text-primary">
                Sanctuary Settings
              </h5>
              <p className="text-[11px] text-text-secondary font-serif mt-0.5">
                Manage partner connection or request unlinking of stations.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <DisconnectButton initialPending={isDisconnectPending} />
            </div>
          </div>
        </motion.div>

      </div>

    </div>
  )
}
