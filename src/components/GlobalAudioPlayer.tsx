'use client';

import React, { useEffect, useState } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, Music, Mic, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';

export default function GlobalAudioPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration, 
    togglePlayPause, 
    seek, 
    closePlayer,
    volume,
    isMuted,
    isLooping,
    setVolumeLevel,
    toggleMute,
    toggleLoop
  } = useAudio();
  
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-hide progress bar visually if not hovered, but let's keep it visible at the bottom
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumeLevel(Number(e.target.value));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shouldShow = currentTrack && currentTrack.sourcePathname !== pathname;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-[100] bg-bg-primary/90 backdrop-blur-md border border-text-primary/10 p-3 pr-4 rounded-full shadow-2xl flex items-center gap-4 max-w-[28rem] w-[90vw] md:w-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Cover Art or Icon */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-text-primary/5 flex items-center justify-center relative">
            {currentTrack.coverUrl ? (
              <img src={currentTrack.coverUrl} alt="Cover" className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '8s' }} />
            ) : (
              currentTrack.type === 'music' ? <Music size={20} className="text-[#c2410c]" /> : <Mic size={20} className="text-[#c2410c]" />
            )}
            
            {/* Overlay Play/Pause Button on Hover */}
            <div 
              className={`absolute inset-0 bg-bg-primary/50 flex items-center justify-center transition-opacity cursor-pointer ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={20} className="text-text-primary" fill="white" /> : <Play size={20} className="text-text-primary ml-1" fill="white" />}
            </div>
          </div>

          {/* Track Info & Progress */}
          <div className="flex flex-col flex-1 min-w-[150px]">
            <span className="text-text-primary/90 font-serif text-sm truncate">{currentTrack.title}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-mono text-text-primary/40 w-6">{formatTime(progress)}</span>
              
              {/* Progress Slider */}
              <div className="relative flex-1 h-1 bg-text-primary/10 rounded-full group">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#c2410c] rounded-full pointer-events-none"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => setIsDragging(true)}
                  onTouchEnd={() => setIsDragging(false)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Thumb on hover */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-text-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm"
                  style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 4px)` }}
                />
              </div>

              <span className="text-[9px] font-mono text-text-primary/40 w-6">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Additional Controls */}
          <div className={`flex items-center gap-3 ml-2 pl-3 border-l border-text-primary/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-40'}`}>
            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group relative">
              <button 
                onClick={toggleMute}
                className="text-text-primary/40 hover:text-text-primary transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <div className="w-12 h-1 bg-text-primary/10 rounded-full relative group-hover:bg-text-primary/20 transition-colors">
                <div 
                  className="absolute top-0 left-0 h-full bg-text-primary rounded-full pointer-events-none"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Loop Control */}
            <button 
              onClick={toggleLoop}
              className={`transition-colors p-1 rounded-md ${isLooping ? 'text-[#c2410c] bg-[#c2410c]/10' : 'text-text-primary/40 hover:text-text-primary hover:bg-text-primary/5'}`}
              title={isLooping ? "Repeat On" : "Repeat Off"}
            >
              {isLooping ? <Repeat1 size={14} /> : <Repeat size={14} />}
            </button>

            {/* Close Button */}
            <button 
              onClick={closePlayer}
              className="text-text-primary/40 hover:text-text-primary transition-colors p-1"
              title="Close Player"
            >
              <X size={16} />
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
