'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Image as ImageIcon, Music, Mic, Grid, PackageOpen, ArrowLeft, X, Sparkles, Feather } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BirdLoader from './BirdLoader';
import { textureBase64 } from './TextureBase64';
import AntiqueEmptyDesk from './AntiqueEmptyDesk';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Letter {
  id: string;
  content: string;
  sender: User;
  receiver: User | null;
  isSentByMe?: boolean;
  images?: string[];
  music?: string | null;
  voices?: string[];
  deliverAt?: string;
  createdAt?: string;
}

interface DeskProps {
  initialLetters: Letter[];
}

export default function Desk({ initialLetters }: DeskProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Interactive Envelope States
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'envelope' | 'grid'>('envelope');
  const [flapZIndex, setFlapZIndex] = useState(30);
  const [previewEnvelopeAnyway, setPreviewEnvelopeAnyway] = useState(false);
  const isFirstRender = useRef(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Delay mounting slightly to allow browser to decode base64 textures and Next.js dev server to inject CSS
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (isEnvelopeOpen) {
      // Opening: flap stays at front (30) for 0.9s, then goes to back (12)
      const timer = setTimeout(() => {
        setFlapZIndex(12);
      }, 900);
      return () => clearTimeout(timer);
    } else {
      // Closing: instantly set to back (12) so it goes behind letters, then goes to front (30) after 0.6s
      setFlapZIndex(12);
      const timer = setTimeout(() => {
        setFlapZIndex(30);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isEnvelopeOpen]);

  const receivedCount = initialLetters.filter(l => !l.isSentByMe).length;
  const sentCount = initialLetters.filter(l => l.isSentByMe).length;

  const filteredLetters = initialLetters.filter(letter => 
    activeTab === 'sent' ? letter.isSentByMe : !letter.isSentByMe
  );

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    
    const midnightDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const midnightNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = Math.abs(midnightNow.getTime() - midnightDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffDays === 0 || midnightNow.getTime() === midnightDate.getTime()) {
      return timeStr;
    } else if (diffDays === 1) {
      return `Yesterday, ${timeStr}`;
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const cleanContent = (text: string) => {
    return text.replace(/^\[To: (.*?)\]\n+/, '').replace(/^\[Font: (.*?)\]\n+/, '');
  };

  const handleTabChange = (newTab: 'received' | 'sent') => {
    if (isEnvelopeOpen) {
      setIsEnvelopeOpen(false);
      setTimeout(() => {
        setActiveTab(newTab);
      }, 600);
    } else {
      setActiveTab(newTab);
    }
  };

  // Should we show the poetic antique empty desk?
  // When there are no letters for the current tab and the user hasn't explicitly chosen to preview envelope
  const shouldShowEmptyDesk = filteredLetters.length === 0 && !previewEnvelopeAnyway;

  return (
    <>
      <AnimatePresence>
        {!isMounted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-bg-primary"
            suppressHydrationWarning
          >
            <BirdLoader className="w-16 h-16 text-[#c2410c]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="w-full min-h-full bg-bg-primary p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start sm:justify-center"
        style={{ opacity: isMounted ? 1 : 0, transition: 'opacity 0.7s ease-in-out' }}
      >
        {/* Global SVG Texture Definition */}
        <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          <defs>
            <pattern id="texture" patternUnits="userSpaceOnUse" width="100" height="100">
              <image href={textureBase64} width="100" height="100" opacity="0.3" />
            </pattern>
          </defs>
        </svg>

        {/* CONDITION 1: EMPTY STATE -> Antique Wooden Desk with Extinguished Candle */}
        {shouldShowEmptyDesk ? (
          <AntiqueEmptyDesk
            activeTab={activeTab}
            onSwitchTab={handleTabChange}
            onPreviewEnvelope={() => {
              setPreviewEnvelopeAnyway(true);
              setIsEnvelopeOpen(true);
            }}
            receivedCount={receivedCount}
            sentCount={sentCount}
          />
        ) : (
          /* CONDITION 2: LETTERS PRESENT OR PREVIEW ENVELOPE REQUESTED */
          <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 my-auto">
            
            {/* Top Centered Tab Switcher Bar - Leaves top-right clean for TopBar */}
            <div className="relative z-30 flex items-center gap-2 sm:gap-3 p-1.5 rounded-full bg-[#181512]/90 border border-[#382f25]/80 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md mb-4 sm:mb-6">
              <button 
                onClick={() => handleTabChange('received')}
                className={`font-serif text-xs sm:text-sm tracking-wider px-4 sm:px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'received' 
                    ? 'bg-[#c2410c] text-[#fbf8f3] font-semibold shadow-md' 
                    : 'text-[#9c9182] hover:text-[#e8dfd1] hover:bg-[#25201a]'
                }`}
              >
                <span>Whispers Received</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'received' ? 'bg-black/30 text-white' : 'bg-[#2a241c] text-[#8e8477]'
                }`}>
                  {receivedCount}
                </span>
              </button>

              <button 
                onClick={() => handleTabChange('sent')}
                className={`font-serif text-xs sm:text-sm tracking-wider px-4 sm:px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'sent' 
                    ? 'bg-[#c2410c] text-[#fbf8f3] font-semibold shadow-md' 
                    : 'text-[#9c9182] hover:text-[#e8dfd1] hover:bg-[#25201a]'
                }`}
              >
                <span>Echoes Sent</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'sent' ? 'bg-black/30 text-white' : 'bg-[#2a241c] text-[#8e8477]'
                }`}>
                  {sentCount}
                </span>
              </button>

              {/* If previewing an empty mailbox, allow returning to Antique Desk */}
              {previewEnvelopeAnyway && filteredLetters.length === 0 && (
                <button
                  onClick={() => setPreviewEnvelopeAnyway(false)}
                  className="font-serif text-xs text-[#c5a059] hover:text-[#e8dfd1] px-3 py-1.5 rounded-full border border-[#8c734b]/40 hover:bg-[#8c734b]/20 transition-all flex items-center gap-1.5"
                  title="Return to Antique Desk"
                >
                  <Feather size={12} />
                  <span className="hidden sm:inline">Antique Desk</span>
                </button>
              )}
            </div>

            {/* MAIN DESK DISPLAY: ENVELOPE MODE VS GRID MODE */}
            {viewMode === 'envelope' ? (
              <div className="relative w-full flex flex-col items-center justify-center flex-1 px-2 sm:px-4 py-2">
                
                {/* Responsive 3D Envelope Box */}
                <motion.div 
                  animate={{
                    // On small screens, smoothly translate envelope down when open to give flap headroom
                    y: isEnvelopeOpen ? 36 : 0,
                    scale: isEnvelopeOpen ? 0.94 : 1
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-[290px] xs:max-w-[330px] sm:max-w-[390px] md:max-w-[440px] aspect-[5/3] cursor-pointer group z-20 mt-4 sm:mt-6 select-none"
                  style={{ 
                    boxShadow: '0 25px 60px -10px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.6)',
                    perspective: 1200
                  }}
                  onClick={() => {
                    if (!isEnvelopeOpen) setIsEnvelopeOpen(true);
                  }}
                >
                  {/* 1. Back of Envelope (z-10) */}
                  <div className="absolute inset-0 bg-[#0d0d0d] rounded-sm overflow-hidden z-10 border border-[#2a241c]">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${textureBase64})` }} />
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                     {/* Internal Text / Branding */}
                     {isEnvelopeOpen && (
                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 0.5 }}
                         className="absolute bottom-4 sm:bottom-6 w-full text-center text-[#665b4e] font-serif text-xs sm:text-sm tracking-widest z-10 uppercase"
                       >
                         A Private Space
                       </motion.div>
                     )}
                  </div>

                  {/* 2. Responsive Scrollable Card Drawer (z-15 - Inside the Envelope) */}
                  <div className="absolute inset-x-0 bottom-0 top-[-260px] sm:top-[-300px] md:top-[-340px] overflow-hidden pointer-events-none z-[15]">
                    <AnimatePresence>
                      {isEnvelopeOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 120 }}
                          animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.7 } }}
                          exit={{ opacity: 0, y: 300, transition: { duration: 0.6, ease: "easeInOut" } }}
                          className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[92vw] sm:max-w-sm h-[260px] sm:h-[300px] md:h-[340px] overflow-y-auto pointer-events-auto flex flex-col gap-3.5 pb-24 px-3 sm:px-4 items-center"
                          style={{
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                          }}
                        >
                          <div className="h-[90px] sm:h-[110px] shrink-0 pointer-events-none" /> {/* Spacer for top fade */}
                          
                          {filteredLetters.length === 0 && (
                            <div className="text-center my-auto text-text-secondary font-serif italic text-sm px-4 bg-[#181512]/90 backdrop-blur-md p-5 rounded-2xl border border-[#382f25]/70 shadow-2xl">
                              <p className="text-[#f5f0e6] font-medium text-base mb-1">
                                আপনার ডাকবাক্স শান্ত হয়ে অপেক্ষা করছে...
                              </p>
                              <p className="text-xs text-[#a89b88] leading-relaxed mb-4">
                                No letters in this mailbox yet. Dispatches will quietly arrive here.
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewEnvelopeAnyway(false);
                                }}
                                className="px-4 py-2 rounded-full bg-[#c2410c] text-white text-xs font-serif tracking-wider shadow hover:bg-[#ea580c] transition-colors"
                              >
                                অ্যান্টিক ডেস্কে ফিরুন
                              </button>
                            </div>
                          )}

                          {filteredLetters.map((letter) => {
                            const rawCoverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
                            const coverImage = rawCoverImage?.includes('res.cloudinary.com') ? rawCoverImage.replace('/upload/', '/upload/q_auto,f_auto,w_800/') : rawCoverImage;

                            return (
                              <div
                                key={letter.id}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  router.push(`/letter/${letter.id}`);
                                }}
                                className="w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[340px] shrink-0 h-[175px] sm:h-[195px] rounded-2xl overflow-hidden border border-[#42372a]/70 cursor-pointer group hover:scale-[1.02] transition-transform duration-300 relative shadow-[0_12px_32px_rgba(0,0,0,0.85)]"
                                style={{ 
                                  backgroundColor: '#1c1815',
                                  backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-r ${coverImage ? 'from-black/95 via-black/65 to-black/35' : 'from-[#14110e] to-[#1f1a15]'}`} />
                                
                                <div className="relative z-10 h-full p-4 sm:p-5 flex flex-col justify-between">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase tracking-widest text-[#d8cfbf] font-bold bg-[#120f0d]/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-[#382d20]">
                                      {letter.isSentByMe ? `To ${letter.receiver?.name || 'Someone'}` : `From ${letter.sender.name}`}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#a89e90] bg-[#120f0d]/80 px-2 py-0.5 rounded backdrop-blur-md">
                                      {formatTime(letter.deliverAt)}
                                    </span>
                                  </div>

                                  <div className="my-auto py-1">
                                    <p className="font-serif text-[#f6f2ea] text-base sm:text-lg leading-snug line-clamp-2 drop-shadow-md">
                                      "{cleanContent(letter.content)}"
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2.5 bg-[#120f0d]/80 backdrop-blur-md p-1.5 px-3 rounded-lg border border-[#382d20] w-fit mt-auto">
                                    {letter.images && letter.images.length > 0 && <ImageIcon size={13} className="text-[#c5a059]" />}
                                    {letter.music && <Music size={13} className="text-[#c5a059]" />}
                                    {letter.voices && letter.voices.length > 0 && <Mic size={13} className="text-[#c5a059]" />}
                                    {!letter.images?.length && !letter.music && !letter.voices?.length && (
                                      <span className="text-[10px] text-[#9c907e] italic">Letter</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 3. Envelope Flap (Top, z-30 -> z-12) */}
                  <motion.div 
                    initial={{ rotateX: 0 }}
                    animate={{ 
                      rotateX: isEnvelopeOpen ? 180 : 0
                    }}
                    transition={{ 
                      rotateX: { duration: 1.1, ease: [0.25, 1, 0.5, 1], delay: isEnvelopeOpen ? 0 : 0.7 }
                    }}
                    style={{ transformOrigin: 'top', zIndex: flapZIndex, backfaceVisibility: 'visible' }}
                    className="absolute top-0 left-0 right-0 aspect-[25/11] h-auto origin-top drop-shadow-2xl pointer-events-none"
                  >
                    <svg viewBox="0 0 500 220" preserveAspectRatio="none" className="w-full h-full filter" style={{ filter: 'drop-shadow(0 10px 12px rgba(0,0,0,0.6))' }}>
                      <path d="M0,0 L250,220 L500,0 Z" fill="#151515" />
                      <path d="M0,0 L250,220 L500,0 Z" fill="url(#texture)" />
                      <path d="M0,0 L250,220 L500,0 Z" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
                    </svg>
                  </motion.div>

                  {/* 4. Envelope Front Left Wing (z-20) */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))' }}>
                    <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,0 L250,160 L0,300 Z" fill="#111" />
                      <path d="M0,0 L250,160 L0,300 Z" fill="url(#texture)" />
                      <path d="M0,0 L250,160 L0,300 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* 5. Envelope Front Right Wing (z-20) */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))' }}>
                    <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M500,0 L250,160 L500,300 Z" fill="#111" />
                      <path d="M500,0 L250,160 L500,300 Z" fill="url(#texture)" />
                      <path d="M500,0 L250,160 L500,300 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* 6. Envelope Front Bottom (z-20) */}
                  <div className="absolute inset-0 z-20 pointer-events-none" style={{ filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.6))' }}>
                    <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,300 L250,160 L500,300 Z" fill="#0a0a0a" />
                      <path d="M0,300 L250,160 L500,300 Z" fill="url(#texture)" />
                      <path d="M0,300 L250,160 L500,300 Z" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Wax Seal Center Button When Envelope is Closed */}
                  {!isEnvelopeOpen && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute z-40 top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8c2214] border-2 border-[#b83321] flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(194,65,12,0.5)] transition-all duration-300">
                        {/* Golden Monogram / Letter Seal */}
                        <Mail className="w-6 h-6 text-[#fae1b8] drop-shadow-sm group-hover:rotate-6 transition-transform" />
                      </div>
                      <span className="text-[10px] font-serif uppercase tracking-widest text-[#a89b88] mt-2 font-medium bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/5">
                        Touch to Open
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Floating Responsive Toolbar Underneath Envelope */}
                <div className="flex items-center gap-3 mt-6 sm:mt-8 z-30">
                  {/* Grid View Mode Toggle */}
                  <button 
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2 text-[#a89b88] hover:text-[#f5f0e6] transition-all bg-[#1a1612]/90 hover:bg-[#25201a] px-4 py-2 rounded-full border border-[#3d3326] shadow-md text-xs font-serif uppercase tracking-wider"
                  >
                    <Grid size={14} className="text-[#c2410c]" />
                    <span>Grid View</span>
                  </button>

                  {/* Close Envelope Toggle (if opened) */}
                  {isEnvelopeOpen && (
                    <button 
                      onClick={() => setIsEnvelopeOpen(false)}
                      className="flex items-center gap-1.5 text-[#a89b88] hover:text-[#f5f0e6] transition-all bg-[#1a1612]/90 hover:bg-[#25201a] px-3.5 py-2 rounded-full border border-[#3d3326] shadow-md text-xs font-serif uppercase tracking-wider"
                    >
                      <X size={14} />
                      <span>Close</span>
                    </button>
                  )}

                  {/* Back to Antique Desk (if previewing empty) */}
                  {filteredLetters.length === 0 && previewEnvelopeAnyway && (
                    <button 
                      onClick={() => setPreviewEnvelopeAnyway(false)}
                      className="flex items-center gap-1.5 text-[#c5a059] hover:text-[#fae1b8] transition-all bg-[#1a1612]/90 hover:bg-[#25201a] px-3.5 py-2 rounded-full border border-[#8c734b]/40 shadow-md text-xs font-serif tracking-wider"
                    >
                      <Feather size={13} />
                      <span>অ্যান্টিক ডেস্ক</span>
                    </button>
                  )}
                </div>

                {/* Scroll Indicator Prompt when envelope has multiple letters */}
                {isEnvelopeOpen && filteredLetters.length > 1 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-4 text-[#8a7d6e] text-xs font-mono flex items-center gap-2 animate-pulse"
                  >
                    <span>↑ Scroll to browse envelopes ↓</span>
                  </motion.div>
                )}
              </div>
            ) : (
              /* GRID VIEW MODE */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-5xl mt-4 sm:mt-6 pb-20"
              >
                <div className="flex justify-between items-center mb-6 px-2">
                  <button 
                    onClick={() => setViewMode('envelope')}
                    className="flex items-center gap-2 text-[#a89b88] hover:text-[#f5f0e6] transition-colors bg-[#181512] px-4 py-2 rounded-full border border-[#382f25] text-xs uppercase tracking-widest font-bold"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Envelope</span>
                  </button>

                  <span className="text-xs font-serif text-[#8a7d6e]">
                    {filteredLetters.length} {filteredLetters.length === 1 ? 'Dispatch' : 'Dispatches'}
                  </span>
                </div>
                
                {filteredLetters.length === 0 ? (
                  <div className="text-center py-16 bg-[#161310]/80 rounded-2xl border border-[#382f25]/60 p-8">
                    <p className="font-serif text-xl text-[#f4efe6] mb-2">আপনার ডাকবাক্স শান্ত হয়ে অপেক্ষা করছে...</p>
                    <p className="text-sm text-[#9c9182] font-serif italic mb-6">No letters found in this mailbox tab.</p>
                    <button
                      onClick={() => router.push('/write')}
                      className="px-6 py-2.5 rounded-full bg-[#c2410c] text-white font-serif text-xs uppercase tracking-wider"
                    >
                      Write First Letter
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                    {filteredLetters.map((letter) => {
                       const rawCoverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
                       const coverImage = rawCoverImage?.includes('res.cloudinary.com') ? rawCoverImage.replace('/upload/', '/upload/q_auto,f_auto,w_800/') : rawCoverImage;
                       return (
                        <div
                          key={letter.id}
                          onClick={() => router.push(`/letter/${letter.id}`)}
                          className="w-full h-48 rounded-2xl overflow-hidden shadow-lg border border-[#382f25] relative cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                          style={{ 
                            backgroundColor: '#1a1612',
                            backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${coverImage ? 'from-black/95 via-black/70 to-black/40' : 'from-[#14110e] to-[#1f1a15]'}`} />
                          <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] tracking-wider text-[#d8cfbf] uppercase font-bold bg-black/60 px-2 py-0.5 rounded">
                                {letter.isSentByMe ? `To ${letter.receiver?.name || 'Someone'}` : `From ${letter.sender.name}`}
                              </span>
                              <span className="text-[10px] text-[#a89b88] font-mono bg-black/60 px-2 py-0.5 rounded">
                                {formatTime(letter.deliverAt)}
                              </span>
                            </div>

                            <h3 className="font-serif text-lg font-bold text-[#f5f0e6] mb-1 group-hover:text-[#c2410c] transition-colors line-clamp-2">
                              "{cleanContent(letter.content).substring(0, 60)}..."
                            </h3>

                            <div className="border-t border-white/10 pt-3 mt-auto flex justify-between items-center text-[10px] text-[#a89b88]">
                              <div className="flex gap-2 bg-black/40 p-1 rounded border border-white/5">
                                {letter.images && letter.images.length > 0 && <ImageIcon size={12} />}
                                {letter.music && <Music size={12} />}
                                {letter.voices && letter.voices.length > 0 && <Mic size={12} />}
                              </div>
                              <span className="uppercase tracking-widest font-bold text-[#c2410c] group-hover:underline">Read Letter</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        )}

      </div>
    </>
  );
}
