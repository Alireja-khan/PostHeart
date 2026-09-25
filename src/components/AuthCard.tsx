'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  Feather, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Clock
} from 'lucide-react';
import BirdLoader from './BirdLoader';
import { textureBase64 } from './TextureBase64';
import { LITERARY_QUOTES } from '@/lib/literaryQuotes';

const ROTATION_INTERVAL_SECONDS = 30; // 30 seconds per quote

interface AuthCardProps {
  initialMode?: 'login' | 'register';
}

export default function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quote carousel state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [prevQuoteIndex, setPrevQuoteIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(ROTATION_INTERVAL_SECONDS);
  const [isPaused, setIsPaused] = useState(false);

  // On mount, select a random starting quote from the collection
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LITERARY_QUOTES.length);
    setCurrentQuoteIndex(randomIndex);
    setPrevQuoteIndex(randomIndex);
  }, []);

  // 30-second timer effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance to next quote
          setCurrentQuoteIndex((curr) => {
            setPrevQuoteIndex(curr);
            return (curr + 1) % LITERARY_QUOTES.length;
          });
          return ROTATION_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNextQuote = () => {
    setPrevQuoteIndex(currentQuoteIndex);
    setCurrentQuoteIndex((curr) => (curr + 1) % LITERARY_QUOTES.length);
    setSecondsRemaining(ROTATION_INTERVAL_SECONDS);
  };

  const handlePrevQuote = () => {
    setPrevQuoteIndex(currentQuoteIndex);
    setCurrentQuoteIndex((curr) => (curr - 1 + LITERARY_QUOTES.length) % LITERARY_QUOTES.length);
    setSecondsRemaining(ROTATION_INTERVAL_SECONDS);
  };

  const handleJumpToQuote = (index: number) => {
    setPrevQuoteIndex(currentQuoteIndex);
    setCurrentQuoteIndex(index);
    setSecondsRemaining(ROTATION_INTERVAL_SECONDS);
  };

  const activeQuote = LITERARY_QUOTES[currentQuoteIndex];
  const progressPercentage = ((ROTATION_INTERVAL_SECONDS - secondsRemaining) / ROTATION_INTERVAL_SECONDS) * 100;

  // Dot rail math: Container is 144px wide (center is at 72px).
  // Each slot is 20px wide (center is at idx * 20 + 10).
  // Translation to place currentQuoteIndex dead-center: 72 - (idx * 20 + 10) = 62 - idx * 20.
  const isWrapAround = Math.abs(currentQuoteIndex - prevQuoteIndex) > 10;
  const railTranslationX = 62 - (currentQuoteIndex * 20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await signIn('credentials', {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (res?.error) {
          setError('The seal could not be verified. Invalid dispatch address or passcode.');
        } else {
          router.push('/');
          router.refresh();
        }
      } else {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await regRes.json();

        if (!regRes.ok) {
          setError(data.message || 'Could not register your mailbox. Please try again.');
        } else {
          const signInRes = await signIn('credentials', {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
          });

          if (signInRes?.error) {
            setError('Account sealed! Please enter your passcode to log in.');
            setMode('login');
          } else {
            router.push('/');
            router.refresh();
          }
        }
      }
    } catch (err) {
      setError('A transmission error occurred while contacting the postal archive.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setError('');
    setMode(newMode);
    if (newMode === 'login') {
      window.history.replaceState(null, '', '/login');
    } else {
      window.history.replaceState(null, '', '/register');
    }
  };

  return (
    <div 
      suppressHydrationWarning 
      className="relative h-screen w-full flex flex-col lg:flex-row bg-[#080706] text-[#ede7dc] overflow-hidden"
    >
      {/* Background Ambience: Soft Warm Desk Study with Gentle Ambient Shading */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-15 filter blur-[2px] scale-105"
        style={{ backgroundImage: "url('/assets/desk_bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#060504]/95 via-[#0b0a09]/90 to-[#080706]/95 pointer-events-none" />

      {/* Subtle Texture Overlay for entire page */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url(${textureBase64})`, backgroundRepeat: 'repeat' }}
      />

      {/* ========================================================================= */}
      {/* LEFT COLUMN: Literary Sanctuary of Legendary Love Quotes (Poets & Sahittiks) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full lg:w-7/12 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 border-b lg:border-b-0 lg:border-r border-[#201c17] overflow-hidden">
        
        {/* Top Header: Brand & Return Navigation */}
        <div className="flex items-center justify-between shrink-0">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#13110f] hover:bg-[#1c1916] border border-[#27211b] hover:border-[#3d342b] text-[#aba294] hover:text-[#ede7dc] text-xs font-serif tracking-wider transition-all shadow-sm"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5 text-[#aba294] group-hover:text-[#ede7dc]" />
            <span>Return to Mailbox</span>
          </Link>

          {/* Postal Archive Badge (Balanced Warm Contrast) */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#13110f] border border-[#2b241d] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#c2410c] shadow-[0_0_6px_#c2410c] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#ded7cb] font-semibold">
              Archive of Immortal Longing
            </span>
          </div>
        </div>

        {/* Center: The Illuminated Literary Quote Showcase */}
        <div className="my-auto py-4 sm:py-6 max-w-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuote.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Giant Vintage Quotation Mark */}
              <div className="absolute -top-7 -left-3 sm:-left-5 text-[#ede7dc]/[0.05] select-none pointer-events-none font-serif text-7xl sm:text-8xl leading-none">
                “
              </div>

              {/* Tag / Category Badge (Soothing, Clear Contrast) */}
              <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#181512] border border-[#312a20] text-[10px] font-mono uppercase tracking-wider text-[#ded7cb] font-semibold shadow-sm">
                  {activeQuote.tag}
                </span>
                <span className="text-[#696154] text-xs font-mono">•</span>
                <span className="text-[#aba294] text-xs sm:text-sm font-serif italic truncate max-w-[320px]">
                  {activeQuote.title}
                </span>
              </div>

              {/* Main English Quote (Warm Parchment Cream - No Eye Glare) */}
              <blockquote className="font-serif text-lg sm:text-xl lg:text-2xl xl:text-[27px] leading-relaxed text-[#ede7dc] font-normal tracking-wide drop-shadow-sm mb-4">
                &ldquo;{activeQuote.englishQuote}&rdquo;
              </blockquote>

              {/* Original Native Script Quote (Bengali, Persian, Spanish, Arabic, etc.) */}
              {activeQuote.nativeQuote && (
                <div className="relative pl-3.5 border-l-2 border-[#c2410c]/60 my-3.5 py-1 bg-white/[0.015] rounded-r-lg pr-3">
                  <p className="font-serif text-sm sm:text-base text-[#ded7cb] italic leading-relaxed line-clamp-3">
                    {activeQuote.nativeQuote}
                  </p>
                </div>
              )}

              {/* Author & Literary Lore (Balanced, Comfortable Readability) */}
              <div className="flex items-center gap-3.5 mt-5 pt-4 border-t border-[#1f1a15]">
                {/* Author Emblem */}
                <div className="w-9 h-9 rounded-full bg-[#151210] border border-[#2b241c] p-0.5 shadow-sm flex items-center justify-center shrink-0">
                  <Feather size={14} className="text-[#c7bfb1]" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-[#ede7dc] tracking-wide truncate">
                    {activeQuote.author}
                  </h3>
                  <p className="font-mono text-xs text-[#a69e90] tracking-wider uppercase mt-0.5 font-medium truncate">
                    {activeQuote.authorNative ? `${activeQuote.authorNative} • ` : ''}{activeQuote.era}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: 30-Second Timer, Pause Button, Mathematically Centered Animated Dot Rail */}
        <div className="pt-4 border-t border-[#1a1713] flex flex-wrap items-center justify-between gap-4 shrink-0">
          
          {/* Quote Progress Timer (30s) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[#c2baa9] text-xs font-mono font-medium">
              <Clock size={13} className="text-[#c2410c]" />
              <span>Next whisper in {secondsRemaining}s</span>
            </div>

            {/* Progress Track */}
            <div className="w-20 h-1 bg-[#161310] rounded-full overflow-hidden border border-[#262019]">
              <motion.div 
                className="h-full bg-[#cfc7ba]"
                style={{ width: `${progressPercentage}%` }}
                transition={{ ease: "linear", duration: 1 }}
              />
            </div>
          </div>

          {/* Carousel Controls: Prominent Pause/Play, Perfectly Centered Gliding Dots, Arrows */}
          <div className="flex items-center gap-2">
            
            {/* Enhanced Pause/Play Button (Soothing & Tactile) */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`w-9 h-9 rounded-full border transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm ${
                isPaused 
                  ? 'bg-[#241e17] border-[#c2410c] text-[#ede7dc] shadow-[0_0_8px_rgba(194,65,12,0.25)]' 
                  : 'bg-[#151210] hover:bg-[#201c18] border-[#312920] hover:border-[#473c30] text-[#ede7dc]'
              }`}
              title={isPaused ? "Resume 30-second cycle" : "Pause 30-second cycle"}
              aria-label={isPaused ? "Resume cycle" : "Pause cycle"}
            >
              {isPaused ? <Play size={14} className="text-[#ede7dc] ml-0.5 fill-current" /> : <Pause size={14} className="text-[#ede7dc]" />}
            </button>

            {/* Previous Quote Arrow */}
            <button
              onClick={handlePrevQuote}
              className="w-9 h-9 rounded-full bg-[#151210] hover:bg-[#201c18] border border-[#2b241d] hover:border-[#42382d] text-[#ede7dc] flex items-center justify-center transition-all cursor-pointer shadow-sm"
              aria-label="Previous quote"
              title="Previous quote"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Mathematically Centered Animated Sliding Dot Rail with Gradient Edge Mask */}
            <div 
              className="relative w-36 h-9 flex items-center overflow-hidden px-1 select-none"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
              }}
            >
              <motion.div 
                className="flex items-center"
                animate={{ x: railTranslationX }}
                transition={
                  isWrapAround
                    ? { duration: 0.15, ease: "easeOut" }
                    : { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
                }
              >
                {LITERARY_QUOTES.map((q, idx) => {
                  const isCurrent = idx === currentQuoteIndex;
                  const dist = Math.abs(idx - currentQuoteIndex);
                  
                  return (
                    <div 
                      key={q.id}
                      className="w-5 h-8 shrink-0 flex items-center justify-center cursor-pointer"
                      onClick={() => handleJumpToQuote(idx)}
                      title={`Quote ${idx + 1}: ${q.author}`}
                      aria-label={`Jump to quote ${idx + 1}`}
                    >
                      <motion.div
                        animate={{
                          width: isCurrent ? 20 : 6,
                          height: isCurrent ? 6 : 6,
                          opacity: isCurrent ? 1 : dist === 1 ? 0.45 : dist === 2 ? 0.25 : 0.1,
                          scale: isCurrent ? 1.05 : 0.9,
                        }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className={`rounded-full transition-colors ${
                          isCurrent 
                            ? 'bg-[#ede7dc] shadow-[0_0_8px_rgba(237,231,220,0.5)]' 
                            : 'bg-[#918779] hover:bg-[#ede7dc]'
                        }`}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Next Quote Arrow */}
            <button
              onClick={handleNextQuote}
              className="w-9 h-9 rounded-full bg-[#151210] hover:bg-[#201c18] border border-[#2b241d] hover:border-[#42382d] text-[#ede7dc] flex items-center justify-center transition-all cursor-pointer shadow-sm"
              aria-label="Next quote"
              title="Next quote"
            >
              <ChevronRight size={15} />
            </button>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: The Minimalist & Creative Auth Portal (Login / Register Swap) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full lg:w-5/12 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-6 bg-[#0c0a09] overflow-hidden">
        
        {/* Subtle Warm Light Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.012] blur-3xl pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          
          {/* Brand Logo & Tagline (Comfortable Warm Parchment) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#cfc7ba] bg-[#161310] border border-[#2a231a] px-2.5 py-0.5 rounded font-medium shadow-sm">
                Confidential Postal Terminal
              </span>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#ede7dc] flex items-baseline">
              Dear You<span className="text-[#c2410c] ml-0.5">.</span>
            </h1>
            <p className="font-serif text-xs sm:text-sm text-[#aba294] mt-1 leading-relaxed">
              {mode === 'login' 
                ? 'Break the wax seal to unlock your letters and whispers.' 
                : 'Inscribe your pen name to begin a private story across distance.'}
            </p>
          </div>

          {/* Minimalist Tab Switcher (Balanced & Comfortable Contrast) */}
          <div className="relative p-1 rounded-xl bg-[#090807] border border-[#201b16] mb-5 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative z-10 py-2 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-lg cursor-pointer ${
                mode === 'login'
                  ? 'text-[#ede7dc] font-medium bg-[#1d1915] border border-[#362e24] shadow-sm'
                  : 'text-[#8a8172] hover:text-[#ede7dc] font-normal'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`relative z-10 py-2 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-lg cursor-pointer ${
                mode === 'register'
                  ? 'text-[#ede7dc] font-medium bg-[#1d1915] border border-[#362e24] shadow-sm'
                  : 'text-[#8a8172] hover:text-[#ede7dc] font-normal'
              }`}
            >
              Create Sanctuary
            </button>
          </div>

          {/* Error Notice */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="p-3 rounded-xl bg-[#220a07] border border-[#7f1d1d]/60 text-[#fca5a5] text-xs font-serif flex items-start gap-2 shadow-inner">
                  <span className="text-[#ef4444] font-bold mt-0.5">•</span>
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimalist Form with Transparent Inputs & Balanced Labels */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Pen Name Field (On Register) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#bfb7a8] font-medium mb-1.5">
                    Your Pen Name / Callsign
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7a7163] group-focus-within:text-[#ded7cb] transition-colors">
                      <Feather size={14} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya or The Quiet Poet"
                      className="w-full bg-transparent border border-[#27211b] hover:border-[#3d3329] focus:border-[#574939] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#ede7dc] placeholder:text-[#635b4f] font-serif focus:outline-none transition-all"
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#bfb7a8] font-medium mb-1.5">
                Postal Dispatch Address (Email)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7a7163] group-focus-within:text-[#ded7cb] transition-colors">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.secret@letterbox.com"
                  className="w-full bg-transparent border border-[#27211b] hover:border-[#3d3329] focus:border-[#574939] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#ede7dc] placeholder:text-[#635b4f] font-serif focus:outline-none transition-all"
                  style={{ backgroundColor: 'transparent' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#bfb7a8] font-medium">
                  Vault Passcode
                </label>
                {mode === 'login' && (
                  <span className="text-xs font-serif italic text-[#8a8172]">
                    Encrypted seal
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7a7163] group-focus-within:text-[#ded7cb] transition-colors">
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent border border-[#27211b] hover:border-[#3d3329] focus:border-[#574939] rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#ede7dc] placeholder:text-[#635b4f] font-mono tracking-wider focus:outline-none transition-all"
                  style={{ backgroundColor: 'transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7a7163] hover:text-[#ded7cb] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {mode === 'register' && password.length > 0 && (
                <p className="text-xs font-serif italic text-[#a89f91] mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck size={12} className={password.length >= 6 ? "text-emerald-500/80 font-medium" : "text-amber-500/80 font-medium"} />
                  <span>
                    {password.length < 6 
                      ? 'Must be at least 6 characters.' 
                      : 'A strong seal keeps your letters private.'}
                  </span>
                </p>
              )}
            </div>

            {/* Minimalist Button (NO orange background!) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 relative overflow-hidden rounded-xl bg-[#161310] hover:bg-[#201c18] text-[#ede7dc] py-3 px-4 font-serif text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 border border-[#2e261d] hover:border-[#44382b] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2.5">
                  <BirdLoader className="w-4 h-4 text-[#ede7dc]" />
                  <span className="font-serif capitalize text-xs tracking-normal text-[#aba294]">
                    {mode === 'login' ? 'Verifying seal...' : 'Affixing seal...'}
                  </span>
                </div>
              ) : (
                <>
                  <span className="group-hover:text-white transition-colors">
                    {mode === 'login' ? 'Break Seal & Enter' : 'Affix Seal & Begin Story'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] transition-transform group-hover:scale-125" />
                </>
              )}
            </button>
          </form>

          {/* Footer note (Soft Warm Legibility) */}
          <div className="mt-6 text-center pt-4 border-t border-[#1c1813]">
            <p className="font-handwriting text-base text-[#ded7cb]">
              &ldquo;Where distance fades into ink and longing.&rdquo;
            </p>
            <div className="mt-1.5 text-xs font-mono text-[#8f8576]">
              {mode === 'login' ? (
                <>
                  Haven't created your sanctuary yet?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-[#ded7cb] hover:text-[#ede7dc] font-medium transition-colors ml-1 cursor-pointer focus:outline-none"
                  >
                    Begin here
                  </button>
                </>
              ) : (
                <>
                  Already have a sealed mailbox?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-[#ded7cb] hover:text-[#ede7dc] font-medium transition-colors ml-1 cursor-pointer focus:outline-none"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
