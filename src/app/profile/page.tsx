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
          
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [status, session])

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
    return <div className="min-h-screen p-8 flex items-center justify-center bg-[#f9f8f6]">
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
    <div className="min-h-screen bg-[#fafafa]">
      
      {/* Global Header */}
      <div className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center border border-[#eaeaea] overflow-hidden shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-[#111]">{name || "Anonymous User"}</h1>
                <p className="text-[#666] text-sm mt-1">{session?.user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {partnerId ? (
                <span className="inline-flex items-center px-3 py-1 bg-[#fff0f0] text-[#e00] text-xs font-semibold rounded-full border border-[#ffe0e0]">
                  <Heart className="w-3 h-3 mr-1.5" /> Partnered
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 bg-[#f5f5f5] text-[#666] text-xs font-semibold rounded-full border border-[#eaeaea]">
                  Solo Account
                </span>
              )}
              {memberSince && (
                <span className="inline-flex items-center px-3 py-1 bg-[#f5f5f5] text-[#666] text-xs font-semibold rounded-full border border-[#eaeaea]">
                  <Calendar className="w-3 h-3 mr-1.5" /> {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id 
                    ? "text-[#111]" 
                    : "text-[#666] hover:text-[#111]"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111]"
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
              <h2 className="text-xl font-semibold text-[#111]">Activity Ledger</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#eaeaea] rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-[#fafafa] border border-[#eaeaea] rounded-full flex items-center justify-center mb-4">
                    <Send className="w-5 h-5 text-[#111]" />
                  </div>
                  <h3 className="text-3xl font-semibold text-[#111]">{stats.letters}</h3>
                  <p className="text-sm text-[#666] mt-1">Total Sent Letters</p>
                </div>
                
                <div className="bg-white border border-[#eaeaea] rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-[#fafafa] border border-[#eaeaea] rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-5 h-5 text-[#111]" />
                  </div>
                  <h3 className="text-3xl font-semibold text-[#111]">{stats.received}</h3>
                  <p className="text-sm text-[#666] mt-1">Total Received</p>
                </div>
                
                <div className="bg-white border border-[#eaeaea] rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-[#fafafa] border border-[#eaeaea] rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-5 h-5 text-[#111]" />
                  </div>
                  <h3 className="text-3xl font-semibold text-[#111]">{stats.keepsakes}</h3>
                  <p className="text-sm text-[#666] mt-1">Items in Keepsake Box</p>
                </div>

                <div className="bg-white border border-[#eaeaea] rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="w-10 h-10 bg-[#fafafa] border border-[#eaeaea] rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-5 h-5 text-[#111]" />
                  </div>
                  <h3 className="text-3xl font-semibold text-[#111]">{stats.milestones}</h3>
                  <p className="text-sm text-[#666] mt-1">Milestones Recorded</p>
                </div>
              </div>

              {bio && (
                <div className="bg-white border border-[#eaeaea] rounded-xl p-8 shadow-sm max-w-3xl">
                  <h2 className="text-sm font-semibold text-[#666] uppercase tracking-wider mb-4">Biography</h2>
                  <p className="text-lg text-[#111] leading-relaxed">
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
                <h2 className="text-xl font-semibold text-[#111]">Personal Information</h2>
                <p className="text-[#666] text-sm mt-1">Update your personal details and how others see you on the platform.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#111] mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-[#fafafa] border border-[#eaeaea] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-[#111] transition-all text-[#111]"
                    />
                    <p className="text-xs text-[#666] mt-2">This is the name your partner and friends will see.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111] mb-2">Avatar URL</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-[#666]" />
                      <input 
                        type="text" 
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-[#fafafa] border border-[#eaeaea] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-[#111] transition-all text-[#111]"
                      />
                    </div>
                    <p className="text-xs text-[#666] mt-2">Leave blank to use an auto-generated minimal avatar.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111] mb-2">Biography</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your partner a little about yourself..."
                      rows={4}
                      className="w-full bg-[#fafafa] border border-[#eaeaea] rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#111] focus:border-[#111] transition-all text-[#111] resize-none"
                    />
                  </div>
                </div>
                
                <div className="bg-[#fafafa] border-t border-[#eaeaea] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#666]">Please save your changes to apply them.</p>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      saved 
                        ? "bg-green-600 text-white" 
                        : "bg-[#111] text-white hover:bg-[#333]"
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
                <h2 className="text-xl font-semibold text-[#111]">Privacy Controls</h2>
                <p className="text-[#666] text-sm mt-1">Manage who can see your profile and contact information.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className="font-medium text-[#111] text-sm">Public Profile Visibility</div>
                      <div className="text-[#666] text-sm mt-1 leading-relaxed">
                        Allow others to search for you by email and view your public profile. Turning this off means no one can send you connection requests.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#111]' : 'bg-[#eaeaea]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>

                  <div className="border-t border-[#eaeaea]"></div>

                  <label className="flex items-start justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className={`font-medium text-sm ${!isPublic ? 'text-[#999]' : 'text-[#111]'}`}>Show Email Publicly</div>
                      <div className={`text-sm mt-1 leading-relaxed ${!isPublic ? 'text-[#999]' : 'text-[#666]'}`}>
                        Display your email address directly on your public profile page. If your profile is hidden, this setting is disabled.
                      </div>
                    </div>
                    <div className="relative mt-1 shrink-0">
                      <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${showEmail ? 'bg-[#111]' : 'bg-[#eaeaea]'} ${!isPublic && 'opacity-50'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showEmail ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>

                <div className="bg-[#fafafa] border-t border-[#eaeaea] px-6 py-4 flex items-center justify-between">
                  <p className="text-xs text-[#666]">Please save your changes to apply them.</p>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      saved 
                        ? "bg-green-600 text-white" 
                        : "bg-[#111] text-white hover:bg-[#333]"
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
                <h2 className="text-xl font-semibold text-[#111]">Partner Hub</h2>
                <p className="text-[#666] text-sm mt-1">Manage your connection and shared spaces.</p>
              </div>

              <div className="bg-white border border-[#eaeaea] rounded-xl p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#fafafa] border border-[#eaeaea] rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-[#111]" />
                </div>
                
                {partnerId ? (
                  <>
                    <h2 className="text-lg font-semibold text-[#111] mb-2">You are connected!</h2>
                    <p className="text-[#666] text-sm max-w-md mx-auto mb-8">
                      You and your partner are officially connected on PostHeart. You can write letters, build your timeline, and manage your keepsake box together.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => router.push("/board")} className="px-5 py-2.5 bg-[#111] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors">
                        Go to Couple Board
                      </button>
                      <button onClick={() => router.push("/connect")} className="px-5 py-2.5 bg-white text-[#111] border border-[#eaeaea] rounded-lg text-sm font-medium hover:bg-[#fafafa] transition-colors">
                        Manage Connection
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg font-semibold text-[#111] mb-2">Not Partnered Yet</h2>
                    <p className="text-[#666] text-sm max-w-md mx-auto mb-8">
                      You are currently flying solo. Send a connection request to your significant other to unlock the Couple Board and Timeline!
                    </p>
                    <button onClick={() => router.push("/connect")} className="px-5 py-2.5 bg-[#111] text-white rounded-lg text-sm font-medium hover:bg-[#333] transition-colors">
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
