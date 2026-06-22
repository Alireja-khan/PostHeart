"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Save, Loader2, Image as ImageIcon, CheckCircle2, Calendar, Send, Inbox, Archive, Heart, User, Quote } from "lucide-react"

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

  return (
    <div className="min-h-screen bg-[#f9f8f6] py-16 px-8 md:px-16 xl:px-32">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-16 xl:gap-32">
          
          {/* LEFT COLUMN: IDENTITY (Pinned to left side) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full lg:w-[45%] max-w-xl shrink-0"
          >
            <div className="sticky top-16 space-y-12">
              
              {/* Header Profile Identity */}
              <div>
                <div className="h-48 w-48 mb-8 relative">
                  <div className="absolute inset-0 bg-[#e6e4df] rounded-full translate-x-3 translate-y-3"></div>
                  <div className="relative h-48 w-48 bg-white rounded-full border border-[#e6e4df] overflow-hidden flex items-center justify-center shadow-sm z-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                </div>

                <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#1a1a1a] leading-tight mb-2">
                  {name || "Anonymous"}
                </h1>
                
                <div className="flex flex-col gap-2 mt-4 text-[#707070] font-serif text-lg">
                  <span className="flex items-center"><Mail className="w-5 h-5 mr-3 text-[#c2410c]" /> {session?.user?.email}</span>
                  {memberSince && (
                    <span className="flex items-center"><Calendar className="w-5 h-5 mr-3 text-[#c2410c]" /> Joined {memberSince}</span>
                  )}
                  {partnerId && (
                    <span className="flex items-center"><Heart className="w-5 h-5 mr-3 text-[#c2410c]" /> Partnered</span>
                  )}
                </div>
              </div>

              {/* Bio Quote Style */}
              {bio && (
                <div className="relative">
                  <Quote className="absolute -left-6 -top-4 w-10 h-10 text-[#e6e4df] opacity-50 transform -scale-x-100" />
                  <p className="text-xl font-serif italic text-[#4a4a4a] leading-relaxed relative z-10 pl-2">
                    {bio}
                  </p>
                </div>
              )}

              {/* Minimal Stats */}
              <div className="pt-8 border-t border-[#e6e4df]">
                <h3 className="text-sm font-bold text-[#a0a0a0] uppercase tracking-widest mb-6">Activity Ledger</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <div className="flex items-center mb-1">
                      <Send className="w-4 h-4 text-[#c2410c] mr-2" />
                      <span className="text-xs text-[#707070] uppercase tracking-wider">Sent</span>
                    </div>
                    <span className="text-3xl font-serif text-[#1a1a1a]">{stats.letters}</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Inbox className="w-4 h-4 text-[#c2410c] mr-2" />
                      <span className="text-xs text-[#707070] uppercase tracking-wider">Received</span>
                    </div>
                    <span className="text-3xl font-serif text-[#1a1a1a]">{stats.received}</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Archive className="w-4 h-4 text-[#c2410c] mr-2" />
                      <span className="text-xs text-[#707070] uppercase tracking-wider">Keepsakes</span>
                    </div>
                    <span className="text-3xl font-serif text-[#1a1a1a]">{stats.keepsakes}</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <Heart className="w-4 h-4 text-[#c2410c] mr-2" />
                      <span className="text-xs text-[#707070] uppercase tracking-wider">Milestones</span>
                    </div>
                    <span className="text-3xl font-serif text-[#1a1a1a]">{stats.milestones}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* SPACE IN THE MIDDLE (Auto-created by justify-between and max-widths) */}

          {/* RIGHT COLUMN: SETTINGS (Pinned to right side) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="w-full lg:w-[45%] max-w-2xl"
          >
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0eee9]">
              
              <div className="mb-10">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">Profile Settings</h2>
                <p className="text-[#707070] mt-2">Adjust your presentation and privacy preferences.</p>
              </div>

              <div className="space-y-10">
                {/* Inputs Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[#a0a0a0] mb-2 uppercase tracking-widest">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full bg-transparent border-b-2 border-[#e6e4df] py-3 text-xl font-serif focus:outline-none focus:border-[#c2410c] transition-colors text-[#1a1a1a] placeholder:text-[#d0d0d0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0a0] mb-2 uppercase tracking-widest">Avatar Image URL</label>
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full bg-transparent border-b-2 border-[#e6e4df] py-3 text-lg focus:outline-none focus:border-[#c2410c] transition-colors text-[#1a1a1a] placeholder:text-[#d0d0d0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#a0a0a0] mb-3 uppercase tracking-widest">Biography</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share a little about yourself..."
                      rows={4}
                      className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-2xl p-5 text-lg font-serif focus:outline-none focus:ring-1 focus:ring-[#c2410c] focus:border-[#c2410c] transition-all text-[#1a1a1a] resize-none"
                    />
                  </div>
                </div>

                {/* Privacy Section */}
                <div className="pt-8 border-t border-[#f0eee9] space-y-8">
                  <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">Privacy Controls</h3>
                  
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className="font-medium text-[#1a1a1a] text-lg">Public Visibility</div>
                      <div className="text-sm text-[#707070] mt-1 leading-relaxed">
                        Allow others to search for you by email. Turn off to remain completely hidden.
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${isPublic ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isPublic ? 'transform translate-x-6' : ''} shadow-sm`}></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="pr-8">
                      <div className={`font-medium text-lg ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#1a1a1a]'}`}>Display Email</div>
                      <div className={`text-sm mt-1 leading-relaxed ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#707070]'}`}>
                        Show your email address on your public profile. Disabled if profile is hidden.
                      </div>
                    </div>
                    <div className="relative shrink-0">
                      <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${showEmail ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'} ${!isPublic && 'opacity-50'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showEmail ? 'transform translate-x-6' : ''} shadow-sm`}></div>
                    </div>
                  </label>
                </div>

                {/* Save Button */}
                <div className="pt-8">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full flex items-center justify-center px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
                      saved 
                        ? "bg-[#2e7d32] text-white shadow-lg shadow-green-900/10" 
                        : "bg-[#1a1a1a] text-white hover:bg-black hover:-translate-y-1 shadow-xl shadow-black/10"
                    } disabled:opacity-50 disabled:hover:translate-y-0`}
                  >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : (saved ? <CheckCircle2 className="w-6 h-6 mr-3" /> : <Save className="w-6 h-6 mr-3" />)}
                    {saved ? "Saved Successfully" : "Update Profile"}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
