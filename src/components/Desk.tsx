'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { X, Mail, Image as ImageIcon, Music, Mic, Grid, PackageOpen, ArrowLeft } from 'lucide-react';
import LetterViewer from './LetterViewer'; 

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
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Interactive Envelope States
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'envelope' | 'grid'>('envelope');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredLetters = initialLetters.filter(letter => 
    activeTab === 'sent' ? letter.isSentByMe : !letter.isSentByMe
  );

  // Wheel handling for scrolling letters up/down inside the envelope view
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode !== 'envelope' || !isEnvelopeOpen) return;
    
    if (e.deltaY > 50) {
      // Scroll down (next letters)
      if (currentIndex + 2 < filteredLetters.length) {
        setCurrentIndex(prev => prev + 2);
      }
    } else if (e.deltaY < -50) {
      // Scroll up (previous letters)
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 2);
      }
    }
  };

  const visibleLetters = filteredLetters.slice(currentIndex, currentIndex + 2);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
          <p className="text-sm text-[#a0a0a0] mt-2">
            A collection of letters and private thoughts shared between you.
          </p>
        </div>

        <div className="flex items-center space-x-6 mt-8 md:mt-0">
          <button 
            onClick={() => { setActiveTab('received'); setCurrentIndex(0); setIsEnvelopeOpen(false); setViewMode('envelope'); }}
            className={`font-serif text-lg transition-all ${activeTab === 'received' ? 'text-[#f9f8f6] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            Whispers Received
          </button>
          <button 
            onClick={() => { setActiveTab('sent'); setCurrentIndex(0); setIsEnvelopeOpen(false); setViewMode('envelope'); }}
            className={`font-serif text-lg transition-all ${activeTab === 'sent' ? 'text-[#f9f8f6] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
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
              {/* Envelope Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#222] to-[#1a1a1a] border-2 border-[#333] rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center overflow-hidden">
                {!isEnvelopeOpen && (
                  <motion.div 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    className="absolute z-30"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#c2410c] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <PackageOpen className="text-[#f9f8f6]" />
                    </div>
                  </motion.div>
                )}
                
                {/* Flap Animation */}
                <motion.div 
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: isEnvelopeOpen ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ transformOrigin: 'top' }}
                  className="absolute top-0 left-0 right-0 h-1/2 bg-[#2a2a2a] border-b border-[#444] rounded-t-md z-30 shadow-md origin-top"
                />
              </div>

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
                        y: -180 + (idx * 20), 
                        opacity: 1, 
                        scale: 1, 
                        rotateZ: isLeft ? -8 : 8,
                        x: isLeft ? -100 : 100
                      }}
                      exit={{ y: -400, opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6, delay: 0.3 + (idx * 0.1), type: "spring", bounce: 0.3 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedLetter(letter); }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-[280px] h-[350px] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-10 cursor-pointer group/card hover:z-50"
                      style={{ 
                        backgroundColor: '#1a1a1a',
                        backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-t ${coverImage ? 'from-black/90 via-black/40 to-black/20' : 'from-[#111] to-[#222]'}`} />
                      
                      <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase tracking-widest text-[#a0a0a0] font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            From {letter.sender.name}
                          </span>
                          <span className="text-[10px] font-mono text-white/60 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                            {formatTime(letter.deliverAt)}
                          </span>
                        </div>

                        <div className="my-auto">
                          <p className="font-serif text-white text-lg leading-snug line-clamp-4 text-center drop-shadow-md">
                            "{letter.content.substring(0, 100)}{letter.content.length > 100 ? '...' : ''}"
                          </p>
                        </div>

                        {/* Bottom Icons Overlay */}
                        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 mt-auto">
                          {letter.images && letter.images.length > 0 && <ImageIcon size={14} className="text-white/70" />}
                          {letter.music && <Music size={14} className="text-white/70" />}
                          {letter.voices && letter.voices.length > 0 && <Mic size={14} className="text-white/70" />}
                          {!letter.images?.length && !letter.music && !letter.voices?.length && (
                            <span className="text-[10px] text-white/50 italic">Text only</span>
                          )}
                          <span className="ml-auto text-[10px] text-white/80 font-bold group-hover/card:text-[#c2410c] transition-colors">Open</span>
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
                transition={{ delay: 1 }}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-20">
              {filteredLetters.map((letter) => (
                <div
                  key={letter.id}
                  onClick={() => setSelectedLetter(letter)}
                  className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 flex flex-col justify-between h-64 cursor-pointer card-shadow card-hover-shadow relative group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] tracking-wider text-[#a0a0a0] uppercase font-medium">From {letter.sender.name}</span>
                      <span className="text-[10px] text-[#a0a0a0] font-mono">{formatTime(letter.deliverAt)}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#f9f8f6] mb-1 group-hover:text-[#c2410c] transition-colors">
                      To {letter.receiver?.name || "My Love"}
                    </h3>
                    
                    <p className="text-xs text-[#a0a0a0]/90 leading-relaxed mt-4 line-clamp-3 font-sans break-words">
                      {letter.content}
                    </p>
                  </div>

                  <div className="border-t border-[#333333] pt-3 mt-4 flex justify-between items-center text-[10px] text-[#a0a0a0]/60">
                    <div className="flex gap-2">
                      {letter.images && letter.images.length > 0 && <ImageIcon size={12} />}
                      {letter.music && <Music size={12} />}
                      {letter.voices && letter.voices.length > 0 && <Mic size={12} />}
                    </div>
                    <span>Click to read</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Unified Letter Viewer Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <LetterViewer 
            letter={selectedLetter} 
            onClose={() => setSelectedLetter(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
