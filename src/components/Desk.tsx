'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Image as ImageIcon, Music, Mic, Grid, PackageOpen, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (isEnvelopeOpen) {
      // Opening: flap stays at front (30) for 1.0s, then goes to back (12)
      const timer = setTimeout(() => {
        setFlapZIndex(12);
      }, 1000);
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

  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Global SVG Texture Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <pattern id="texture" patternUnits="userSpaceOnUse" width="100" height="100">
            <image href="https://www.transparenttextures.com/patterns/black-paper.png" width="100" height="100" opacity="0.3" />
          </pattern>
        </defs>
      </svg>
      
      {/* Page Header - Minimalist */}
      <div className="absolute top-8 right-8 z-50">
        <div className="flex flex-col items-end space-y-4 px-6 py-3">
          <button 
            onClick={() => { 
              if (isEnvelopeOpen) {
                setIsEnvelopeOpen(false);
                setViewMode('envelope');
                setTimeout(() => setActiveTab('received'), 1000);
              } else {
                setActiveTab('received');
                setViewMode('envelope');
              }
            }}
            className={`font-serif text-sm uppercase tracking-widest transition-all px-6 py-3 rounded-full border shadow-lg ${activeTab === 'received' ? 'text-[#c2410c] font-bold bg-[#1a1a1a] border-[#333]' : 'text-[#a0a0a0] hover:text-[#f9f8f6] border-transparent'}`}
          >
            Whispers Received
          </button>
          <button 
            onClick={() => { 
              if (isEnvelopeOpen) {
                setIsEnvelopeOpen(false);
                setViewMode('envelope');
                setTimeout(() => setActiveTab('sent'), 1000);
              } else {
                setActiveTab('sent');
                setViewMode('envelope');
              }
            }}
            className={`font-serif text-sm uppercase tracking-widest transition-all px-6 py-3 rounded-full border shadow-lg ${activeTab === 'sent' ? 'text-[#c2410c] font-bold bg-[#1a1a1a] border-[#333]' : 'text-[#a0a0a0] hover:text-[#f9f8f6] border-transparent'}`}
          >
            Echoes Sent
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-0">
        
        {viewMode === 'envelope' ? (
          <div className="relative w-full max-w-3xl flex flex-col items-center justify-center min-h-[600px]">
            
            {/* The Envelope Box */}
            <div 
              className="relative w-[500px] h-[300px] cursor-pointer group z-20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] mt-32"
              onClick={() => setIsEnvelopeOpen(true)}
            >
              {/* 1. Back of Envelope (z-10) */}
              <div className="absolute inset-0 bg-[#0d0d0d] rounded-sm overflow-hidden z-10 border border-[#222]">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]" />
                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
                 {/* Internal Text / Branding */}
                 {isEnvelopeOpen && (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.5 }}
                     className="absolute bottom-6 w-full text-center text-[#555] font-serif text-sm tracking-widest z-10"
                   >
                     A PRIVATE SPACE
                   </motion.div>
                 )}
              </div>

              {/* 2. The Scrollable Card Container (z-15 - Inside the Envelope) */}
              <div className="absolute inset-x-0 bottom-0 top-[-600px] overflow-hidden pointer-events-none z-[15]">
                <AnimatePresence>
                  {isEnvelopeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 150 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: "easeInOut", delay: 0.8 } }}
                      exit={{ opacity: 0, y: 400, transition: { duration: 0.8, ease: "easeInOut", delay: 0 } }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm h-[800px] overflow-y-auto pointer-events-auto flex flex-col gap-4 pb-32 px-4 items-center"
                      style={{
                        maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="h-[280px] shrink-0" /> {/* Spacer for top fading */}
                      {filteredLetters.length === 0 && (
                        <div className="text-center mt-20 text-[#a0a0a0] font-serif italic">
                          No letters found in this mailbox.
                        </div>
                      )}
                      {filteredLetters.map((letter) => {
                        const coverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;

                        return (
                          <div
                            key={letter.id}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              router.push(`/letter/${letter.id}`);
                            }}
                            className="w-full max-w-[340px] shrink-0 h-[200px] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-white/20 cursor-pointer group hover:scale-[1.02] transition-transform duration-300 relative"
                            style={{ 
                              backgroundColor: '#222',
                              backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${coverImage ? 'from-black/95 via-black/60 to-black/30' : 'from-[#111] to-[#222]'}`} />
                            
                            <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] uppercase tracking-widest text-[#a0a0a0] font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                                  From {letter.sender.name}
                                </span>
                                <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded backdrop-blur-md">
                                  {formatTime(letter.deliverAt)}
                                </span>
                              </div>

                              <div className="my-auto">
                                <p className="font-serif text-white text-lg leading-snug line-clamp-2 drop-shadow-lg">
                                  "{cleanContent(letter.content)}"
                                </p>
                              </div>

                              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 px-3 rounded-lg border border-white/10 w-fit mt-auto">
                                {letter.images && letter.images.length > 0 && <ImageIcon size={14} className="text-white/70" />}
                                {letter.music && <Music size={14} className="text-white/70" />}
                                {letter.voices && letter.voices.length > 0 && <Mic size={14} className="text-white/70" />}
                                {!letter.images?.length && !letter.music && !letter.voices?.length && (
                                  <span className="text-[10px] text-white/50 italic">Text</span>
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

              {/* 3. Envelope Flap (Top, z-30 -> z-5) */}
              <motion.div 
                initial={{ rotateX: 0 }}
                animate={{ 
                  rotateX: isEnvelopeOpen ? 180 : 0
                }}
                transition={{ 
                  rotateX: { duration: 1.2, ease: "easeInOut", delay: isEnvelopeOpen ? 0 : 0.8 }
                }}
                style={{ transformOrigin: 'top', zIndex: flapZIndex }}
                className="absolute top-0 left-0 right-0 h-[220px] origin-top drop-shadow-2xl"
              >
                {/* SVG Flap mirroring the reference image */}
                <svg viewBox="0 0 500 220" preserveAspectRatio="none" className="w-full h-full filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                  <path d="M0,0 L250,220 L500,0 Z" fill="#151515" />
                  <path d="M0,0 L250,220 L500,0 Z" fill="url(#texture)" />
                  {/* Flap Edge Highlight */}
                  <path d="M0,0 L250,220 L500,0 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                </svg>
              </motion.div>

              {/* 4. Envelope Front Left Wing (z-20) */}
              <div className="absolute inset-0 z-20 pointer-events-none drop-shadow-xl">
                <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,0 L250,160 L0,300 Z" fill="#111" />
                  <path d="M0,0 L250,160 L0,300 Z" fill="url(#texture)" />
                  <path d="M0,0 L250,160 L0,300 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </svg>
              </div>

              {/* 5. Envelope Front Right Wing (z-20) */}
              <div className="absolute inset-0 z-20 pointer-events-none drop-shadow-xl">
                <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M500,0 L250,160 L500,300 Z" fill="#111" />
                  <path d="M500,0 L250,160 L500,300 Z" fill="url(#texture)" />
                  <path d="M500,0 L250,160 L500,300 Z" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </svg>
              </div>

              {/* 6. Envelope Front Bottom (z-20) */}
              <div className="absolute inset-0 z-20 pointer-events-none drop-shadow-2xl">
                <svg viewBox="0 0 500 300" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,300 L250,160 L500,300 Z" fill="#0a0a0a" />
                  <path d="M0,300 L250,160 L500,300 Z" fill="url(#texture)" />
                  <path d="M0,300 L250,160 L500,300 Z" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                </svg>
              </div>

              {/* Open Icon */}
              {!isEnvelopeOpen && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  className="absolute z-40 top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform hover:bg-[#c2410c] hover:border-transparent">
                    <PackageOpen className="text-white/80" />
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Scroll Indicator */}
            {isEnvelopeOpen && filteredLetters.length > 1 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-12 text-[#555] text-xs font-mono flex flex-col items-center gap-2 animate-pulse absolute -right-32 top-1/2"
              >
                <div className="w-px h-12 bg-gradient-to-t from-[#555] to-transparent mb-2" />
                <span className="[writing-mode:vertical-rl]">Scroll Cards</span>
              </motion.div>
            )}

            {/* See More Button */}
            {isEnvelopeOpen && (
              <button 
                onClick={() => setViewMode('grid')}
                className="absolute -left-32 top-1/2 flex items-center gap-2 text-[#555] hover:text-[#f9f8f6] transition-colors bg-[#111] px-4 py-2 rounded-full border border-[#222]"
              >
                <Grid size={14} />
                <span className="text-xs uppercase tracking-widest font-bold">Grid</span>
              </button>
            )}
          </div>
        ) : (
          /* Grid View Mode */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mt-10"
          >
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setViewMode('envelope')}
                className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#f9f8f6] transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="text-xs uppercase tracking-widest font-bold">Back to Envelope</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-20">
              {filteredLetters.map((letter) => {
                 const coverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
                 return (
                  <div
                    key={letter.id}
                    onClick={() => router.push(`/letter/${letter.id}`)}
                    className="w-full h-48 rounded-xl overflow-hidden shadow-lg border border-[#333] relative cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                    style={{ 
                      backgroundColor: '#1a1a1a',
                      backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${coverImage ? 'from-black/95 via-black/70 to-black/40' : 'from-[#111] to-[#222]'}`} />
                    <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] tracking-wider text-[#a0a0a0] uppercase font-bold">From {letter.sender.name}</span>
                        <span className="text-[10px] text-white/70 font-mono bg-black/40 px-2 py-1 rounded">{formatTime(letter.deliverAt)}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#f9f8f6] mb-1 group-hover:text-[#c2410c] transition-colors line-clamp-2">
                        "{cleanContent(letter.content).substring(0, 60)}..."
                      </h3>

                      <div className="border-t border-white/10 pt-3 mt-auto flex justify-between items-center text-[10px] text-[#a0a0a0]">
                        <div className="flex gap-2 bg-black/40 p-1.5 rounded border border-white/5">
                          {letter.images && letter.images.length > 0 && <ImageIcon size={12} />}
                          {letter.music && <Music size={12} />}
                          {letter.voices && letter.voices.length > 0 && <Mic size={12} />}
                        </div>
                        <span className="uppercase tracking-widest font-bold text-[#c2410c]">Read</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
