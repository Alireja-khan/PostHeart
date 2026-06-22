"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Loader2, Image as ImageIcon, CheckCircle2, Calendar, Send, Inbox, Archive, Heart, User, Shield, LayoutDashboard } from "lucide-react"

type ProfileStats = {
  letters: number;
  received: number;
  milestones: number;
  keepsakes: number;
}

type InTransitLetter = {
  id: string;
  createdAt: string;
  deliverAt: string;
}

export default function Profile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [activeTab, setActiveTab] = useState("overview")
  
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  
  const [memberSince, setMemberSince] = useState("")
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ letters: 0, received: 0, milestones: 0, keepsakes: 0 })
  const [inTransitLetter, setInTransitLetter] = useState<InTransitLetter | null>(null)
  
  // Real-time tracker progress
  const [progressPercent, setProgressPercent] = useState(0)

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
          setName(data.name || session?.user?.name || "")
          setAvatarUrl(data.avatarUrl || "")
          setBio(data.bio || "")
          setIsPublic(data.isPublic ?? true)
          setShowEmail(data.showEmail ?? false)
          
          if (data.createdAt) {
            setMemberSince(new Date(data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }))
          }
          setPartnerId(data.partnerId || null)
          if (data._count) {
            setStats(data._count)
          }
          if (data.received && data.received.length > 0) {
            setInTransitLetter(data.received[0])
          }
          
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [status, session])

  useEffect(() => {
    // Bird Tracker logic
    if (inTransitLetter && inTransitLetter.deliverAt) {
      const updateProgress = () => {
        const start = new Date(inTransitLetter.createdAt).getTime()
        const end = new Date(inTransitLetter.deliverAt).getTime()
        const now = Date.now()
        
        if (now >= end) {
          setProgressPercent(100)
        } else if (now <= start) {
          setProgressPercent(0)
        } else {
          const total = end - start
          const current = now - start
          setProgressPercent((current / total) * 100)
        }
      }
      
      updateProgress()
      const interval = setInterval(updateProgress, 1000) // Update every second
      return () => clearInterval(interval)
    }
  }, [inTransitLetter])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl, bio, isPublic, showEmail })
      })
      if (res.ok) {
        setSaved(true)
        if (name !== session?.user?.name) {
          await update({ name })
        }
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center bg-[#f4f5f7]">
      <Loader2 className="animate-spin text-[#1a1a1a] w-8 h-8" />
    </div>
  }

  const currentAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name || session?.user?.email}`

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "settings", label: "Settings" },
    { id: "privacy", label: "Privacy" },
    { id: "partner", label: "Partner Hub" },
  ]

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] relative">
      
      {/* IN-TRANSIT BIRD TRACKER */}
      {inTransitLetter && (
        <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none overflow-hidden">
          {/* Tracking Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/10 border-dashed border-b border-[#c2410c]/30"></div>
          
          {/* The Bird */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8"
            initial={{ left: `${progressPercent}%` }}
            animate={{ left: `${progressPercent}%` }}
            transition={{ ease: "linear", duration: 1 }}
          >
            {/* SVG Bird Abstract */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#111111]">
              <path d="M2.3 12C2.3 12 7.1 8.5 12 8.5C16.9 8.5 21.7 12 21.7 12C21.7 12 18.2 16.2 12 16.2C5.8 16.2 2.3 12 2.3 12Z" fill="currentColor"/>
              <path d="M12 8.5C12 8.5 10 3 12 3C14 3 12 8.5 12 8.5Z" fill="currentColor">
                {/* Flapping Animation */}
                <animate attributeName="d" 
                  values="M12 8.5C12 8.5 10 3 12 3C14 3 12 8.5 12 8.5Z; M12 8.5C12 8.5 6 12 12 12C18 12 12 8.5 12 8.5Z; M12 8.5C12 8.5 10 3 12 3C14 3 12 8.5 12 8.5Z" 
                  dur="0.6s" repeatCount="indefinite" 
                />
              </path>
            </svg>
          </motion.div>
        </div>
      )}

      {/* Global Header with Cover Photo */}
      <div className="bg-white border-b border-[#eaeaea]">
        <div className="relative h-64 lg:h-72 w-full overflow-hidden">
          {/* Cover Image Placeholder (Can be dynamic later, using a beautiful default for now) */}
          <div className="absolute inset-0 bg-[#111111] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop" alt="Cover" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent opacity-80"></div>
          </div>
          
          {/* Header Content */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-end gap-6 relative z-10">
                  <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center border-4 border-[#111111] overflow-hidden shrink-0 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="mb-2">
                    <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{name || "Anonymous User"}</h1>
                    <p className="text-white/70 text-sm mt-1">{session?.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 relative z-10 mb-2">
                  {partnerId ? (
                    <span className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                      <Heart className="w-3 h-3 mr-1.5 text-red-400" /> Partnered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                      Solo Account
                    </span>
                  )}
                  {memberSince && (
                    <span className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md text-white/80 text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                      <Calendar className="w-3 h-3 mr-1.5" /> {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex space-x-8 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id 
                    ? "text-[#111111]" 
                    : "text-[#888888] hover:text-[#111111]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="space-y-8"
            >
              <h2 className="text-xl font-semibold text-[#111111]">Activity Ledger</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#111111]">{stats.letters}</h3>
                  <p className="text-sm text-[#888888] mt-2 font-medium">Total Sent Letters</p>
                </div>
                
                <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#111111]">{stats.received}</h3>
                  <p className="text-sm text-[#888888] mt-2 font-medium">Total Received</p>
                </div>
                
                <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#111111]">{stats.keepsakes}</h3>
                  <p className="text-sm text-[#888888] mt-2 font-medium">Items in Keepsake Box</p>
                </div>

                <div className="bg-white border border-[#eaeaea] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-6 h-6 text-[#111111]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#111111]">{stats.milestones}</h3>
                  <p className="text-sm text-[#888888] mt-2 font-medium">Milestones Recorded</p>
                </div>
              </div>

              {bio && (
                <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 shadow-sm max-w-3xl mt-8">
                  <h2 className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4">Biography</h2>
                  <p className="text-lg text-[#111111] leading-relaxed">
                    {bio}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <motion.div 
              key="settings"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-3xl space-y-8"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#111111]">Personal Information</h2>
                <p className="text-[#888888] text-sm mt-1">Update your personal details and how others see you on the platform.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#f4f5f7] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#111111]"
                    />
                    <p className="text-xs text-[#888888] mt-2">This is the name your partner and friends will see.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Avatar URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-3 h-4 w-4 text-[#888888]" />
                      <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-[#f4f5f7] border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#111111]"
                      />
                    </div>
                    <p className="text-xs text-[#888888] mt-2">Leave blank to use an auto-generated minimal avatar.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Biography</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your partner a little about yourself..."
                      rows={4}
                      className="w-full bg-[#f4f5f7] border-none rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#111111] resize-none"
                    />
                  </div>
                </div>
                
                <div className="bg-[#fafafa] border-t border-[#eaeaea] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#888888]">Please save your changes to apply them.</p>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      saved 
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/20" 
                        : "bg-[#111111] text-white hover:bg-black shadow-lg shadow-black/10"
                    } disabled:opacity-50`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />)}
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === "privacy" && (
            <motion.div 
              key="privacy"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-3xl space-y-8"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#111111]">Privacy Controls</h2>
                <p className="text-[#888888] text-sm mt-1">Manage who can see your profile and contact information.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className="font-medium text-[#111111] text-sm">Public Profile Visibility</div>
                      <div className="text-[#888888] text-sm mt-1 leading-relaxed">
                        Allow others to search for you by email and view your public profile. Turning this off means no one can send you connection requests.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-[#111111]' : 'bg-[#e0e0e0]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${isPublic ? 'transform translate-x-5' : ''} shadow-sm`}></div>
                    </div>
                  </label>

                  <div className="border-t border-[#eaeaea]"></div>

                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className={`font-medium text-sm ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#111111]'}`}>Show Email Publicly</div>
                      <div className={`text-sm mt-1 leading-relaxed ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#888888]'}`}>
                        Display your email address directly on your public profile page. If your profile is hidden, this setting is disabled.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${showEmail ? 'bg-[#111111]' : 'bg-[#e0e0e0]'} ${!isPublic && 'opacity-50'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${showEmail ? 'transform translate-x-5' : ''} shadow-sm`}></div>
                    </div>
                  </label>
                </div>

                <div className="bg-[#fafafa] border-t border-[#eaeaea] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#888888]">Please save your changes to apply them.</p>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      saved 
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/20" 
                        : "bg-[#111111] text-white hover:bg-black shadow-lg shadow-black/10"
                    } disabled:opacity-50`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />)}
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PARTNER HUB TAB */}
          {activeTab === "partner" && (
            <motion.div 
              key="partner"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-3xl space-y-8"
            >
              <div>
                <h2 className="text-xl font-semibold text-[#111111]">Partner Hub</h2>
                <p className="text-[#888888] text-sm mt-1">Manage your connection and shared spaces.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-2xl p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-[#111111]" />
                </div>
                
                {partnerId ? (
                  <>
                    <h2 className="text-xl font-semibold text-[#111111] mb-3">You are connected!</h2>
                    <p className="text-[#888888] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                      You and your partner are officially connected on PostHeart. You can write letters, build your timeline, and manage your keepsake box together.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => router.push("/board")} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10">
                        Go to Couple Board
                      </button>
                      <button onClick={() => router.push("/connect")} className="px-6 py-3 bg-white text-[#111111] border border-[#eaeaea] rounded-xl text-sm font-medium hover:bg-[#fafafa] transition-colors shadow-sm">
                        Manage Connection
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-[#111111] mb-3">Not Partnered Yet</h2>
                    <p className="text-[#888888] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                      You are currently flying solo. Send a connection request to your significant other to unlock the Couple Board and Timeline!
                    </p>
                    <button onClick={() => router.push("/connect")} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10">
                      Find Partner
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
