"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, Save, Loader2, Image as ImageIcon, CheckCircle2, Calendar, Send, Inbox, Archive, Heart, Shield, LayoutDashboard, Settings, Lock } from "lucide-react"

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
      <Loader2 className="animate-spin text-[#c2410c] w-8 h-8" />
    </div>
  }

  const currentAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name || session?.user?.email}`

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: "personal", label: "Personal Details", icon: <User size={18} /> },
    { id: "privacy", label: "Privacy & Security", icon: <Lock size={18} /> },
    { id: "partner", label: "Partner Hub", icon: <Heart size={18} /> },
  ]

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col md:flex-row pb-24 relative">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 lg:w-72 border-r border-[#e6e4df] bg-[#f9f8f6] md:min-h-screen shrink-0 p-6">
        <div className="sticky top-6">
          <h2 className="text-sm font-bold text-[#a0a0a0] uppercase tracking-widest mb-6 px-4">Profile Settings</h2>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-[#fff5f0] text-[#c2410c]" 
                    : "text-[#707070] hover:bg-[#ebeae6] hover:text-[#1a1a1a]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-16 xl:p-24 overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-4xl space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Overview</h1>
                <p className="text-[#707070] mt-2">A high-level view of your PostHeart account and activity.</p>
              </div>

              {/* Profile Card */}
              <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#ffd5c2] to-[#fff5f0]"></div>
                
                <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 mt-12">
                  <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left mb-2">
                    <h2 className="text-3xl font-serif font-bold text-[#1a1a1a]">{name || "Anonymous User"}</h2>
                    <p className="text-[#707070] flex items-center justify-center sm:justify-start mt-2">
                      <Mail className="w-4 h-4 mr-2" /> {session?.user?.email}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center sm:items-end gap-3 mb-2">
                    {partnerId ? (
                      <span className="inline-flex items-center px-4 py-1.5 bg-[#fff5f0] text-[#c2410c] text-sm font-bold rounded-full border border-[#ffd5c2]">
                        <Heart className="w-4 h-4 mr-2" /> Partnered
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-1.5 bg-[#f5f5f5] text-[#707070] text-sm font-bold rounded-full border border-[#e0e0e0]">
                        Not Partnered
                      </span>
                    )}
                    {memberSince && (
                      <span className="text-sm text-[#a0a0a0] flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" /> Joined {memberSince}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#e6e4df] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-[#c2410c]" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">{stats.letters}</h3>
                  <p className="text-sm text-[#707070] uppercase tracking-wider mt-2">Sent Letters</p>
                </div>
                
                <div className="bg-white border border-[#e6e4df] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-4">
                    <Inbox className="w-6 h-6 text-[#c2410c]" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">{stats.received}</h3>
                  <p className="text-sm text-[#707070] uppercase tracking-wider mt-2">Received</p>
                </div>
                
                <div className="bg-white border border-[#e6e4df] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-4">
                    <Archive className="w-6 h-6 text-[#c2410c]" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">{stats.keepsakes}</h3>
                  <p className="text-sm text-[#707070] uppercase tracking-wider mt-2">Keepsakes</p>
                </div>

                <div className="bg-white border border-[#e6e4df] rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-[#c2410c]" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">{stats.milestones}</h3>
                  <p className="text-sm text-[#707070] uppercase tracking-wider mt-2">Milestones</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* PERSONAL DETAILS TAB */}
          {activeTab === "personal" && (
            <motion.div 
              key="personal"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-3xl space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Personal Details</h1>
                <p className="text-[#707070] mt-2">Update your identity and how others see you.</p>
              </div>

              <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 lg:p-10 shadow-sm space-y-8">
                <div>
                  <label className="block text-sm font-medium text-[#707070] mb-3 uppercase tracking-wider">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a]"
                  />
                  <p className="text-xs text-[#a0a0a0] mt-2">This is the name your partner and friends will see.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#707070] mb-3 uppercase tracking-wider">Profile Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-5 top-4 h-6 w-6 text-[#c2410c]" />
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl pl-14 pr-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a]"
                    />
                  </div>
                  <p className="text-xs text-[#a0a0a0] mt-2">Leave blank to use an auto-generated minimal avatar.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#707070] mb-3 uppercase tracking-wider">Public Biography</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your partner a little about yourself..."
                    rows={5}
                    className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl p-5 text-lg focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a] resize-none"
                  />
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
              className="max-w-3xl space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Privacy & Security</h1>
                <p className="text-[#707070] mt-2">Manage who can see your profile and contact information.</p>
              </div>

              <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 lg:p-10 shadow-sm space-y-10">
                <label className="flex items-start space-x-6 cursor-pointer group">
                  <div className="relative mt-1 shrink-0">
                    <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div>
                    <div className="font-bold text-[#1a1a1a] text-xl">Public Profile Visibility</div>
                    <div className="text-[#707070] mt-2 leading-relaxed">
                      Allow others to search for you by email and view your public profile page. Turning this off means no one can send you new connection requests.
                    </div>
                  </div>
                </label>

                <div className="border-t border-[#f9f8f6]"></div>

                <label className="flex items-start space-x-6 cursor-pointer group">
                  <div className="relative mt-1 shrink-0">
                    <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${showEmail ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'} ${!isPublic && 'opacity-50'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showEmail ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                  <div>
                    <div className={`font-bold text-xl ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#1a1a1a]'}`}>Show Email Publicly</div>
                    <div className={`mt-2 leading-relaxed ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#707070]'}`}>
                      Display your email address directly on your public profile page. If your profile is hidden, this setting is disabled.
                    </div>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* PARTNER HUB TAB */}
          {activeTab === "partner" && (
            <motion.div 
              key="partner"
              variants={tabContentVariants}
              initial="hidden" animate="visible" exit="exit"
              className="max-w-3xl space-y-12"
            >
              <div>
                <h1 className="text-4xl font-serif font-bold text-[#1a1a1a]">Partner Hub</h1>
                <p className="text-[#707070] mt-2">Manage your connection and shared spaces.</p>
              </div>

              <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 lg:p-10 shadow-sm text-center py-16">
                <div className="w-24 h-24 bg-[#fff5f0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-[#c2410c]" />
                </div>
                
                {partnerId ? (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">You are Partnered!</h2>
                    <p className="text-[#707070] max-w-md mx-auto mb-8">
                      You and your partner are officially connected on PostHeart. You can write letters, build your timeline, and manage your keepsake box together.
                    </p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => router.push("/board")} className="px-6 py-3 bg-[#c2410c] text-white rounded-xl font-medium hover:bg-[#a3360a] transition-colors">
                        Go to Couple Board
                      </button>
                      <button onClick={() => router.push("/connect")} className="px-6 py-3 bg-white text-[#1a1a1a] border border-[#e6e4df] rounded-xl font-medium hover:bg-[#f9f8f6] transition-colors">
                        Manage Connection
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-4">Not Partnered Yet</h2>
                    <p className="text-[#707070] max-w-md mx-auto mb-8">
                      You are currently flying solo. Send a connection request to your significant other to unlock the Couple Board and Timeline!
                    </p>
                    <button onClick={() => router.push("/connect")} className="px-8 py-3 bg-[#c2410c] text-white rounded-xl font-medium hover:bg-[#a3360a] transition-colors">
                      Find Partner
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Save Button */}
      {(activeTab === "personal" || activeTab === "privacy") && (
        <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="pointer-events-auto"
          >
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center px-10 py-4 rounded-full shadow-lg font-medium transition-all ${
                saved 
                  ? "bg-[#2e7d32] text-white shadow-green-900/20" 
                  : "bg-[#1a1a1a] text-white hover:bg-black hover:-translate-y-1 hover:shadow-2xl"
              } disabled:opacity-50 disabled:hover:translate-y-0`}
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : (saved ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Save className="w-5 h-5 mr-3" />)}
              {saved ? "Changes Saved Successfully" : "Save Settings"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
