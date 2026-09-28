'use client';

import React, { useState, useRef, useMemo, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { 
  X, 
  Send, 
  Mail, 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  Mic, 
  Sparkles, 
  Feather,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  RotateCcw
} from 'lucide-react';

interface LetterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  isSubmitting: boolean;
  content: string;
  receiver: string;
  delay: string;
  coverTitle: string;
  coverSubtitle: string;
  uploadedImages: string[];
  uploadedMusic: string | null;
  musicTitle: string;
  musicCover: string | null;
  recordedVoices: { id: string; url: string; title?: string }[];
  embeddedMemories?: Record<number, any>;
  senderName?: string;
}

// React 19 forwardRef wrapper required by react-pageflip to attach DOM nodes reliably
const BookPage = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; density?: 'hard' | 'soft' }>(
  ({ children, className = '', density = 'soft' }, ref) => {
    return (
      <div 
        ref={ref} 
        data-density={density} 
        className={`h-full w-full select-none overflow-hidden ${className}`}
      >
        {children}
      </div>
    );
  }
);
BookPage.displayName = 'BookPage';

const getPaginatedContent = (text: string, charsPerPage: number = 360) => {
  const paragraphs = text.split('\n');
  const pages: string[] = [];
  let currentPage = '';

  paragraphs.forEach((p) => {
    const currentLimit = pages.length === 0 ? charsPerPage - 90 : charsPerPage;
    if (currentPage.length + p.length > currentLimit && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = '';
    }
    currentPage += p + '\n';
  });
  
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }
  
  return pages.length > 0 ? pages : ['(Your manuscript page awaits your ink...)'];
};

export default function LetterPreviewModal({
  isOpen,
  onClose,
  onSend,
  isSubmitting,
  content,
  receiver,
  delay,
  coverTitle,
  coverSubtitle,
  uploadedImages,
  uploadedMusic,
  musicTitle,
  musicCover,
  recordedVoices,
  senderName = 'Scribe'
}: LetterPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'notebook' | 'envelope'>('notebook');
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const bookRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // When opening, ensure it starts cleanly at the cover
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      if (bookRef.current?.pageFlip()) {
        try {
          bookRef.current.pageFlip().flip(0);
        } catch (e) {
          // ignore initial flip error
        }
      }
    }
  }, [isOpen]);

  // Clean raw content of internal tags for preview
  const cleanDisplayContent = (text: string) => {
    return text.replace(/\u200C(\u200B+)(.*?)\u200D/g, '$2').replace(/\u200C|\u200D|\u200B/g, '');
  };

  const displayContent = useMemo(() => {
    const cleaned = cleanDisplayContent(content);
    return cleaned.trim() || 'No letter written yet. Express your heart on the desk...';
  }, [content]);

  const pages = useMemo(() => getPaginatedContent(displayContent), [displayContent]);

  // FlipBook page calculations
  const totalFlipPages = 2 + pages.length + (pages.length % 2 !== 0 ? 1 : 0) + 2; 
  const isFrontCover = currentPage === 0;
  const isBackCover = currentPage >= totalFlipPages - 2;

  // Gentle, bounded centering that will NEVER trigger horizontal overflow
  let transformStyle = 'translateX(0)';
  if (isFrontCover) {
    transformStyle = 'translateX(-18%)';
  } else if (isBackCover) {
    transformStyle = 'translateX(18%)';
  }

  const turnPage = (direction: 'next' | 'prev') => {
    if (direction === 'next' && bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    } else if (direction === 'prev' && bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const resetToCover = () => {
    if (bookRef.current?.pageFlip()) {
      bookRef.current.pageFlip().flip(0);
      setCurrentPage(0);
    }
  };

  const onFlip = (e: any) => {
    if (typeof e?.data === 'number') {
      setCurrentPage(e.data);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden no-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#14110e] border border-[#3d3224] rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col my-auto max-h-[96vh] no-scrollbar"
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2b231a] bg-[#1a1511]/95 z-20 shrink-0">
            <div className="flex items-center gap-2">
              <BookMarked size={16} className="text-[#c2410c]" />
              <div>
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#f5f0e6] tracking-wide">
                  Realistic Notebook Preview • চিঠির ফাইনাল লুক
                </h3>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center p-0.5 rounded-full bg-[#0f0d0b] border border-[#2e251b]">
              <button
                type="button"
                onClick={() => setActiveTab('notebook')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  activeTab === 'notebook'
                    ? 'bg-[#c2410c] text-white font-bold shadow'
                    : 'text-[#9c907e] hover:text-[#f5f0e6]'
                }`}
              >
                <BookOpen size={12} />
                <span>Notebook</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('envelope')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif transition-all cursor-pointer ${
                  activeTab === 'envelope'
                    ? 'bg-[#c2410c] text-white font-bold shadow'
                    : 'text-[#9c907e] hover:text-[#f5f0e6]'
                }`}
              >
                <Mail size={12} />
                <span>Envelope</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[#9e907d] hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              title="Close preview"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body - Completely Clean, NO Scrollbars */}
          <div className="p-3 sm:p-5 md:p-6 flex-1 flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto no-scrollbar scrollbar-none">
            {activeTab === 'notebook' ? (
              /* TAB 1: THE SIGNATURE REALISTIC NOTEBOOK WITH PAGE FLIP PHYSICS */
              <div className="w-full flex flex-col items-center justify-center overflow-hidden">
                {/* Pagination & Status Controls */}
                <div className="flex items-center justify-between w-full max-w-lg mb-2 text-[#a89b88] text-xs font-serif">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => turnPage('prev')} 
                      disabled={currentPage === 0}
                      className="flex items-center gap-1 hover:text-[#f5f0e6] disabled:opacity-20 transition-all py-1 px-3 bg-[#1e1914] hover:bg-[#2c241c] rounded-full border border-[#3b3023] cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    {currentPage > 0 && (
                      <button
                        type="button"
                        onClick={resetToCover}
                        className="p-1 px-2 text-[10px] text-[#c5a059] hover:text-[#fae1b8] bg-[#1a1511] rounded-md border border-[#3a2f22] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Return to front cover"
                      >
                        <RotateCcw size={10} />
                        <span>Cover</span>
                      </button>
                    )}
                  </div>

                  {/* Clean Human-Friendly Page Indicator */}
                  <div className="text-center font-mono text-[11px] text-[#c5a059] px-2 py-0.5 rounded-full bg-[#181410] border border-[#2b2218]">
                    {isFrontCover ? (
                      <span>Front Cover</span>
                    ) : isBackCover ? (
                      <span>Back Cover</span>
                    ) : (
                      <span>Page {currentPage} of {totalFlipPages - 2}</span>
                    )}
                  </div>

                  <button 
                    type="button"
                    onClick={() => turnPage('next')} 
                    disabled={currentPage >= totalFlipPages - 1}
                    className="flex items-center gap-1 hover:text-[#f5f0e6] disabled:opacity-20 transition-all py-1 px-3 bg-[#1e1914] hover:bg-[#2c241c] rounded-full border border-[#3b3023] cursor-pointer disabled:cursor-not-allowed text-xs font-bold"
                  >
                    <span>Next</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* FlipBook Spread Container - Clamped to prevent any horizontal scrollbar */}
                <div 
                  className="relative w-full max-w-3xl flex items-center justify-center overflow-hidden py-1 transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]"
                  style={{ transform: transformStyle }}
                >
                  {isMounted && (
                    /* @ts-ignore - react-pageflip types */
                    <HTMLFlipBook 
                      width={350} 
                      height={460} 
                      size="stretch"
                      minWidth={250}
                      maxWidth={440}
                      minHeight={340}
                      maxHeight={490}
                      drawShadow={true}
                      flippingTime={800}
                      usePortrait={true}
                      startPage={0}
                      showCover={true}
                      mobileScrollSupport={true}
                      onFlip={onFlip}
                      className="bg-transparent"
                      ref={bookRef}
                      style={{ margin: "0 auto" }}
                    >
                      {/* Front Cover */}
                      <BookPage density="hard" className="bg-[#0b0907] border border-[#3d3123] p-6 sm:p-8 flex flex-col justify-center items-center relative text-center shadow-2xl">
                        <div className="absolute inset-0 border-2 border-[#2b2217] m-2 sm:m-3 pointer-events-none rounded-sm" />
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#8c7d6b] mb-3">PostHeart Sanctuary</span>
                        <h1 className="text-xl sm:text-2xl md:text-3xl text-[#f5f0e6] mb-2 sm:mb-3 px-3 font-typewriter font-bold leading-tight">
                          {coverTitle || 'Dear You.'}
                        </h1>
                        <p className="text-[#a89b88] text-xs sm:text-sm px-3 font-typewriter italic">
                          {coverSubtitle || 'A Private Space'}
                        </p>
                        <div className="mt-6 text-[#c2410c] opacity-70">
                          <Feather size={24} />
                        </div>
                        <span className="absolute bottom-4 text-[9px] font-mono text-[#6e6355] uppercase tracking-wider">
                          Click corner or &apos;Next&apos; to open →
                        </span>
                      </BookPage>

                      {/* Inside Front Cover (Blank) */}
                      <BookPage density="hard" className="bg-[#120f0d] border border-[#2b2217] flex items-center justify-center">
                        <div className="text-center opacity-20 text-[#a89b88]">
                          <Feather size={18} className="mx-auto mb-1.5" />
                          <span className="text-[9px] font-serif uppercase tracking-widest">PostHeart Archive</span>
                        </div>
                      </BookPage>

                      {/* Inner Pages */}
                      {pages.map((pageText, index) => (
                        <BookPage key={`inner-${index}`} density="soft" className="bg-[#15120e] border border-[#2b2217] p-5 sm:p-7 flex flex-col justify-between relative text-left">
                          <div>
                            {index === 0 && (
                              <div className="flex flex-col mb-3 pb-2 border-b border-[#2b2217]">
                                <span className="text-[9px] font-mono text-[#8c7d6b] uppercase tracking-widest">Dispatch For</span>
                                <h2 className="w-full text-lg sm:text-xl text-[#f5f0e6] font-typewriter font-bold">
                                  {receiver ? `To: ${receiver}` : 'To: My Love'}
                                </h2>
                              </div>
                            )}
                            <div className="w-full text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-[#e6ded1] font-typewriter">
                              {pageText}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-[#231b13] text-[#8c7d6b] text-[10px] font-mono">
                            <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            <span>Page {index + 1}</span>
                          </div>
                        </BookPage>
                      ))}

                      {/* Blank page to ensure even text page count */}
                      {pages.length % 2 !== 0 && (
                        <BookPage density="soft" className="bg-[#15120e] border border-[#2b2217] flex items-center justify-center">
                          <span className="text-[10px] font-serif italic text-[#4a3f33]">End of Manuscript Notes</span>
                        </BookPage>
                      )}

                      {/* Inside Back Cover (Blank) */}
                      <BookPage density="hard" className="bg-[#120f0d] border border-[#2b2217] flex items-center justify-center">
                        <span className="text-[9px] font-mono text-[#3a3026]">Sealed Sanctuary</span>
                      </BookPage>

                      {/* Back Cover */}
                      <BookPage density="hard" className="bg-[#0b0907] border border-[#3d3123] p-6 sm:p-8 flex flex-col justify-center items-center relative text-center shadow-2xl">
                        <div className="absolute inset-0 border-2 border-[#2b2217] m-2 sm:m-3 pointer-events-none rounded-sm" />
                        <div className="text-[#c2410c] opacity-50 mb-2">
                          <Feather size={22} />
                        </div>
                        <p className="text-[#a89b88] text-xs font-mono uppercase tracking-widest">
                          End of Letter • PostHeart
                        </p>
                        <p className="text-[10px] text-[#6b6051] font-serif italic mt-1.5">
                          Penned with slow romance
                        </p>
                      </BookPage>
                    </HTMLFlipBook>
                  )}
                </div>

                {/* Attached Keepsakes Badge Row */}
                {(uploadedImages.length > 0 || uploadedMusic || recordedVoices.length > 0) && (
                  <div className="flex items-center gap-3 mt-3 px-3 py-1.5 rounded-full bg-[#1b1612] border border-[#3a2f22] text-xs font-serif text-[#d8cebe] max-w-full overflow-hidden">
                    <span className="text-[#c5a059] font-bold shrink-0">Enclosed:</span>
                    {uploadedImages.length > 0 && (
                      <span className="flex items-center gap-1 shrink-0">
                        <ImageIcon size={12} className="text-[#c2410c]" /> {uploadedImages.length} Photos
                      </span>
                    )}
                    {uploadedMusic && (
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <Music size={12} className="text-[#c2410c] shrink-0" /> <span className="truncate">{musicTitle || 'Background Audio'}</span>
                      </span>
                    )}
                    {recordedVoices.length > 0 && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Mic size={12} className="text-[#c2410c]" /> {recordedVoices.length} Voices
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: THE SEALED ENVELOPE PREVIEW */
              <div className="flex flex-col items-center justify-center w-full py-4 overflow-hidden">
                <div className="relative w-full max-w-sm aspect-[16/10] bg-[#1a1612] border-2 border-[#3d3123] rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden relative">
                  {/* Subtle envelope texture */}
                  <div 
                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #f5e6d3 0, #f5e6d3 1px, transparent 0, transparent 12px)`
                    }}
                  />

                  {/* Envelope Flap Fold Lines */}
                  <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none opacity-20">
                    <svg viewBox="0 0 400 140" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M0,0 L200,120 L400,0" fill="none" stroke="#f5e6d3" strokeWidth="1.5" />
                    </svg>
                  </div>

                  {/* Return Address & Postmark */}
                  <div className="flex justify-between items-start z-10">
                    <div className="text-left font-serif text-[11px] text-[#9c907e]">
                      <p className="font-bold text-[#d8cebe] uppercase tracking-wider">From</p>
                      <p className="text-xs text-[#f5f0e6] font-semibold">{senderName}</p>
                    </div>

                    <div className="border border-dashed border-[#8c7456] rounded-md p-1 text-center text-[9px] font-mono text-[#c5a059] uppercase">
                      <span>PostHeart Air Post</span>
                    </div>
                  </div>

                  {/* Center Wax Seal Monogram */}
                  <div className="my-auto text-center z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#8c2214] border-2 border-[#b83321] flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                      <Mail className="w-5 h-5 text-[#fae1b8]" />
                    </div>
                    <span className="text-[10px] font-serif uppercase tracking-widest text-[#a89b88] mt-1.5 font-medium bg-black/60 px-2 py-0.5 rounded-full">
                      Sealed with Wax
                    </span>
                  </div>

                  {/* Recipient Details */}
                  <div className="z-10 flex justify-between items-end border-t border-[#2e241a] pt-2">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#8c7d6b]">Deliver To:</span>
                      <p className="font-serif text-sm font-bold text-[#f5f0e6]">{receiver || 'My Love'}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#c5a059]">Flight: {delay}</span>
                  </div>
                </div>

                <div className="mt-3 text-xs font-serif text-[#a89b88] text-center">
                  Once posted, your carrier bird will deliver this sealed envelope in <strong>{delay}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer with Actions */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-t border-[#2b231a] bg-[#1a1511]/95 z-20 shrink-0">
            <div className="text-xs text-[#9c907e] font-serif hidden sm:block">
              <span>Ready to entrust your words to the carrier bird?</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-full border border-[#3d3224] text-xs font-serif text-[#a89b88] hover:text-white transition-colors cursor-pointer"
              >
                Back to Desk
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSend();
                }}
                disabled={isSubmitting || content.trim().length === 0}
                className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#c2410c] hover:bg-[#ea580c] disabled:opacity-40 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Send size={13} className={isSubmitting ? 'animate-pulse' : ''} />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Letter'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
