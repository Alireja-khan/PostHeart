'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Palette, 
  Bell, 
  Volume2, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Heart, 
  Send, 
  ExternalLink,
  Shield,
  CloudRain,
  Flame,
  Disc,
  VolumeX,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialog } from '@/components/DialogProvider';
import BirdLoader from '@/components/BirdLoader';
import Link from 'next/link';

interface SettingsData {
  id: string;
  name: string;
  email: string;
  accentColor: string;
  emailNotifications: boolean;
  ambientSound: string;
  isPublic: boolean;
  showEmail: boolean;
  isPartnered: boolean;
  partnerName: string;
  partnerEmail: string;
  partnerAvatar: string | null;
  hasPassword: boolean;
  isGoogleLinked: boolean;
}

const ACCENT_OPTIONS = [
  {
    id: 'rust',
    name: 'Terracotta Rust',
    bengali: 'টেরাকোটা লালচে মাটির রঙ',
    hex: '#c2410c',
    bgClass: 'bg-[#c2410c]',
    borderClass: 'border-[#c2410c]',
    textClass: 'text-[#c2410c]',
    glowClass: 'shadow-[#c2410c]/25',
    description: 'Warm earthenware, antique wax seal tone & classical intimacy'
  },
  {
    id: 'sage',
    name: 'Sage Green',
    bengali: 'সেজ গ্রিন বোটানিকাল',
    hex: '#344e41',
    bgClass: 'bg-[#344e41]',
    borderClass: 'border-[#344e41]',
    textClass: 'text-[#588157]',
    glowClass: 'shadow-[#344e41]/25',
    description: 'Calm evergreen leaves, silent tea garden & woodland serenity'
  },
  {
    id: 'gold',
    name: 'Vintage Gold',
    bengali: 'ভিন্টেজ সোনালী আভা',
    hex: '#d97706',
    bgClass: 'bg-[#d97706]',
    borderClass: 'border-[#d97706]',
    textClass: 'text-[#f59e0b]',
    glowClass: 'shadow-[#d97706]/25',
    description: 'Gilded parchment borders, antique brass pens & regal warm sunset'
  },
  {
    id: 'charcoal',
    name: 'Charcoal Obsidian',
    bengali: 'চারকোল অবসিডিয়ান',
    hex: '#4b5563',
    bgClass: 'bg-[#4b5563]',
    borderClass: 'border-[#6b7280]',
    textClass: 'text-[#9ca3af]',
    glowClass: 'shadow-gray-500/20',
    description: 'Minimalist fountain ink, starry midnight paper & understated elegance'
  }
];

const AMBIENT_SOUNDS = [
  {
    id: 'rain',
    title: 'Rain on Window',
    sub: 'Soft monsoon drizzle against window glass',
    icon: CloudRain,
    tone: '432Hz natural frequency'
  },
  {
    id: 'fire',
    title: 'Hearth Fireplace',
    sub: 'Soothing wooden crackles & gentle embers',
    icon: Flame,
    tone: 'Warm low frequencies'
  },
  {
    id: 'vinyl',
    title: 'Gramophone Vinyl',
    sub: 'Analog needle dust, soft hiss & tape air',
    icon: Disc,
    tone: 'Lo-Fi warm aesthetic'
  },
  {
    id: 'none',
    title: 'Sacred Silence',
    sub: 'Pure calm silence for undisturbed thought',
    icon: VolumeX,
    tone: 'Complete tranquility'
  }
];

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { confirm, alert } = useDialog();

  const [loading, setLoading] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security' | 'danger'>('profile');

  // Form State
  const [name, setName] = useState('');
  const [accentColor, setAccentColor] = useState('rust');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ambientSound, setAmbientSound] = useState('none');
  const [isPublic, setIsPublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  // Read-only server details
  const [userData, setUserData] = useState<SettingsData | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Audio preview state
  const [previewingSound, setPreviewingSound] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch settings data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data: SettingsData = await res.json();
      setUserData(data);
      setName(data.name || '');
      setAccentColor(data.accentColor || 'rust');
      setEmailNotifications(data.emailNotifications ?? true);
      setAmbientSound(data.ambientSound || 'none');
      setIsPublic(data.isPublic ?? true);
      setShowEmail(data.showEmail ?? false);
    } catch (err) {
      console.error(err);
      toast.error('Could not load preferences from sanctuary archive.');
    } finally {
      setLoading(false);
    }
  };

  // Save General Preferences
  const handleSavePreferences = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error('Scribe name cannot be left blank.');
      return;
    }

    try {
      setSavingGeneral(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          accentColor,
          emailNotifications,
          ambientSound,
          isPublic,
          showEmail
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to update preferences');
      }

      // Update NextAuth local session name
      await update({ name: name.trim() });

      toast.success('Sanctuary preferences sealed into parchment!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error saving settings.');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userData?.hasPassword && !currentPassword) {
      toast.error('Please enter your current master password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('The new passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: userData?.hasPassword ? currentPassword : '',
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      toast.success(data.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Refresh to update hasPassword state
      fetchSettings();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Reset Couple Board
  const handleResetBoard = async () => {
    const isConfirmed = await confirm(
      'Reset Shared Couple Board?',
      'Are you sure you want to clear your Couple Corkboard? All custom polaroids, romantic notes, stickers, and washi tape will be permanently cleared from this device.'
    );

    if (isConfirmed) {
      localStorage.removeItem('dear_you_corkboard_items');
      toast.success('Couple Board has been reset to pristine initial state.');
    }
  };

  // Clear Local Letter Drafts
  const handleClearDrafts = async () => {
    const isConfirmed = await confirm(
      'Discard Letter Drafts?',
      'This will erase any unsent letter drafts saved on your current device.'
    );

    if (isConfirmed) {
      localStorage.removeItem('letter_draft_title');
      localStorage.removeItem('letter_draft_content');
      localStorage.removeItem('dear_you_letter_draft');
      toast.success('Local drafts cleared successfully.');
    }
  };

  // Synthesize Web Audio Preview
  const playSoundPreview = (soundId: string) => {
    if (typeof window === 'undefined') return;
    if (soundId === 'none') {
      toast('Sacred Silence selected. No ambient frequencies.', { icon: '🤫' });
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      setPreviewingSound(soundId);

      const bufferSize = ctx.sampleRate * 2.5; // 2.5 seconds preview
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (soundId === 'rain') {
        // Brownian noise for rain
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }
      } else if (soundId === 'fire') {
        // Crackling fireplace
        for (let i = 0; i < bufferSize; i++) {
          const isPop = Math.random() < 0.003;
          data[i] = isPop ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 0.05 - 0.025);
        }
      } else if (soundId === 'vinyl') {
        // Vinyl hiss + pops
        for (let i = 0; i < bufferSize; i++) {
          const pop = Math.random() < 0.001 ? (Math.random() * 0.5) : 0;
          data[i] = (Math.random() * 0.04 - 0.02) + pop;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = soundId === 'fire' ? 'bandpass' : 'lowpass';
      filter.frequency.value = soundId === 'rain' ? 850 : soundId === 'fire' ? 450 : 2500;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();

      setTimeout(() => {
        setPreviewingSound(null);
        try { ctx.close(); } catch(e) {}
      }, 2500);

    } catch (e) {
      console.error(e);
      setPreviewingSound(null);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: 'Empty', score: 0, color: 'bg-neutral-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 1, color: 'bg-red-500' };
    if (score <= 4) return { label: 'Good', score: 2, color: 'bg-amber-500' };
    return { label: 'Strong & Sealed', score: 3, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const selectedAccent = ACCENT_OPTIONS.find(a => a.id === accentColor) || ACCENT_OPTIONS[0];

  if (loading) {
    return (
      <div className="w-full h-full min-h-[85vh] flex flex-col items-center justify-center bg-[#0d0c0b] text-[#f5f2eb] gap-4">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        <p className="font-serif text-sm text-[#a89e91] animate-pulse">
          Unrolling sanctuary scrolls & settings ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-[#0d0c0b] text-[#f5f2eb] p-4 sm:p-8 lg:p-12 overflow-y-auto no-scrollbar selection:bg-[#c2410c]/30 selection:text-[#f5f2eb]">
      
      {/* Top Atmospheric Header */}
      <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#25211c] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1713] border border-[#302922] text-[#c2410c] text-[10px] font-mono uppercase tracking-widest mb-3">
              <Sparkles size={12} className="animate-pulse" />
              <span>Postal District Archive • Sanctuary Preferences</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f2eb]">
              Sanctuary Settings
            </h1>
            <p className="text-sm text-[#a89e91] mt-2 font-serif max-w-2xl leading-relaxed">
              Personalize your epistolary identity, aesthetic wax seal accents, postal flight notifications, and master cipher keys.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-3 bg-[#161412] border border-[#2b251f] p-3 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[#211c17] flex items-center justify-center text-[#c2410c] border border-[#3b3228]">
              <ShieldCheck size={20} />
            </div>
            <div className="text-xs font-serif">
              <p className="text-[#a89e91] text-[10px] uppercase font-mono tracking-wider">Sanctuary Status</p>
              <p className="text-[#f5f2eb] font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {userData?.isPartnered ? `Bonded with ${userData.partnerName || 'Partner'}` : 'Solo Scribe Chamber'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-6 border-b border-[#211d18] pb-1">
          {[
            { id: 'profile', label: 'Identity & Scribe', icon: User },
            { id: 'appearance', label: 'Palette & Atmosphere', icon: Palette },
            { id: 'notifications', label: 'Postal Dispatch', icon: Bell },
            { id: 'security', label: 'Security & Cipher', icon: Lock },
            { id: 'danger', label: 'Chamber Reset', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-serif transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#221c16] text-[#f5f2eb] border border-[#42372c] font-semibold shadow-sm'
                    : 'text-[#8c8275] hover:text-[#f5f2eb] hover:bg-[#181512] border border-transparent'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#c2410c]' : 'text-[#8c8275]'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto space-y-8 pb-16">

        {/* TAB 1: IDENTITY & SCRIBE */}
        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#141210] border border-[#252019] rounded-2xl p-6 sm:p-8 card-shadow space-y-6">
              <div className="flex items-center justify-between border-b border-[#252019] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#201a14] border border-[#3a2f24] text-[#c2410c]">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#f5f2eb]">Scribe Identity & Station</h2>
                    <p className="text-xs text-[#8c8275] font-serif">How your name and station appear across letters and envelopes.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSavePreferences()}
                  disabled={savingGeneral}
                  className="flex items-center gap-2 bg-[#c2410c] hover:bg-[#d9480f] text-white px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c2410c]/20"
                >
                  <Save size={14} />
                  <span>{savingGeneral ? 'Sealing...' : 'Save Name'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scribe Name */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#a89e91]">
                    Your Scribe Name <span className="text-[#c2410c]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your pen name or real name..."
                    className="w-full bg-[#0e0d0c] border border-[#2c261e] rounded-xl px-4 py-3 text-[#f5f2eb] font-serif text-sm focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/30 transition-all placeholder-[#5e5549]"
                  />
                  <p className="text-[11px] text-[#786e61] font-serif">
                    This signature will be embossed on the wax seal of every outgoing letter.
                  </p>
                </div>

                {/* Account Station Email */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#a89e91]">
                    Station Postal Address (Email)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={userData?.email || ''}
                      disabled
                      className="w-full bg-[#181512] border border-[#2b251e] rounded-xl px-4 py-3 text-[#b8afa2] font-mono text-sm cursor-not-allowed select-none opacity-85"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-[10px] font-mono bg-[#28221b] text-[#a89e91] px-2 py-0.5 rounded border border-[#3b3227]">
                        Permanent
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#786e61] font-serif">
                    Used to authenticate your station and route sealed electronic letters.
                  </p>
                </div>
              </div>

              {/* Partner Status Card */}
              <div className="mt-6 pt-6 border-t border-[#252019]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#a89e91] mb-3">
                  Coupled Station Status
                </h3>

                {userData?.isPartnered ? (
                  <div className="bg-[#191512] border border-[#332b21] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#27211a] border-2 border-[#c2410c]/40 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {userData.partnerAvatar ? (
                          <img src={userData.partnerAvatar} alt="Partner Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Heart size={24} className="text-[#c2410c]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-bold text-[#f5f2eb]">
                            {userData.partnerName || 'Companion Scribe'}
                          </h4>
                          <span className="text-[10px] font-mono uppercase bg-[#2e1d13] text-[#f97316] px-2 py-0.5 rounded-full border border-[#522915]">
                            Linked Partner
                          </span>
                        </div>
                        <p className="text-xs text-[#8c8275] font-mono mt-0.5">{userData.partnerEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/find-partner"
                        className="px-4 py-2 rounded-xl bg-[#231d17] hover:bg-[#2e261f] border border-[#3f3427] text-xs font-serif text-[#d6cdbe] transition-colors inline-flex items-center gap-2"
                      >
                        <Heart size={14} className="text-[#c2410c]" />
                        <span>Manage Bond</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#171411] border border-dashed border-[#352c22] rounded-xl p-5 sm:p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#231b14] border border-[#3d2e20] text-[#c2410c] flex items-center justify-center mx-auto">
                      <Heart size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#f5f2eb]">No Companion Station Linked</h4>
                      <p className="text-xs text-[#8c8275] font-serif max-w-md mx-auto mt-1">
                        Connect with your special person to start sending carrier pigeon letters and pinning memories on the shared Couple Board.
                      </p>
                    </div>
                    <Link
                      href="/find-partner"
                      className="inline-flex items-center gap-2 bg-[#c2410c] hover:bg-[#d9480f] text-white px-5 py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-md shadow-[#c2410c]/20"
                    >
                      <Sparkles size={14} />
                      <span>Open Partner Finder</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>

              {/* Privacy Toggles */}
              <div className="pt-6 border-t border-[#252019] space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#a89e91]">
                  Directory & Visibility Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Public Directory */}
                  <div 
                    onClick={() => setIsPublic(!isPublic)}
                    className="flex items-start justify-between p-4 rounded-xl bg-[#171411] border border-[#2b241c] hover:border-[#3b3227] transition-all cursor-pointer group"
                  >
                    <div className="pr-4">
                      <p className="font-serif text-sm font-semibold text-[#f5f2eb] group-hover:text-white">
                        Public Scribe Directory
                      </p>
                      <p className="text-xs text-[#7e7467] font-serif mt-1">
                        Allow other scribes to locate your station in the Community Scribe directory.
                      </p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors relative border flex-shrink-0 mt-0.5 ${
                      isPublic ? 'bg-[#c2410c] border-[#c2410c]' : 'bg-[#221c17] border-[#382f25]'
                    }`}>
                      <motion.div 
                        className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5 shadow-sm"
                        animate={{ x: isPublic ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>

                  {/* Show Email */}
                  <div 
                    onClick={() => setShowEmail(!showEmail)}
                    className="flex items-start justify-between p-4 rounded-xl bg-[#171411] border border-[#2b241c] hover:border-[#3b3227] transition-all cursor-pointer group"
                  >
                    <div className="pr-4">
                      <p className="font-serif text-sm font-semibold text-[#f5f2eb] group-hover:text-white">
                        Display Email Address
                      </p>
                      <p className="text-xs text-[#7e7467] font-serif mt-1">
                        Display your station email on your public profile envelope badge.
                      </p>
                    </div>
                    <div className={`w-11 h-6 rounded-full transition-colors relative border flex-shrink-0 mt-0.5 ${
                      showEmail ? 'bg-[#344e41] border-[#344e41]' : 'bg-[#221c17] border-[#382f25]'
                    }`}>
                      <motion.div 
                        className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5 shadow-sm"
                        animate={{ x: showEmail ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: APPEARANCE & ATMOSPHERE */}
        {activeTab === 'appearance' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#141210] border border-[#252019] rounded-2xl p-6 sm:p-8 card-shadow space-y-8">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#252019] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#201a14] border border-[#3a2f24] text-[#d97706]">
                    <Palette size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#f5f2eb]">Aesthetic Palette & Chamber Ambiance</h2>
                    <p className="text-xs text-[#8c8275] font-serif">Curate your wax seal pigments and background auditory frequencies.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSavePreferences()}
                  disabled={savingGeneral}
                  className="flex items-center gap-2 bg-[#c2410c] hover:bg-[#d9480f] text-white px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c2410c]/20"
                >
                  <Save size={14} />
                  <span>{savingGeneral ? 'Saving...' : 'Apply Theme'}</span>
                </button>
              </div>

              {/* Accent Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#f5f2eb]">Primary Epistolary Accent</h3>
                    <p className="text-xs text-[#8c8275] font-serif">Color used for wax seals, primary highlights, stamps, and letter ribbons.</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#201a14] border border-[#352b21] text-[#f5f2eb]">
                    Active: <strong style={{ color: selectedAccent.hex }}>{selectedAccent.name}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {ACCENT_OPTIONS.map((accent) => {
                    const isSelected = accentColor === accent.id;
                    return (
                      <div
                        key={accent.id}
                        onClick={() => setAccentColor(accent.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-[#1e1813] border-[#c2410c] shadow-lg shadow-[#c2410c]/15 ring-1 ring-[#c2410c]/40' 
                            : 'bg-[#151210] border-[#29231c] hover:border-[#3d3429] hover:bg-[#1a1613]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div 
                            className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center shadow-inner" 
                            style={{ backgroundColor: accent.hex }}
                          >
                            {isSelected && <Check size={14} className="text-white drop-shadow" />}
                          </div>
                          <span className="text-[10px] font-mono uppercase text-[#736a5e] tracking-wider">
                            {accent.hex}
                          </span>
                        </div>

                        <h4 className="font-serif text-sm font-bold text-[#f5f2eb] group-hover:text-white">
                          {accent.name}
                        </h4>
                        <p className="text-[11px] font-serif text-[#a89e91] mt-0.5">
                          {accent.bengali}
                        </p>
                        <p className="text-[10px] text-[#6d6457] font-serif mt-2 leading-relaxed">
                          {accent.description}
                        </p>

                        {isSelected && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1"
                            style={{ backgroundColor: accent.hex }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Live Accent Preview */}
              <div className="bg-[#100e0d] border border-[#2a231b] rounded-xl p-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                      style={{ backgroundColor: selectedAccent.hex }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-[#a89e91]">Live Wax Seal Preview</p>
                      <p className="font-serif text-sm text-[#f5f2eb]">
                        "The letters we seal with <span style={{ color: selectedAccent.hex }} className="font-semibold">{selectedAccent.name}</span> carry our deepest devotion."
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-white font-bold"
                      style={{ backgroundColor: selectedAccent.hex }}
                    >
                      Embossed Stamp
                    </span>
                  </div>
                </div>
              </div>

              {/* Ambient Sound Selection */}
              <div className="pt-6 border-t border-[#252019]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#f5f2eb]">Chamber Ambient Engine</h3>
                    <p className="text-xs text-[#8c8275] font-serif">Select your preferred background soundscape while composing letters.</p>
                  </div>
                  <span className="text-xs font-mono text-[#8c8275]">
                    Click to test sound frequencies
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AMBIENT_SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const isSelected = ambientSound === sound.id;
                    const isPlayingThis = previewingSound === sound.id;
                    return (
                      <div
                        key={sound.id}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#1d1712] border-[#c2410c] ring-1 ring-[#c2410c]/30'
                            : 'bg-[#151210] border-[#29231c] hover:border-[#3d3429] hover:bg-[#1a1613]'
                        }`}
                        onClick={() => setAmbientSound(sound.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-[#c2410c]/20 text-[#c2410c]' : 'bg-[#221c17] text-[#8c8275]'}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif text-sm font-bold text-[#f5f2eb]">{sound.title}</h4>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]"></span>
                                )}
                              </div>
                              <p className="text-xs text-[#8c8275] font-serif mt-0.5">{sound.sub}</p>
                              <span className="text-[10px] font-mono text-[#635b50] block mt-1">
                                {sound.tone}
                              </span>
                            </div>
                          </div>

                          {sound.id !== 'none' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                playSoundPreview(sound.id);
                              }}
                              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                                isPlayingThis 
                                  ? 'bg-[#c2410c] text-white animate-pulse' 
                                  : 'bg-[#231d17] hover:bg-[#30271f] text-[#b8afa2]'
                              }`}
                              title="Listen to 3s audio snippet"
                            >
                              <Volume2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: POSTAL DISPATCH & NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#141210] border border-[#252019] rounded-2xl p-6 sm:p-8 card-shadow space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#252019] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#201a14] border border-[#3a2f24] text-[#344e41]">
                    <Bell size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#f5f2eb]">Postal Dispatches & Delivery Alerts</h2>
                    <p className="text-xs text-[#8c8275] font-serif">Configure when and where carrier notifications fly to you.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSavePreferences()}
                  disabled={savingGeneral}
                  className="flex items-center gap-2 bg-[#c2410c] hover:bg-[#d9480f] text-white px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c2410c]/20"
                >
                  <Save size={14} />
                  <span>{savingGeneral ? 'Saving...' : 'Save Alerts'}</span>
                </button>
              </div>

              {/* Main Feature: Email Notification Dispatch */}
              <div className="bg-[#191512] border border-[#30271e] rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-xl bg-[#261e16] border border-[#403324] text-[#c2410c] flex-shrink-0 mt-0.5">
                      <Mail size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-bold text-[#f5f2eb]">
                          Email Letter Delivery Alerts
                        </h3>
                        <span className="text-[10px] font-mono uppercase bg-[#281e15] text-[#ea580c] px-2 py-0.5 rounded border border-[#442f1f]">
                          Essential
                        </span>
                      </div>
                      <p className="text-xs text-[#a89e91] font-serif mt-1 leading-relaxed max-w-xl">
                        When your partner sends a letter and the carrier bird arrives, receive an instant postal email alert at <strong className="text-[#f5f2eb]">{userData?.email}</strong> so you never miss a sealed love note.
                      </p>
                      <p className="text-[11px] text-[#786e61] font-mono mt-2">
                        চিঠি এসে পৌঁছালে যেন ইমেইল অ্যালার্ট যায় • Instant Postal Mail Dispatch
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-12 h-7 rounded-full transition-colors relative border flex-shrink-0 cursor-pointer ${
                      emailNotifications ? 'bg-[#c2410c] border-[#c2410c]' : 'bg-[#221c17] border-[#382f25]'
                    }`}
                  >
                    <motion.div 
                      className="w-5 h-5 bg-white rounded-full absolute left-1 top-0.5 shadow-md"
                      animate={{ x: emailNotifications ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="pt-3 border-t border-[#292219] flex items-center justify-between text-xs text-[#8c8275]">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <CheckCircle2 size={13} className={emailNotifications ? 'text-emerald-500' : 'text-neutral-500'} />
                    Status: {emailNotifications ? 'Email alerts enabled for incoming letters' : 'Muted (Check mailbox manually)'}
                  </span>
                  <span className="font-mono text-[10px] text-[#635b50]">Delivery SLA: &lt; 30 seconds</span>
                </div>
              </div>

              {/* In-App Carrier Bird Audio & Flight Tracker */}
              <div className="bg-[#151210] border border-[#262018] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#201913] text-[#344e41] border border-[#31271d]">
                      <Volume2 size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-[#f5f2eb]">In-App Carrier Flight Audio</h4>
                      <p className="text-xs text-[#8c8275] font-serif">Play authentic quill, fluttering wings, and vintage bell sounds during mailbox deliveries.</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#a89e91] bg-[#221c16] px-2.5 py-1 rounded border border-[#332b21]">
                    Active Globally
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: SECURITY & CIPHER KEY */}
        {activeTab === 'security' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#141210] border border-[#252019] rounded-2xl p-6 sm:p-8 card-shadow space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#252019] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#201a14] border border-[#3a2f24] text-[#c2410c]">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#f5f2eb]">Account Security & Master Password</h2>
                    <p className="text-xs text-[#8c8275] font-serif">Manage the cryptographic seal guarding your sanctuary letters.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {userData?.isGoogleLinked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1c24] border border-[#2b3044] text-[#93c5fd] text-[10px] font-mono uppercase">
                      <svg className="w-3 h-3" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Google Linked
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase border ${
                    userData?.hasPassword 
                      ? 'bg-[#18231c] text-[#86efac] border-[#223d2b]' 
                      : 'bg-[#291e14] text-[#fdba74] border-[#452b17]'
                  }`}>
                    <Shield size={11} />
                    {userData?.hasPassword ? 'Password Active' : 'No Password Set'}
                  </span>
                </div>
              </div>

              {/* Password Explanation for OAuth or Standard */}
              {!userData?.hasPassword && userData?.isGoogleLinked && (
                <div className="bg-[#181d26] border border-[#2b3547] rounded-xl p-4 text-xs font-serif text-[#cbd5e1] leading-relaxed">
                  <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#60a5fa]" />
                    Set a Master Password for direct email login
                  </p>
                  You originally authenticated using Google Workspace. You can establish a personal master password below to enable logging into your sanctuary directly using your email and password without relying solely on Google.
                </div>
              )}

              {/* Modern Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                {/* Current Password (if already configured) */}
                {userData?.hasPassword && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono uppercase tracking-widest text-[#a89e91]">
                      Current Master Password <span className="text-[#c2410c]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password..."
                        className="w-full bg-[#0e0d0c] border border-[#2c261e] rounded-xl px-4 py-3 text-[#f5f2eb] font-sans text-sm focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/30 pr-10 placeholder-[#5e5549]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786e61] hover:text-[#f5f2eb] transition-colors p-1"
                      >
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#a89e91]">
                    {userData?.hasPassword ? 'New Master Password' : 'Create Master Password'} <span className="text-[#c2410c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters with letters & numbers..."
                      className="w-full bg-[#0e0d0c] border border-[#2c261e] rounded-xl px-4 py-3 text-[#f5f2eb] font-sans text-sm focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/30 pr-10 placeholder-[#5e5549]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786e61] hover:text-[#f5f2eb] transition-colors p-1"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength Meter */}
                  {newPassword && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#7e7467]">Cipher Strength:</span>
                        <span className="text-[#f5f2eb] font-semibold">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5">
                        <div className={`rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-[#262018]'}`} />
                        <div className={`rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-[#262018]'}`} />
                        <div className={`rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-[#262018]'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#a89e91]">
                    Confirm New Master Password <span className="text-[#c2410c]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="w-full bg-[#0e0d0c] border border-[#2c261e] rounded-xl px-4 py-3 text-[#f5f2eb] font-sans text-sm focus:outline-none focus:border-[#c2410c] focus:ring-1 focus:ring-[#c2410c]/30 pr-10 placeholder-[#5e5549]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#786e61] hover:text-[#f5f2eb] transition-colors p-1"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <p className={`text-[11px] font-mono ${newPassword === confirmPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                      {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match yet'}
                    </p>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingPassword || !newPassword || newPassword !== confirmPassword}
                    className="flex items-center justify-center gap-2 bg-[#c2410c] hover:bg-[#d9480f] text-white px-6 py-3 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#c2410c]/20 w-full sm:w-auto"
                  >
                    <Lock size={14} />
                    <span>{savingPassword ? 'Encrypting & Updating...' : (userData?.hasPassword ? 'Update Master Password' : 'Save Master Password')}</span>
                  </button>
                </div>
              </form>

            </div>
          </motion.div>
        )}

        {/* TAB 5: DANGER ZONE & CHAMBER RESET */}
        {activeTab === 'danger' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Danger Card */}
            <div className="bg-[#181110] border border-red-950/70 rounded-2xl p-6 sm:p-8 card-shadow space-y-6">
              
              <div className="flex items-center gap-3 border-b border-red-950/50 pb-4">
                <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-900/40">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-red-200">Chamber Reset & Danger Zone</h2>
                  <p className="text-xs text-red-300/70 font-serif">Actions here modify local cache or reset corkboard arrangements.</p>
                </div>
              </div>

              {/* Reset Corkboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#201311] border border-red-950/60">
                <div>
                  <h4 className="font-serif text-sm font-bold text-red-100">Reset Shared Couple Board</h4>
                  <p className="text-xs text-red-300/70 font-serif mt-0.5 max-w-lg">
                    Permanently clears all custom sticky notes, polaroids, washi tape, and sticker pins cached for your Couple Corkboard on this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetBoard}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 hover:border-red-600 rounded-xl text-xs font-serif text-red-200 transition-colors font-bold whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <RotateCcw size={14} />
                  <span>Reset Board</span>
                </button>
              </div>

              {/* Clear Drafts */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#201311] border border-red-950/60">
                <div>
                  <h4 className="font-serif text-sm font-bold text-red-100">Discard Local Letter Drafts</h4>
                  <p className="text-xs text-red-300/70 font-serif mt-0.5 max-w-lg">
                    Clears any in-progress letter drafts stored locally on your device browser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearDrafts}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 hover:border-red-600 rounded-xl text-xs font-serif text-red-200 transition-colors font-bold whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <Trash2 size={14} />
                  <span>Purge Drafts</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#201311] border border-red-950/60">
                <div>
                  <h4 className="font-serif text-sm font-bold text-red-100">Seal & Depart Sanctuary</h4>
                  <p className="text-xs text-red-300/70 font-serif mt-0.5 max-w-lg">
                    Terminates your current active session on this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-serif text-neutral-200 transition-colors font-bold whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
