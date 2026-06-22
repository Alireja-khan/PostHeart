"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Save, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react"

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [showEmail, setShowEmail] = useState(false)

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
          setAvatarUrl(data.avatarUrl || "")
          setBio(data.bio || "")
          setIsPublic(data.isPublic ?? true)
          setShowEmail(data.showEmail ?? false)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [status])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl, bio, isPublic, showEmail })
      })
      if (res.ok) {
        setSaved(true)
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

  const currentAvatar = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name || session?.user?.email}`

  return (
    <div className="min-h-screen p-8 lg:p-12 font-sans bg-[#f9f8f6]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white border border-[#e6e4df] rounded-3xl p-8 shadow-sm"
      >
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#e6e4df]">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 bg-[#f9f8f6] rounded-full flex items-center justify-center border border-[#e6e4df] overflow-hidden">
              {currentAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="text-[#c2410c] h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1a1a1a]">My Profile</h1>
              <p className="text-[#707070] mt-1">Manage your account and public presence</p>
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-3 bg-[#c2410c] text-white rounded-xl hover:bg-[#a3360a] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (saved ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />)}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Name</label>
              <div className="flex items-center text-[#1a1a1a] bg-[#f9f8f6] px-4 py-3 rounded-xl border border-[#e6e4df]">
                <User className="h-5 w-5 text-[#c2410c] mr-3" />
                <span className="font-medium">{session?.user?.name || "No name provided"}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Email Address</label>
              <div className="flex items-center text-[#1a1a1a] bg-[#f9f8f6] px-4 py-3 rounded-xl border border-[#e6e4df]">
                <Mail className="h-5 w-5 text-[#c2410c] mr-3" />
                <span className="font-medium">{session?.user?.email}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Profile Image URL</label>
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
            <label className="block text-sm font-medium text-[#707070] mb-2 uppercase tracking-wider">Bio (Public)</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your partner a little about yourself..."
              rows={4}
              className="w-full bg-[#f9f8f6] border border-[#e6e4df] rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#c2410c]/20 focus:border-[#c2410c] transition-all text-[#1a1a1a] resize-none"
            />
          </div>

          <div className="border-t border-[#e6e4df] pt-6 mt-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1a1a1a] mb-4">Privacy Settings</h3>
            
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div>
                <div className="font-medium text-[#1a1a1a]">Public Profile</div>
                <div className="text-sm text-[#707070]">Allow others to search for your email and view your profile to connect.</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={showEmail} onChange={(e) => setShowEmail(e.target.checked)} disabled={!isPublic} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${showEmail ? 'bg-[#c2410c]' : 'bg-[#e6e4df]'} ${!isPublic && 'opacity-50'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showEmail ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <div>
                <div className={`font-medium ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#1a1a1a]'}`}>Show Email Publicly</div>
                <div className={`text-sm ${!isPublic ? 'text-[#a0a0a0]' : 'text-[#707070]'}`}>Display your email address on your public profile page.</div>
              </div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
