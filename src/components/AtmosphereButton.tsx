'use client';

import React from 'react';
import { CloudRain, Sparkles } from 'lucide-react';
import { useAtmosphere } from '@/contexts/AtmosphereContext';

interface AtmosphereButtonProps {
  className?: string;
  variant?: 'minimal' | 'badge' | 'floating';
  label?: string;
}

export default function AtmosphereButton({ 
  className = '', 
  variant = 'badge',
  label = 'Ambience' 
}: AtmosphereButtonProps) {
  const { isPlaying, openSoundboard, togglePlay } = useAtmosphere();

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={openSoundboard}
        className={`relative flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${
          isPlaying 
            ? 'bg-[#c2410c]/20 text-[#ea580c] border border-[#c2410c]/40 shadow-[0_0_12px_rgba(194,65,12,0.3)]' 
            : 'bg-white/5 hover:bg-white/10 text-[#a89b88] hover:text-[#fae1b8] border border-white/5'
        } ${className}`}
        title="Atmosphere Engine (Rain, Fireplace, Gramophone)"
      >
        <CloudRain size={15} className={isPlaying ? 'animate-pulse' : ''} />
        {isPlaying && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c2410c] animate-ping" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSoundboard}
      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer font-serif text-xs ${
        isPlaying 
          ? 'bg-[#251b13] text-[#fae1b8] border border-[#c2410c]/60 shadow-[0_0_15px_rgba(194,65,12,0.25)]' 
          : 'bg-[#18130e]/90 hover:bg-[#221a13] text-[#a89b88] hover:text-[#fae1b8] border border-[#382b1d]'
      } ${className}`}
      title="Atmosphere Engine • বৃষ্টির শব্দ ও গ্রামোফোন"
    >
      <CloudRain 
        size={13} 
        className={`transition-colors ${isPlaying ? 'text-[#c2410c]' : 'text-[#a89b88] group-hover:text-[#fae1b8]'}`} 
      />
      <span className="font-semibold tracking-wide">
        {label}
      </span>

      {isPlaying ? (
        <span className="flex items-center gap-0.5 ml-0.5">
          <span className="w-1 h-2.5 bg-[#c2410c] rounded-full animate-pulse" />
          <span className="w-1 h-3.5 bg-[#c2410c] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-2 bg-[#c2410c] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </span>
      ) : (
        <Sparkles size={11} className="text-[#c5a059] opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
      )}
    </button>
  );
}
