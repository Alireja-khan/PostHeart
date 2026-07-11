'use client';

import { useState } from 'react';
import { Play, Pause, MoreHorizontal, Pin, Star, Mic, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FolderDropdown from '@/components/FolderDropdown';
import { useAudio } from '@/contexts/AudioContext';

function timeAgo(date: string | Date) {
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

function formatTime(seconds: number) {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}


interface VoiceCardProps {
  letter: any;
  voiceUrl: string;
  onUpdate: (id: string, data: any) => void;
}

export default function VoiceCard({ letter, voiceUrl, onUpdate }: VoiceCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const { currentTrack, isPlaying: globalIsPlaying, togglePlayPause, playTrack, progress, duration, seek } = useAudio();

  let titleText = letter.coverTitle || (letter.content.substring(0, 50) + '...');
  if (letter.voices && letter.voiceTitles) {
    const voiceIndex = letter.voices.indexOf(voiceUrl);
    if (voiceIndex !== -1 && letter.voiceTitles[voiceIndex] && letter.voiceTitles[voiceIndex] !== 'Voice Note') {
      titleText = letter.voiceTitles[voiceIndex];
    }
  }

  let optimizedUrl = voiceUrl;
  if (optimizedUrl && optimizedUrl.includes('res.cloudinary.com') && optimizedUrl.includes('/video/upload/')) {
    optimizedUrl = optimizedUrl.replace(/\.[^/.]+$/, ".mp3");
  }

  const isThisPlaying = currentTrack?.url === optimizedUrl && globalIsPlaying;
  const isThisTrack = currentTrack?.url === optimizedUrl;

  const togglePlay = () => {
    if (!optimizedUrl) return;
    if (isThisTrack) {
      togglePlayPause();
    } else {
      playTrack({ url: optimizedUrl, title: titleText, type: 'voice' });
    }
  };

  const localProgress = isThisTrack ? progress : 0;
  const localDuration = isThisTrack ? duration : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isThisTrack) {
      seek(Number(e.target.value));
    }
  };

  const isVoicePinned = letter.pinnedVoices?.includes(voiceUrl) || false;
  const isVoiceSpecial = letter.specialVoices?.includes(voiceUrl) || false;

  const handleTogglePin = async () => {
    setShowMenu(false);
    
    let newPinnedVoices = letter.pinnedVoices || [];
    if (isVoicePinned) {
      newPinnedVoices = newPinnedVoices.filter((url: string) => url !== voiceUrl);
    } else {
      newPinnedVoices = [...newPinnedVoices, voiceUrl];
    }
    
    onUpdate(letter.id, { pinnedVoices: newPinnedVoices });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, togglePinVoice: true, voiceUrl })
    });
  };

  const handleToggleSpecial = async () => {
    setShowMenu(false);
    
    let newSpecialVoices = letter.specialVoices || [];
    if (isVoiceSpecial) {
      newSpecialVoices = newSpecialVoices.filter((url: string) => url !== voiceUrl);
    } else {
      newSpecialVoices = [...newSpecialVoices, voiceUrl];
    }
    
    onUpdate(letter.id, { specialVoices: newSpecialVoices });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, toggleSpecialVoice: true, voiceUrl })
    });
  };

  return (
    <div className={`bg-bg-primary border border-border-primary rounded-2xl p-4 flex flex-col gap-4 relative group hover:border-[#c2410c]/40 transition-all shadow-lg hover:shadow-xl hover:shadow-[#c2410c]/5`}>

      {/* Voice Icon Button */}
      <div 
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-bg-secondary border border-text-primary/5 shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-text-primary/5 hover:border-[#c2410c]/30 transition-all group/btn`} 
        onClick={togglePlay}
      >
        <div className={`bg-bg-primary/60 rounded-full p-2 backdrop-blur-sm border border-text-primary/10`}>
          {isThisPlaying ? <Pause size={18} className="text-text-primary fill-current" /> : <Play size={18} className="text-text-primary fill-current ml-0.5" />}
        </div>
      </div>

      {/* Info and Controls */}
      <div className="flex-1 w-full flex flex-col justify-center min-w-0">
        <div className="flex justify-between items-start gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <div className="text-[9px] uppercase font-mono tracking-widest text-text-primary/40 mb-1 flex items-center gap-2">
              <Mic size={10} className="text-[#c2410c]" />
              <span className="truncate">Voice Note • {timeAgo(letter.createdAt)}</span>
              {isVoicePinned && <Pin size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
              {isVoiceSpecial && <Star size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
            </div>
            <Link href={`/letter/${letter.id}`} className="font-serif text-xl text-text-primary hover:text-[#c2410c] transition-colors truncate block w-full" title={titleText}>
              {titleText}
            </Link>
            <p className="text-xs text-text-primary/50 mt-1 uppercase tracking-widest font-mono truncate w-full">
              By {letter.sender?.name || 'Unknown'}
            </p>
          </div>

          {/* 3-Dot Menu */}
          <div className="relative flex-shrink-0 flex items-center gap-1">
            <FolderDropdown itemId={voiceUrl} mediaType="voices" />
            <button 
              className="p-1.5 text-text-primary/40 hover:text-text-primary hover:bg-text-primary/5 rounded-md transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={18} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-bg-secondary border border-[#333] rounded-lg shadow-2xl p-1.5 w-48 z-50">
                  <button 
                    onClick={handleTogglePin}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary hover:bg-text-primary/5 rounded-md transition-colors"
                  >
                    <Pin size={14} className={isVoicePinned ? "text-[#c2410c]" : ""} />
                    <span>{isVoicePinned ? 'Unpin voice' : 'Pin voice'}</span>
                  </button>
                  <button 
                    onClick={handleToggleSpecial}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary hover:bg-text-primary/5 rounded-md transition-colors"
                  >
                    <Star size={14} className={isVoiceSpecial ? "text-[#c2410c]" : ""} />
                    <span className="whitespace-nowrap">{isVoiceSpecial ? 'Remove special' : 'Put as special'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[9px] font-mono text-text-primary/40 w-6">{formatTime(localProgress)}</span>
          <div className="relative flex-1 h-1 bg-text-primary/5 rounded-full group">
            <div 
              className="absolute top-0 left-0 h-full bg-[#c2410c]/80 rounded-full pointer-events-none transition-all"
              style={{ width: `${localDuration ? (localProgress / localDuration) * 100 : 0}%` }}
            />
            <input
              type="range"
              min={0}
              max={localDuration || 100}
              value={localProgress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[9px] font-mono text-text-primary/40 w-6 text-right">{formatTime(localDuration)}</span>
        </div>
      </div>
    </div>
  );
}
