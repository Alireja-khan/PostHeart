"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Save, Loader2, Image as ImageIcon, CheckCircle2, Calendar, Send, Inbox, Archive, Heart, Shield } from "lucide-react"

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
        // Optionally update next-auth session if name changed
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
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-[#f9f8f6] pb-24 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header Profile Card */}
        <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#ffd5c2] to-[#fff5f0]"></div>
          
          <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 mt-12">
            <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 text-center md:text-left mb-2">
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">{name || "Anonymous User"}</h1>
              <p className="text-[#707070] flex items-center justify-center md:justify-start mt-1">
                <Mail className="w-4 h-4 mr-2" /> {session?.user?.email}
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2 mb-2">
              {partnerId && (
                <span className="inline-flex items-center px-3 py-1 bg-[#fff5f0] text-[#c2410c] text-xs font-bold rounded-full border border-[#ffd5c2]">
                  <Heart className="w-3 h-3 mr-1" /> Partnered
                </span>
              )}
              {memberSince && (
                <span className="text-xs text-[#a0a0a0] flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e6e4df] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-[#c2410c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{stats.letters}</h3>
            <p className="text-xs text-[#707070] uppercase tracking-wider mt-1">Sent Letters</p>
          </div>
          
          <div className="bg-white border border-[#e6e4df] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-3">
              <Inbox className="w-5 h-5 text-[#c2410c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{stats.received}</h3>
            <p className="text-xs text-[#707070] uppercase tracking-wider mt-1">Received</p>
          </div>
          
          <div className="bg-white border border-[#e6e4df] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-3">
              <Archive className="w-5 h-5 text-[#c2410c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{stats.keepsakes}</h3>
            <p className="text-xs text-[#707070] uppercase tracking-wider mt-1">Keepsakes</p>
          </div>

          <div className="bg-white border border-[#e6e4df] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-[#f9f8f6] rounded-full flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-[#c2410c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1a1a1a]">{stats.milestones}</h3>
            <p className="text-xs text-[#707070] uppercase tracking-wider mt-1">Milestones</p>
          </div>
        </div>

        {/* Settings Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#c2410c]" /> Personal Information
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#707070] mb-2 uppercase tracking-wider">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#707070] mb-2 uppercase tracking-wider">Profile Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-3.5 h-5 w-5 text-[#c2410c]" />
                    <input 
                      type="text" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg (leave blank for auto-generated)"
                      className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#707070] mb-2 uppercase tracking-wider">Bio (Public)</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell your partner a little about yourself..."
                    rows={4}
                    className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a] resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-serif font-bold text-[#1a1a1a] mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#c2410c]" /> Privacy
              </h2>
              
              <div className="space-y-6">
                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div>
                    <div className="font-medium text-[#1a1a1a] text-sm">Public Profile</div>
                    <div className="text-xs text-[#707070] mt-1 leading-relaxed">Allow others to search for your email and view your profile to connect.</div>
                  </div>
                </label>

                <div className="border-t border-[#f9f8f6]"></div>

                <label className="flex items-start space-x-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${showEmail ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'} ${!isPublic && 'opacity-50'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showEmail ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#1a1a1a]'}`}>Show Email</div>
                    <div className={`text-xs mt-1 leading-relaxed ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#707070]'}`}>Display your email address on your public profile page.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto"
        >
          <button 
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center px-8 py-4 rounded-full shadow-lg font-medium transition-all ${
              saved 
                ? "bg-[#2e7d32] text-white shadow-green-900/20" 
                : "bg-[#c2410c] text-white hover:bg-[#a3360a] hover:-translate-y-1 hover:shadow-[#c2410c]/20"
            } disabled:opacity-50 disabled:hover:translate-y-0`}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (saved ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />)}
            {saved ? "Changes Saved Successfully" : "Save All Changes"}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
