'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const filteredLetters = initialLetters.filter(letter => 
    activeTab === 'sent' ? letter.isSentByMe : !letter.isSentByMe
  );

  // Wheel handling for scrolling letters up/down inside the envelope view with debounce
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'envelope' || !isEnvelopeOpen || isScrolling) return;
    
    setIsScrolling(true);
    
    if (e.deltaY > 50) {
      if (currentIndex + 2 < filteredLetters.length) {
        setCurrentIndex(prev => prev + 2);
      }
    } else if (e.deltaY < -50) {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 2);
      }
    }

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1200); // Wait 1.2s before allowing next scroll so animation can finish smoothly
  };

  const visibleLetters = filteredLetters.slice(currentIndex, currentIndex + 2);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    
    // Set both dates to midnight to compare just the calendar days
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

  return (
    <div 
      className="w-full min-h-full bg-[#111111] p-8 lg:p-12 relative overflow-hidden flex flex-col"
      onWheel={handleWheel}
    >
      {/* Page Header */}
      <div className="mb-10 max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between border-b border-[#333333] pb-6 w-full z-10 relative">
        <div>
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Dashboard</span>
          <h2 className="font-serif text-4xl font-bold text-[#f9f8f6] mt-1">My Mailbox</h2>
        </div>

        <div className="flex items-center space-x-6 mt-8 md:mt-0">
          <button 
            onClick={() => { setActiveTab('received'); setCurrentIndex(0); setIsEnvelopeOpen(false); setViewMode('envelope'); }}
            className={`font-serif text-lg transition-all ${activeTab === 'received' ? 'text-[#c2410c] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            Whispers Received
          </button>
          <button 
            onClick={() => { setActiveTab('sent'); setCurrentIndex(0); setIsEnvelopeOpen(false); setViewMode('envelope'); }}
            className={`font-serif text-lg transition-all ${activeTab === 'sent' ? 'text-[#c2410c] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            Echoes Sent
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center w-full relative z-0">
        
        {viewMode === 'envelope' ? (
          <div className="relative w-full max-w-3xl flex flex-col items-center mt-10">
            
            {/* The Envelope Box */}
            <div 
              className="relative w-full max-w-lg aspect-[3/2] cursor-pointer group perspective-1000"
              onClick={() => setIsEnvelopeOpen(true)}
            >
              {/* Envelope Back/Inside */}
              <div className="absolute inset-0 bg-[#1a1a1a] border-2 border-[#333] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-10 mix-blend-overlay"></div>
              </div>

              {/* Envelope Flap (Top) */}
              <motion.div 
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isEnvelopeOpen ? 180 : 0, zIndex: isEnvelopeOpen ? 5 : 30 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ transformOrigin: 'top' }}
                className="absolute top-0 left-0 right-0 h-1/2 origin-top"
              >
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full drop-shadow-md">
                  <path d="M0,0 L50,50 L100,0 Z" fill="#222" stroke="#333" strokeWidth="1" />
                </svg>
              </motion.div>

              {/* Envelope Body (Bottom/Front) */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <path d="M0,100 L50,50 L100,100 Z" fill="#222" stroke="#333" strokeWidth="1" />
                  <path d="M0,0 L0,100 L50,50 Z" fill="#1c1c1c" stroke="#333" strokeWidth="1" />
                  <path d="M100,0 L100,100 L50,50 Z" fill="#1c1c1c" stroke="#333" strokeWidth="1" />
                </svg>
              </div>

              {/* Open Icon */}
              {!isEnvelopeOpen && (
                <motion.div 
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  className="absolute z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-16 h-16 rounded-full bg-[#c2410c] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <PackageOpen className="text-[#f9f8f6]" />
                  </div>
                </motion.div>
              )}

              {/* The Ejecting Cards */}
              <AnimatePresence>
                {isEnvelopeOpen && visibleLetters.map((letter, idx) => {
                  const isLeft = idx % 2 === 0;
                  const coverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;

                  return (
                    <motion.div
                      key={letter.id}
                      initial={{ y: 50, opacity: 0, scale: 0.8, rotateZ: 0 }}
                      animate={{ 
                        y: -220 + (idx * 20), 
                        opacity: 1, 
                        scale: 1, 
                        rotateZ: isLeft ? -4 : 6,
                        x: isLeft ? -60 : 60
                      }}
                      exit={{ y: -600, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1.2, delay: 0.4 + (idx * 0.2), type: "spring", bounce: 0.2 }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        router.push(`/letter/${letter.id}`);
                      }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[220px] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-15 cursor-pointer group/card hover:z-50"
                      style={{ 
                        backgroundColor: '#1a1a1a',
                        backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 15 + idx // Between envelope back (10) and front (20)
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${coverImage ? 'from-black/95 via-black/60 to-black/30' : 'from-[#111] to-[#222]'}`} />
                      
                      <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase tracking-widest text-[#a0a0a0] font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            From {letter.sender.name}
                          </span>
                          <span className="text-[10px] font-mono text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            {formatTime(letter.deliverAt)}
                          </span>
                        </div>

                        <div className="my-auto max-w-[80%]">
                          <p className="font-serif text-white text-lg leading-snug line-clamp-3 drop-shadow-md">
                            "{letter.content.substring(0, 80)}{letter.content.length > 80 ? '...' : ''}"
                          </p>
                        </div>

                        {/* Bottom Icons Overlay */}
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 px-3 rounded-lg border border-white/10 w-fit">
                          {letter.images && letter.images.length > 0 && <ImageIcon size={14} className="text-white/70" />}
                          {letter.music && <Music size={14} className="text-white/70" />}
                          {letter.voices && letter.voices.length > 0 && <Mic size={14} className="text-white/70" />}
                          {!letter.images?.length && !letter.music && !letter.voices?.length && (
                            <span className="text-[10px] text-white/50 italic">Text</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Scroll Indicator */}
            {isEnvelopeOpen && filteredLetters.length > 2 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-12 text-[#a0a0a0] text-xs font-mono flex flex-col items-center gap-2 animate-pulse"
              >
                <span>Scroll down to see more</span>
                <div className="w-px h-6 bg-gradient-to-b from-[#a0a0a0] to-transparent" />
              </motion.div>
            )}

            {/* See More Button */}
            {isEnvelopeOpen && (
              <button 
                onClick={() => setViewMode('grid')}
                className="mt-8 flex items-center gap-2 text-[#a0a0a0] hover:text-[#f9f8f6] transition-colors bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#333]"
              >
                <Grid size={14} />
                <span className="text-xs uppercase tracking-widest font-bold">See All Letters</span>
              </button>
            )}
          </div>
        ) : (
          /* Grid View Mode */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pb-20">
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
                        "{letter.content.substring(0, 60)}..."
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
