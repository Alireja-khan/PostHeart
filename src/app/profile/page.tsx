"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Loader2, Image as ImageIcon, CheckCircle2, Calendar, Send, Inbox, Archive, Heart, User, Shield, LayoutDashboard, Camera } from "lucide-react"

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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  
  const [activeTab, setActiveTab] = useState("overview")
  
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [bio, setBio] = useState("")
  const [gender, setGender] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  
  const [memberSince, setMemberSince] = useState("")
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ letters: 0, received: 0, milestones: 0, keepsakes: 0 })

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
        isPublic,
        showEmail
      }

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: customAvatarUrl !== undefined ? customAvatarUrl : avatarUrl, coverUrl: customCoverUrl !== undefined ? customCoverUrl : coverUrl, bio, gender, isPublic, showEmail })
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'avatar') setUploadingAvatar(true)
    if (type === 'cover') setUploadingCover(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      
      if (res.ok) {
        const data = await res.json()
        if (type === 'avatar') {
          setAvatarUrl(data.url)
          await handleSave(undefined, data.url)
        } else {
          setCoverUrl(data.url)
          await handleSave(data.url, undefined)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      if (type === 'avatar') setUploadingAvatar(false)
      if (type === 'cover') setUploadingCover(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center bg-[#111111]">
      <Loader2 className="animate-spin text-[#f9f8f6] w-8 h-8" />
    </div>
  }

  const currentAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name || session?.user?.email}`
  const currentCover = coverUrl || "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop"

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
    <div className="min-h-screen bg-[#111111] relative">
      
      {/* Hidden File Inputs */}
      <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, 'avatar')} className="hidden" accept="image/*" />
      <input type="file" ref={coverInputRef} onChange={(e) => handleFileUpload(e, 'cover')} className="hidden" accept="image/*" />

      {/* Global Header with Cover Photo */}
      <div className="relative h-[400px] md:h-[450px] lg:h-[500px] w-full overflow-hidden group border-b border-[#333333]">
        {/* Cover Image */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentCover} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent"></div>
        </div>
        

        
        {/* Header Content & Navigation */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div className="flex items-end gap-6 relative z-10">
                <div className="relative group/avatar">
                  <div className="h-24 w-24 bg-[#1a1a1a] rounded-full flex items-center justify-center border-4 border-[#111111] overflow-hidden shrink-0 shadow-xl relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                    
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-[#111111] text-white p-2 rounded-full border-2 border-white shadow-lg hover:bg-black transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">{name || "Anonymous User"}</h1>
                  <p className="text-white/70 text-sm mt-1">{session?.user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 mb-2">
                {partnerId ? (
                  <span className="inline-flex items-center px-4 py-1.5 bg-[#1a1a1a]/10 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                    <Heart className="w-3 h-3 mr-1.5 text-red-400" /> Partnered
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-1.5 bg-[#1a1a1a]/10 backdrop-blur-md text-white/80 text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                    Solo Account
                  </span>
                )}
                {memberSince && (
                  <span className="inline-flex items-center px-4 py-1.5 bg-[#1a1a1a]/10 backdrop-blur-md text-white/80 text-xs font-semibold rounded-full border border-white/20 shadow-sm">
                    <Calendar className="w-3 h-3 mr-1.5" /> {memberSince}
                  </span>
                )}
              </div>
            </div>

            {/* Tab Navigation Over Image */}
            <div className="flex items-center justify-between">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.id 
                        ? "text-[#f9f8f6]" 
                        : "text-white/60 hover:text-[#f9f8f6]"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f9f8f6]"
                      />
                    )}
                  </button>
                ))}
              </nav>
              
              {/* Cover Upload Button */}
              <button 
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors border border-white/20 shadow-lg mb-4"
              >
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                <span className="hidden sm:inline">Change Cover</span>
              </button>
            </div>
          </div>
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
              <h2 className="text-xl font-semibold text-[#f9f8f6]">Activity Ledger</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-[#f9f8f6]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#f9f8f6]">{stats.letters}</h3>
                  <p className="text-sm text-[#a0a0a0] mt-2 font-medium">Total Sent Letters</p>
                </div>
                
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-[#f9f8f6]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#f9f8f6]">{stats.received}</h3>
                  <p className="text-sm text-[#a0a0a0] mt-2 font-medium">Total Received</p>
                </div>
                
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-[#f9f8f6]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#f9f8f6]">{stats.keepsakes}</h3>
                  <p className="text-sm text-[#a0a0a0] mt-2 font-medium">Items in Keepsake Box</p>
                </div>

                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-6 h-6 text-[#f9f8f6]" />
                  </div>
                  <h3 className="text-4xl font-semibold text-[#f9f8f6]">{stats.milestones}</h3>
                  <p className="text-sm text-[#a0a0a0] mt-2 font-medium">Milestones Recorded</p>
                </div>
              </div>

              {bio && (
                <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8 shadow-sm max-w-3xl mt-8">
                  <h2 className="text-xs font-bold text-[#a0a0a0] uppercase tracking-widest mb-4">Biography</h2>
                  <p className="text-lg text-[#f9f8f6] leading-relaxed">
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
                <h2 className="text-xl font-semibold text-[#f9f8f6]">Personal Information</h2>
                <p className="text-[#a0a0a0] text-sm mt-1">Update your personal details and how others see you on the platform.</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#f9f8f6] mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#111111] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#f9f8f6]"
                    />
                    <p className="text-xs text-[#a0a0a0] mt-2">This is the name your partner and friends will see.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f9f8f6] mb-2">Avatar URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-3 h-4 w-4 text-[#a0a0a0]" />
                      <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-[#111111] border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#f9f8f6]"
                      />
                    </div>
                    <p className="text-xs text-[#a0a0a0] mt-2">Leave blank to use an auto-generated minimal avatar.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f9f8f6] mb-2">Biography</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your partner a little about yourself..."
                      rows={4}
                      className="w-full bg-[#111111] border-none rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#f9f8f6] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f9f8f6] mb-2">Gender</label>
                    <select 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#111111] border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111111] transition-all text-[#f9f8f6] cursor-pointer"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <p className="text-xs text-[#a0a0a0] mt-2">Used for the letter tracking bird animation silhouettes.</p>
                  </div>
                </div>
                
                <div className="bg-[#222222] border-t border-[#333333] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#a0a0a0]">Please save your changes to apply them.</p>
                  <button 
                    onClick={() => handleSave()}
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
                <h2 className="text-xl font-semibold text-[#f9f8f6]">Privacy Controls</h2>
                <p className="text-[#a0a0a0] text-sm mt-1">Manage who can see your profile and contact information.</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className="font-medium text-[#f9f8f6] text-sm">Public Profile Visibility</div>
                      <div className="text-[#a0a0a0] text-sm mt-1 leading-relaxed">
                        Allow others to search for you by email and view your public profile. Turning this off means no one can send you connection requests.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-[#111111]' : 'bg-[#e0e0e0]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-[#1a1a1a] w-5 h-5 rounded-full transition-transform ${isPublic ? 'transform translate-x-5' : ''} shadow-sm`}></div>
                    </div>
                  </label>

                  <div className="border-t border-[#333333]"></div>

                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className={`font-medium text-sm ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#f9f8f6]'}`}>Show Email Publicly</div>
                      <div className={`text-sm mt-1 leading-relaxed ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#a0a0a0]'}`}>
                        Display your email address directly on your public profile page. If your profile is hidden, this setting is disabled.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                      <div className={`block w-12 h-7 rounded-full transition-colors ${showEmail ? 'bg-[#111111]' : 'bg-[#e0e0e0]'} ${!isPublic && 'opacity-50'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-[#1a1a1a] w-5 h-5 rounded-full transition-transform ${showEmail ? 'transform translate-x-5' : ''} shadow-sm`}></div>
                    </div>
                  </label>
                </div>

                <div className="bg-[#222222] border-t border-[#333333] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#a0a0a0]">Please save your changes to apply them.</p>
                  <button 
                    onClick={() => handleSave()}
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
                <h2 className="text-xl font-semibold text-[#f9f8f6]">Partner Hub</h2>
                <p className="text-[#a0a0a0] text-sm mt-1">Manage your connection and shared spaces.</p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#333333] rounded-2xl p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#111111] rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-[#f9f8f6]" />
                </div>
                
                {partnerId ? (
                  <>
                    <h2 className="text-xl font-semibold text-[#f9f8f6] mb-3">You are connected!</h2>
                    <p className="text-[#a0a0a0] text-sm max-w-md mx-auto mb-8 leading-relaxed">
                      You and your partner are officially connected on PostHeart. You can write letters, build your timeline, and manage your keepsake box together.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => router.push("/board")} className="px-6 py-3 bg-[#111111] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10">
                        Go to Couple Board
                      </button>
                      <button onClick={() => router.push("/connect")} className="px-6 py-3 bg-[#1a1a1a] text-[#f9f8f6] border border-[#333333] rounded-xl text-sm font-medium hover:bg-[#222222] transition-colors shadow-sm">
                        Manage Connection
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-[#f9f8f6] mb-3">Not Partnered Yet</h2>
                    <p className="text-[#a0a0a0] text-sm max-w-md mx-auto mb-8 leading-relaxed">
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
