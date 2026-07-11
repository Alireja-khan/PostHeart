'use client';

import { useState } from 'react';
import { Play, Pause, MoreHorizontal, Pin, Star, AlertCircle } from 'lucide-react';
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

interface MusicCardProps {
  letter: any;
  onUpdate: (id: string, data: any) => void;
  currentUserId?: string;
}

export default function MusicCard({ letter, onUpdate, currentUserId }: MusicCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const { currentTrack, isPlaying: globalIsPlaying, togglePlayPause, playTrack, progress, duration, seek } = useAudio();

  const [musicUrl, musicCoverUrl] = letter.music ? letter.music.split('|') : [null, null];
  const bgImage = musicCoverUrl || (letter.images && letter.images.length > 0 ? letter.images[0] : null);
  const titleText = letter.musicTitle || letter.coverTitle || (letter.content.substring(0, 50) + '...');

  // Optimize Cloudinary URLs to force .mp3 delivery for better browser support
  let optimizedUrl = musicUrl;
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
      playTrack({ url: optimizedUrl, title: titleText, coverUrl: bgImage || undefined, type: 'music' });
    }
  };

  const localProgress = isThisTrack ? progress : 0;
  const localDuration = isThisTrack ? duration : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isThisTrack) {
      seek(Number(e.target.value));
    }
  };
  const handleTogglePin = async () => {
    setShowMenu(false);
    const newPinnedStatus = !letter.isPinned;
    onUpdate(letter.id, { isPinned: newPinnedStatus });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isPinned: newPinnedStatus })
    });
  };

  const handleToggleSpecial = async () => {
    setShowMenu(false);
    const newSpecialStatus = !letter.isSpecial;
    onUpdate(letter.id, { isSpecial: newSpecialStatus });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isSpecial: newSpecialStatus })
    });
  };

  if (!letter.music) return null;

  return (
    <div className={`bg-bg-primary border border-border-primary rounded-2xl p-4 flex flex-col gap-4 relative group hover:border-[#c2410c]/40 transition-all shadow-lg hover:shadow-xl hover:shadow-[#c2410c]/5`}>
      
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="w-24 h-24 aspect-square rounded-xl overflow-hidden relative flex-shrink-0 bg-bg-secondary shadow-md cursor-pointer group/cover" onClick={togglePlay}>
          {bgImage ? (
            <img src={bgImage} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover/cover:opacity-50 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111] group-hover/cover:opacity-50 transition-opacity" />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <div className={`bg-bg-primary/60 rounded-full p-2 backdrop-blur-sm border border-text-primary/10`}>
              {isThisPlaying ? <Pause size={18} className="text-text-primary fill-current" /> : <Play size={18} className="text-text-primary fill-current ml-0.5" />}
            </div>
          </div>
        </div>

        {/* Info Header */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-4 w-full">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] uppercase font-mono tracking-widest text-text-primary/40 mb-1 flex items-center gap-2">
                <span className="truncate">{timeAgo(letter.createdAt)}</span>
                {letter.isPinned && <Pin size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
                {letter.isSpecial && <Star size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
              </div>
              <Link href={`/letter/${letter.id}`} className="font-serif text-lg text-text-primary hover:text-[#c2410c] transition-colors truncate block w-full" title={titleText}>
                {titleText}
              </Link>
              <p className="text-xs text-text-primary/50 mt-1 uppercase tracking-widest font-mono truncate w-full">
                By {letter.sender?.name || 'Unknown'}
              </p>
            </div>

            {/* 3-Dot Menu */}
            <div className="relative flex-shrink-0 flex items-center gap-1">
              <FolderDropdown itemId={letter.id} mediaType="songs" />
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
                      <Pin size={14} className={letter.isPinned ? "text-[#c2410c]" : ""} />
                      <span>{letter.isPinned ? 'Unpin music' : 'Pin music'}</span>
                    </button>
                    <button 
                      onClick={handleToggleSpecial}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary hover:bg-text-primary/5 rounded-md transition-colors"
                    >
                      <Star size={14} className={letter.isSpecial ? "text-[#c2410c]" : ""} />
                      <span className="whitespace-nowrap">{letter.isSpecial ? 'Remove special' : 'Put as special'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Mini Progress Bar */}
          <div className="mt-3 flex items-center gap-2">
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
    </div>
  );
}
