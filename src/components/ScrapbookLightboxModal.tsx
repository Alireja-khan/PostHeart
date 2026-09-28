'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ExternalLink, 
  Mail, 
  Calendar,
  Pin,
  Star,
  Maximize,
  Minimize
} from 'lucide-react';
import Link from 'next/link';

function timeAgo(date: string | Date | undefined) {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

interface ScrapbookLightboxItem {
  url: string;
  letter?: {
    id: string;
    content?: string;
    coverTitle?: string | null;
    coverSubtitle?: string | null;
    createdAt?: string | Date;
    sender?: { name?: string | null };
    isPinned?: boolean;
    isSpecial?: boolean;
    pinnedImages?: string[];
    specialImages?: string[];
  };
}

interface ScrapbookLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ScrapbookLightboxItem[];
  initialIndex?: number;
  onUpdateLetter?: (letterId: string, data: any) => void;
}

export default function ScrapbookLightboxModal({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  onUpdateLetter
}: ScrapbookLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(0);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFilmstrip, setShowFilmstrip] = useState(true);

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPan({ x: 0, y: 0 });
      setDirection(0);
    }
  }, [isOpen, initialIndex]);

  // Reset zoom & pan on slide change
  const changeSlide = useCallback((newIndex: number, newDirection: number) => {
    if (newIndex < 0 || newIndex >= items.length) return;
    setDirection(newDirection);
    setCurrentIndex(newIndex);
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [items.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      changeSlide(currentIndex + 1, 1);
    }
  }, [currentIndex, items.length, changeSlide]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      changeSlide(currentIndex - 1, -1);
    }
  }, [currentIndex, changeSlide]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + 0.25, 3.5));
    } else {
      setScale(prev => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Pan / Drag handling when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const letter = currentItem?.letter;
  const imageUrl = currentItem?.url;

  const titleText = letter?.coverTitle || (letter?.content ? letter.content.substring(0, 70) + '...' : 'Photographic Memory');
  const isImagePinned = letter?.pinnedImages?.includes(imageUrl) || false;
  const isImageSpecial = letter?.specialImages?.includes(imageUrl) || false;

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 320 : dir < 0 ? -320 : 0,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -320 : 320,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[150] flex flex-col justify-between bg-black/95 backdrop-blur-2xl select-none overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-white/10 bg-[#120f0d]/90 z-40 backdrop-blur-md">
          {/* Left: Counter & Album tag */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#c5a059] bg-[#221a13] px-3 py-1 rounded-full border border-[#3d2f21]">
              {currentIndex + 1} / {items.length}
            </span>
            <span className="text-xs font-serif text-[#a89b88] hidden sm:inline">
              Scrapbook Vault • মেমোরি অ্যালবাম
            </span>
          </div>

          {/* Center: Zoom Controls Floating Pill */}
          <div className="flex items-center gap-1 bg-[#1a1410] border border-[#3d2f21] rounded-full p-1 shadow-lg">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 text-[#a89b88] hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>
            
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-mono text-[#fae1b8] hover:text-white transition-colors cursor-pointer"
              title="Reset Zoom (0)"
            >
              {Math.round(scale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 3.5}
              className="p-1.5 text-[#a89b88] hover:text-white disabled:opacity-30 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>

            {scale > 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 text-[#c2410c] hover:text-[#ea580c] hover:bg-white/5 rounded-full transition-colors cursor-pointer ml-1"
                title="Reset to 100%"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2 text-[#a89b88] hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Open Original"
            >
              <Download size={16} />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#a89b88] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Center Canvas: Interactive Image with Smooth Slide & Zoom */}
        <div 
          className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
          onWheel={handleWheel}
        >
          {/* Navigation Arrow: Prev */}
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 sm:left-6 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#18130f]/80 hover:bg-[#251d16] text-[#fae1b8] border border-[#3d2f21] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              title="Previous Photo (←)"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Navigation Arrow: Next */}
          {currentIndex < items.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 sm:right-6 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#18130f]/80 hover:bg-[#251d16] text-[#fae1b8] border border-[#3d2f21] flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              title="Next Photo (→)"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Animated Slide Container */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={imageUrl}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative max-w-full max-h-full flex items-center justify-center select-none"
              style={{
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              onMouseDown={handleMouseDown}
              onClick={scale === 1 ? handleToggleZoom : undefined}
            >
              {/* Vintage Polaroid Frame for the Lightbox Photo */}
              <div 
                className="relative bg-[#191410] border-2 border-[#382b1d] rounded-2xl p-2.5 sm:p-3 pb-8 sm:pb-10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden transition-shadow"
                style={{
                  transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Vintage Scrapbook Washi Tape on Top Center */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#e8dcbe]/25 border-x border-[#c2b295]/40 backdrop-blur-sm -rotate-1 pointer-events-none z-20 shadow-sm" />

                <img
                  src={imageUrl}
                  alt="Scrapbook Memory"
                  className="max-w-[85vw] max-h-[60vh] sm:max-h-[66vh] object-contain rounded-lg shadow-inner pointer-events-none"
                  draggable={false}
                />

                {/* Bottom Polaroid Chin Caption in Script / Typewriter */}
                <div className="pt-3 px-2 flex items-center justify-between text-xs font-serif text-[#a89b88]">
                  <span className="font-typewriter text-xs text-[#fae1b8] truncate max-w-[280px] sm:max-w-md">
                    &ldquo;{titleText}&rdquo;
                  </span>
                  {letter?.sender?.name && (
                    <span className="font-mono text-[10px] text-[#c5a059] shrink-0 ml-2">
                      — {letter.sender.name}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Drawer: Keepsake Story Metadata & Thumbnail Filmstrip */}
        <div className="border-t border-white/10 bg-[#120f0d]/95 z-40 backdrop-blur-md pb-4 pt-3 px-4 sm:px-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            {/* Associated Letter Excerpt & Direct Jump */}
            {letter && (
              <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[#c2410c]/20 border border-[#c2410c]/40 flex items-center justify-center shrink-0 text-[#c2410c]">
                    <Mail size={13} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-serif text-[#f5f0e6] truncate">
                      {letter.coverTitle ? `Letter: ${letter.coverTitle}` : `Snippet: "${letter.content?.substring(0, 80)}..."`}
                    </p>
                    <span className="text-[10px] font-mono text-[#8c7d6b]">
                      Penned {timeAgo(letter.createdAt)} by {letter.sender?.name || 'Partner'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/letter/${letter.id}`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#c2410c] hover:bg-[#ea580c] text-white text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95"
                  >
                    <span>Read Full Letter</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            )}

            {/* Thumbnail Filmstrip Carousel */}
            {items.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {items.map((item, idx) => {
                  const isSelected = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => changeSlide(idx, idx > currentIndex ? 1 : -1)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all border cursor-pointer ${
                        isSelected 
                          ? 'border-[#c2410c] scale-105 shadow-[0_0_12px_rgba(194,65,12,0.6)] ring-1 ring-[#c2410c]' 
                          : 'border-white/10 opacity-50 hover:opacity-90 hover:scale-100'
                      }`}
                    >
                      <img 
                        src={item.url.includes('res.cloudinary.com') ? item.url.replace('/upload/', '/upload/q_auto,f_auto,w_150/') : item.url} 
                        alt={`Thumb ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
