"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Save, 
  Image as ImageIcon, 
  CheckCircle2, 
  Calendar, 
  Send, 
  Inbox, 
  Archive, 
  Heart, 
  User, 
  Shield, 
  LayoutDashboard, 
  Camera, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Feather, 
  PenLine, 
  Sparkles, 
  Globe, 
  Clock, 
  ArrowRight,
  Compass
} from "lucide-react"
import toast from "react-hot-toast"
import BirdLoader from "@/components/BirdLoader"
import { uploadFile } from "@/lib/upload"
import Link from "next/link"

type ProfileStats = {
  letters: number
  received: number
  milestones: number
  keepsakes: number
}

interface PartnerInfo {
  id: string
  name: string | null
  email: string
  avatarUrl: string | null
  gender?: string | null
  bio?: string | null
}

export default function Profile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  
  const [activeTab, setActiveTab] = useState("overview")
  
  const [userId, setUserId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [bio, setBio] = useState("")
  const [gender, setGender] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  
  const [memberSince, setMemberSince] = useState("")
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [partner, setPartner] = useState<PartnerInfo | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ letters: 0, received: 0, milestones: 0, keepsakes: 0 })
  const [copiedAddress, setCopiedAddress] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then(res => res.json())
        .then(data => {
          if (data.id) setUserId(data.id)
          setName(data.name || session?.user?.name || "")
          setAvatarUrl(data.avatarUrl || "")
          setCoverUrl(data.coverUrl || "")
          setBio(data.bio || "")
          setGender(data.gender || "")
          setIsPublic(data.isPublic ?? true)
          setShowEmail(data.showEmail ?? false)
          
          if (data.createdAt) {
            setMemberSince(new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }))
          }
          setPartnerId(data.partnerId || null)
          if (data.partner) {
            setPartner(data.partner)
          }
          if (data._count) {
            setStats(data._count)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [status, session])

  const handleSave = async (customCoverUrl?: string, customAvatarUrl?: string) => {
    setSaving(true)
    setSaved(false)
    try {
      const payload = {
        name,
        avatarUrl: customAvatarUrl !== undefined ? customAvatarUrl : avatarUrl,
        coverUrl: customCoverUrl !== undefined ? customCoverUrl : coverUrl,
        bio,
        gender,
        isPublic,
        showEmail
      }

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSaved(true)
        toast.success("Profile saved successfully!", {
          icon: "📜",
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
        if (name !== session?.user?.name) {
          await update({ name })
        }
        setTimeout(() => setSaved(false), 3000)
      } else {
        toast.error("Failed to save profile.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'avatar') setUploadingAvatar(true)
    if (type === 'cover') setUploadingCover(true)

    try {
      const url = await uploadFile(file)
      if (type === 'avatar') {
        setAvatarUrl(url)
        await handleSave(undefined, url)
        toast.success("Station avatar updated!", {
          icon: "📸",
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
      } else {
        setCoverUrl(url)
        await handleSave(url, undefined)
        toast.success("Station cover updated!", {
          icon: "🌄",
          style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
        })
      }
    } catch (err) {
      console.error(err)
      toast.error("Image upload failed.")
    } finally {
      if (type === 'avatar') setUploadingAvatar(false)
      if (type === 'cover') setUploadingCover(false)
    }
  }

  const handleCopyAddress = () => {
    if (!session?.user?.email) return
    navigator.clipboard.writeText(session.user.email)
    setCopiedAddress(true)
    toast.success("Postal dispatch address copied!", {
      icon: "✉️",
      style: { background: "#1a1918", color: "#f0ebe1", border: "1px solid #332d26" }
    })
    setTimeout(() => setCopiedAddress(false), 2500)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-bg-primary">
        <BirdLoader className="text-text-primary w-12 h-12" />
      </div>
    )
  }

  const currentAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name || session?.user?.email}`
  const currentCover = coverUrl || "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop"

  const tabs = [
    { id: "overview", label: "Station Ledger", icon: LayoutDashboard },
    { id: "settings", label: "Edit Profile", icon: PenLine },
    { id: "privacy", label: "Privacy Controls", icon: Shield },
    { id: "partner", label: "The Sanctuary", icon: Heart },
  ]

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative pb-24">
      
      {/* Hidden File Inputs */}
      <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, 'avatar')} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileUpload(e, 'cover')} className="hidden" accept="image/*" />

      {/* ================= HERO COVER BANNER ================= */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-[340px] w-full overflow-hidden group border-b border-border-primary">
        {/* Cover Image with Cinematic Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={currentCover} 
            alt="Station Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Smooth bottom fade into dark background */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg-primary via-bg-primary/75 to-transparent"></div>
        </div>

        {/* Change Cover Photo Trigger */}
        <div className="absolute top-20 right-6 sm:top-24 sm:right-8 z-20">
          <button 
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="backdrop-blur-md bg-black/50 hover:bg-black/75 border border-white/15 text-white/90 hover:text-white px-3.5 py-2 rounded-full text-xs font-mono transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Change station cover image"
          >
            {uploadingCover ? <BirdLoader className="w-4 h-4 text-white" /> : <Camera className="w-3.5 h-3.5 text-[#c2410c]" />}
            <span className="hidden sm:inline">Change Cover</span>
          </button>
        </div>
      </div>

      {/* ================= STATION MASTER PASSPORT & IDENTITY DOCK ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 md:-mt-24 pb-6 border-b border-border-primary">
          
          {/* Avatar & Scribe Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Frame with Wax Seal Badge */}
            <div className="relative group/avatar shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl bg-[#1b1917] border-4 border-bg-primary p-1 overflow-hidden shadow-2xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-bg-primary/70 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                    <BirdLoader className="w-8 h-8 text-text-primary" />
                  </div>
                )}
              </div>

              {/* Quick Camera Overlay */}
              <button 
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 bg-[#1b1917] hover:bg-[#26221e] text-[#c2410c] p-2 rounded-full border-2 border-bg-primary shadow-lg transition-all hover:scale-110 active:scale-95"
                title="Update station portrait"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Name, Email & Station Meta */}
            <div className="mb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-[#c2410c] animate-pulse"></span>
                <span className="font-typewriter text-[11px] uppercase tracking-widest text-[#c2410c]">
                  Station Master
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-text-primary tracking-tight">
                {name || "Anonymous Scribe"}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-text-secondary font-typewriter">
                <Mail className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>{session?.user?.email}</span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1 rounded hover:bg-[#201d1a] transition-colors text-text-secondary hover:text-text-primary"
                  title="Copy postal address"
                >
                  {copiedAddress ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 mb-1">
            {partnerId ? (
              <span className="inline-flex items-center px-3.5 py-1.5 bg-[#241c18] text-[#c2410c] text-xs font-mono font-medium rounded-full border border-[#422c22] shadow-sm">
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" /> 
                <span>Bonded with {partner?.name || "Partner"}</span>
              </span>
            ) : (
              <Link 
                href="/connect"
                className="inline-flex items-center px-3.5 py-1.5 bg-[#1b1917] hover:bg-[#24211e] text-text-secondary hover:text-text-primary text-xs font-mono font-medium rounded-full border border-[#332e27] shadow-sm transition-colors"
              >
                <Compass className="w-3.5 h-3.5 mr-1.5 text-[#c2410c]" /> 
                <span>Solo Station • Seek Partner</span>
              </Link>
            )}

            {memberSince && (
              <span className="inline-flex items-center px-3.5 py-1.5 bg-[#171614] text-text-secondary text-xs font-mono rounded-full border border-[#2b2722] shadow-sm">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#c2410c]" /> {memberSince}
              </span>
            )}

            <span className="inline-flex items-center px-3.5 py-1.5 bg-[#132017] text-emerald-400 text-xs font-mono rounded-full border border-[#223d29] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              {isPublic ? "Public Station" : "Private Desk"}
            </span>

            {userId && (
              <Link
                href={`/user/${userId}`}
                className="inline-flex items-center px-3.5 py-1.5 bg-transparent hover:bg-[#1b1917] text-text-secondary hover:text-text-primary text-xs font-mono rounded-full border border-[#2b2722] transition-colors"
                title="Preview public profile"
              >
                <span>Public View</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation Rail */}
        <div className="flex items-center justify-between border-b border-border-primary mt-4 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-6 sm:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 pt-2 text-xs sm:text-sm font-serif font-medium transition-colors relative flex items-center gap-2 shrink-0 ${
                    isActive 
                      ? "text-text-primary" 
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#c2410c]" : "text-text-secondary"}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="profileActiveTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c2410c]"
                    />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ================= TAB CONTENTS ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="space-y-10"
            >
              {/* Activity Ledger (4 Metric Cards with Rich Craftsmanship) */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Feather className="w-4 h-4 text-[#c2410c]" />
                    <h2 className="text-sm font-mono uppercase tracking-widest text-text-secondary">
                      Activity Ledger & Archives
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary/70">ALL-TIME POSTAL RECORD</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Letters Sent */}
                  <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#3d372f] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1b1917] border border-[#332e27] rounded-2xl flex items-center justify-center text-[#c2410c]">
                        <Send className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/60">OUTGOING</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
                      {stats.letters}
                    </h3>
                    <p className="text-xs text-text-secondary font-serif mt-1.5">
                      Letters Dispatched Across Distance
                    </p>
                  </div>
                  
                  {/* Card 2: Letters Received */}
                  <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#3d372f] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1b1917] border border-[#332e27] rounded-2xl flex items-center justify-center text-amber-500">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/60">INCOMING</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
                      {stats.received}
                    </h3>
                    <p className="text-xs text-text-secondary font-serif mt-1.5">
                      Letters Delivered & Sealed
                    </p>
                  </div>
                  
                  {/* Card 3: Keepsakes */}
                  <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#3d372f] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1b1917] border border-[#332e27] rounded-2xl flex items-center justify-center text-[#c2410c]">
                        <Archive className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/60">TREASURY</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
                      {stats.keepsakes}
                    </h3>
                    <p className="text-xs text-text-secondary font-serif mt-1.5">
                      Items Preserved in Keepsake Vault
                    </p>
                  </div>

                  {/* Card 4: Milestones */}
                  <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[#3d372f] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#1b1917] border border-[#332e27] rounded-2xl flex items-center justify-center text-emerald-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/60">CHRONICLES</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-serif font-bold text-text-primary tracking-tight">
                      {stats.milestones}
                    </h3>
                    <p className="text-xs text-text-secondary font-serif mt-1.5">
                      Shared Timeline Milestones Recorded
                    </p>
                  </div>
                </div>
              </div>

              {/* 2-Column Creative Work Desk */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Scribe's Manuscript Biography (7 Cols) */}
                <div className="lg:col-span-7 bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#24211d] pb-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#c2410c]" />
                      <h3 className="text-sm font-serif font-bold text-text-primary uppercase tracking-wider">
                        Scribe&apos;s Desk Note & Biography
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("settings")}
                      className="text-xs font-serif text-[#c2410c] hover:underline flex items-center gap-1"
                    >
                      <PenLine className="w-3 h-3" />
                      <span>Edit Note</span>
                    </button>
                  </div>

                  {bio ? (
                    <div className="space-y-4">
                      <p className="text-base sm:text-lg text-text-primary font-serif leading-relaxed italic whitespace-pre-wrap pl-3 border-l-2 border-[#c2410c]">
                        &ldquo;{bio}&rdquo;
                      </p>
                      <span className="font-handwriting text-2xl text-[#c2410c] block text-right pr-4">
                        ~ {name || "Station Master"}
                      </span>
                    </div>
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#1b1917] border border-[#2e2a25] flex items-center justify-center text-text-secondary mb-3">
                        <PenLine className="w-5 h-5 text-[#c2410c]" />
                      </div>
                      <h4 className="text-sm font-serif font-semibold text-text-primary">
                        Your desk note is currently blank
                      </h4>
                      <p className="text-xs text-text-secondary font-serif max-w-sm mt-1">
                        Pen a personal reflection, quote, or welcome note so visitors and your partner can read your quiet thoughts.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("settings")}
                        className="mt-4 px-4 py-2 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-medium transition-colors"
                      >
                        Pen Desk Note ✍️
                      </button>
                    </div>
                  )}
                </div>

                {/* Scribe Calling Card & Quick Station Actions (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* Calling Card */}
                  <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-7 shadow-xl">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block mb-1">
                      POSTAL PASSPORT
                    </span>
                    <h4 className="text-lg font-serif font-bold text-text-primary">
                      Dispatch Station Details
                    </h4>
                    <p className="text-xs text-text-secondary font-serif mt-1">
                      Your unique postal coordinates for receiving letters and carrier birds.
                    </p>

                    <div className="mt-5 p-3.5 rounded-2xl bg-[#0d0c0b] border border-[#24211d] flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase text-text-secondary block">
                          POSTAL ADDRESS
                        </span>
                        <span className="font-typewriter text-xs text-text-primary truncate block mt-0.5">
                          {session?.user?.email}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="shrink-0 px-3 py-1.5 rounded-xl bg-[#1f1c19] hover:bg-[#292521] border border-[#332e27] text-xs font-mono text-text-primary transition-all flex items-center gap-1.5"
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

                    {/* Quick Link Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Link
                        href="/write"
                        className="py-2.5 px-3 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-medium transition-colors flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Write Letter</span>
                      </Link>

                      <Link
                        href="/world"
                        className="py-2.5 px-3 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] text-xs font-serif font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>My World</span>
                      </Link>
                    </div>
                  </div>

                  {/* Carrier Bird Silhouette Note */}
                  <div className="bg-[#100f0e] border border-[#24211d] rounded-3xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1b1917] border border-[#332e27] flex items-center justify-center text-[#c2410c] shrink-0">
                      <Feather className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-serif font-semibold text-text-primary block">
                        Carrier Silhouette: {gender === 'female' ? 'Female Falcon' : gender === 'male' ? 'Male Osprey' : 'Celestial Carrier'}
                      </span>
                      <p className="text-[11px] text-text-secondary font-serif mt-0.5">
                        Guides your messenger bird animation as it travels between letterboxes.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: EDIT PROFILE / SETTINGS ================= */}
          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between border-b border-[#24211d] pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                    Personal Bureau & Scribe Details
                  </h2>
                  <p className="text-text-secondary text-xs sm:text-sm font-serif mt-1">
                    Customize your public pen-name, personal bio, and courier silhouette.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-[#c2410c]/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {saving ? <BirdLoader className="w-4 h-4 text-white" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />)}
                  <span>{saved ? "Saved" : "Save Changes"}</span>
                </button>
              </div>

              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl shadow-xl overflow-hidden divide-y divide-[#24211d]">
                
                {/* Form Section 1: Identity */}
                <div className="p-6 sm:p-8 space-y-6">
                  
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                      Scribe Display Name
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alireja Khan"
                      className="w-full bg-[#0d0c0b] border border-[#2b2722] rounded-2xl px-4 py-3.5 text-sm sm:text-base font-serif text-text-primary focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors"
                    />
                    <p className="text-[11px] text-text-secondary font-serif mt-1.5">
                      The pen-name that appears on your wax seals, envelope signatures, and partner desks.
                    </p>
                  </div>

                  {/* Biography */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary">
                        Station Desk Note & Biography
                      </label>
                      <span className="text-[10px] font-mono text-text-secondary">
                        {bio.length} / 500 chars
                      </span>
                    </div>
                    <textarea 
                      value={bio}
                      maxLength={500}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Pen a quiet reflection about yourself, your favorite poetry, or what you cherish in letters..."
                      rows={5}
                      className="w-full bg-[#0d0c0b] border border-[#2b2722] rounded-2xl p-4 text-sm font-serif text-text-primary focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  {/* Gender / Carrier Bird Silhouette Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                      Carrier Bird Silhouette
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setGender("male")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          gender === "male" 
                            ? "bg-[#221c17] border-[#c2410c] text-text-primary shadow-md" 
                            : "bg-[#0d0c0b] border-[#2b2722] text-text-secondary hover:border-[#3d372e]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-semibold text-sm text-text-primary">Male Osprey</span>
                          <span className="text-xs">♂️</span>
                        </div>
                        <span className="text-[11px] text-text-secondary font-serif">
                          Powerful wing strokes and poised flight silhouette.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender("female")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          gender === "female" 
                            ? "bg-[#221c17] border-[#c2410c] text-text-primary shadow-md" 
                            : "bg-[#0d0c0b] border-[#2b2722] text-text-secondary hover:border-[#3d372e]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-semibold text-sm text-text-primary">Female Falcon</span>
                          <span className="text-xs">♀️</span>
                        </div>
                        <span className="text-[11px] text-text-secondary font-serif">
                          Graceful, swift gliding across the starlit sky.
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender("")}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          !gender 
                            ? "bg-[#221c17] border-[#c2410c] text-text-primary shadow-md" 
                            : "bg-[#0d0c0b] border-[#2b2722] text-text-secondary hover:border-[#3d372e]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-serif font-semibold text-sm text-text-primary">Celestial Bird</span>
                          <span className="text-xs">🕊️</span>
                        </div>
                        <span className="text-[11px] text-text-secondary font-serif">
                          Timeless neutral carrier bird of quiet distance.
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Avatar URL Manual Override */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-secondary mb-2">
                      Custom Avatar URL (Optional)
                    </label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary" />
                      <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/my-portrait.jpg"
                        className="w-full bg-[#0d0c0b] border border-[#2b2722] rounded-2xl pl-12 pr-4 py-3 text-xs sm:text-sm font-mono text-text-primary focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c] transition-colors"
                      />
                    </div>
                  </div>

                </div>

                {/* Save Footer */}
                <div className="bg-[#100f0e] px-6 sm:px-8 py-4 flex items-center justify-between">
                  <p className="text-xs text-text-secondary font-serif">
                    Save your updates to refresh your station passport.
                  </p>
                  <button 
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {saving ? <BirdLoader className="w-4 h-4 text-white" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />)}
                    <span>{saved ? "Saved" : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: PRIVACY CONTROLS ================= */}
          {activeTab === "privacy" && (
            <motion.div 
              key="privacy"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between border-b border-[#24211d] pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                    Postal Privacy & Sanctuary Visas
                  </h2>
                  <p className="text-text-secondary text-xs sm:text-sm font-serif mt-1">
                    Control who can look up your station and what information is visible.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? <BirdLoader className="w-4 h-4 text-white" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />)}
                  <span>{saved ? "Saved" : "Save Changes"}</span>
                </button>
              </div>

              <div className="bg-[#131211] border border-[#2b2722] rounded-3xl shadow-xl overflow-hidden divide-y divide-[#24211d]">
                
                {/* Control 1: Public Discoverability */}
                <div className="p-6 sm:p-8 flex items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Compass className="w-4 h-4 text-[#c2410c]" />
                      <h4 className="text-base font-serif font-bold text-text-primary">
                        Public Station Registry
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary font-serif leading-relaxed max-w-xl">
                      Allows others to search for your postal email in the Partner Finder terminal and dispatch bond invitations. Disabling this makes your station completely invisible.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      checked={isPublic} 
                      onChange={(e) => setIsPublic(e.target.checked)} 
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-7 bg-[#201d1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c2410c] border border-[#332e27]"></div>
                  </label>
                </div>

                {/* Control 2: Show Email */}
                <div className="p-6 sm:p-8 flex items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-[#c2410c]" />
                      <h4 className="text-base font-serif font-bold text-text-primary">
                        Display Postal Address on Public Desk
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-text-secondary font-serif leading-relaxed max-w-xl">
                      Display your email address directly on your public desk page (`/user/{userId || 'id'}`). When toggled off, visitors only see your pen-name and bio.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input 
                      type="checkbox" 
                      checked={showEmail} 
                      disabled={!isPublic}
                      onChange={(e) => setShowEmail(e.target.checked)} 
                      className="sr-only peer disabled:opacity-50" 
                    />
                    <div className="w-12 h-7 bg-[#201d1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-primary after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c2410c] border border-[#332e27]"></div>
                  </label>
                </div>

                {/* Privacy Guarantee Creed */}
                <div className="p-6 sm:p-8 bg-[#100f0e]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                      The Sanctuary Creed
                    </h5>
                  </div>
                  <p className="text-xs text-text-secondary font-serif leading-relaxed">
                    Your written letters are strictly confidential between you and your designated recipient. PostHeart does not advertise, sell data, or allow third parties to inspect your delivered correspondence.
                  </p>
                </div>

                {/* Save Footer */}
                <div className="bg-[#100f0e] px-6 sm:px-8 py-4 flex items-center justify-between">
                  <p className="text-xs text-text-secondary font-serif">
                    Save changes to apply privacy settings.
                  </p>
                  <button 
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {saving ? <BirdLoader className="w-4 h-4 text-white" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />)}
                    <span>{saved ? "Saved" : "Save Changes"}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= TAB 4: PARTNER HUB (THE SANCTUARY) ================= */}
          {activeTab === "partner" && (
            <motion.div 
              key="partner"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="border-b border-[#24211d] pb-4">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                  The Sanctuary of Two
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm font-serif mt-1">
                  Manage your postal bond, shared spaces, and carrier routes.
                </p>
              </div>

              {partnerId && partner ? (
                /* Partnered State */
                <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  
                  {/* Top Atmosphere */}
                  <div className="flex items-center justify-between border-b border-[#24211d] pb-4 mb-8">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#c2410c] fill-current" />
                      <span className="font-mono text-xs text-[#c2410c] uppercase tracking-wider">
                        Active Postal Union
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary uppercase">
                      Carrier Route Linked
                    </span>
                  </div>

                  {/* Partner Portrait & Crest */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 text-center sm:text-left">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#1b1917] border-2 border-[#3d362e] p-1 overflow-hidden shrink-0 shadow-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={partner.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.name || partner.email}`} 
                        alt={partner.name || "Partner"} 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#c2410c] block">
                        Bonded Partner
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary mt-1">
                        {partner.name || "Anonymous Scribe"}
                      </h3>
                      <span className="text-xs font-typewriter text-text-secondary mt-1 block">
                        {partner.email}
                      </span>
                      {partner.bio && (
                        <p className="mt-3 text-xs sm:text-sm font-serif text-text-secondary italic line-clamp-3 pl-3 border-l-2 border-[#c2410c]/40">
                          &ldquo;{partner.bio}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Sanctuary Action Docks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#24211d]">
                    <Link
                      href="/write"
                      className="py-3 px-4 rounded-xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs font-serif font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:scale-105 active:scale-95"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Write to {partner.name || "Them"}</span>
                    </Link>

                    <Link
                      href="/world"
                      className="py-3 px-4 rounded-xl bg-[#1b1917] hover:bg-[#24221f] text-text-primary border border-[#2e2a25] text-xs font-serif font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#c2410c]" />
                      <span>Shared World</span>
                    </Link>

                    <Link
                      href="/connect"
                      className="py-3 px-4 rounded-xl bg-[#171614] hover:bg-[#221f1c] text-text-secondary hover:text-text-primary border border-[#2b2722] text-xs font-serif font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Manage Sanctuary</span>
                    </Link>
                  </div>

                </div>
              ) : (
                /* Solo Scribe State */
                <div className="bg-[#131211] border border-[#2b2722] rounded-3xl p-8 sm:p-12 shadow-2xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#1b1917] border border-[#332e27] flex items-center justify-center mb-5 text-[#c2410c]">
                    <Heart className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
                    No Partner Bonded Yet
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary font-serif max-w-md mx-auto mt-2 leading-relaxed">
                    PostHeart is crafted for slow, deliberate correspondence between two souls. Search for your partner or share your dispatch address to link your letterboxes.
                  </p>

                  <Link
                    href="/connect"
                    className="mt-6 px-6 py-3 rounded-2xl bg-[#c2410c] hover:bg-[#a3360a] text-white text-xs sm:text-sm font-serif font-semibold transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open Partner Finder & Dispatch Desk</span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  )
}
