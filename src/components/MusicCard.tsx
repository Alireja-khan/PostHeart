'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, MoreHorizontal, Pin, Star, Volume2, VolumeX, Repeat, Repeat1, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const [musicUrl, musicCoverUrl] = letter.music ? letter.music.split('|') : [null, null];
  const bgImage = musicCoverUrl || (letter.images && letter.images.length > 0 ? letter.images[0] : null);
  const titleText = letter.coverTitle || (letter.content.substring(0, 50) + '...');

  // Optimize Cloudinary URLs to force .mp3 delivery for better browser support
  let optimizedUrl = musicUrl;
  if (optimizedUrl && optimizedUrl.includes('res.cloudinary.com') && optimizedUrl.includes('/video/upload/')) {
    optimizedUrl = optimizedUrl.replace(/\.[^/.]+$/, ".mp3");
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(formatTime(audio.currentTime));
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
      setHasError(false);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.warn("Audio error in MusicCard:", audio.error);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [isLooping]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Pause all other audios on the page
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(a => {
          if (a !== audioRef.current && !a.paused) {
            a.pause();
          }
        });

        audioRef.current.play().catch(e => {
          console.warn("Play error in MusicCard:", e);
          setHasError(true);
        });
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      if (vol > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (Number(e.target.value) / 100) * audio.duration;
      if (isFinite(newTime)) {
        audio.currentTime = newTime;
        setProgress(Number(e.target.value));
      }
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
    <div className={`bg-[#111] border ${hasError ? 'border-red-900/50' : 'border-[#222]'} rounded-2xl p-4 flex flex-col gap-4 relative group hover:border-[#c2410c]/40 transition-all shadow-lg hover:shadow-xl hover:shadow-[#c2410c]/5 overflow-hidden`}>
      <audio ref={audioRef} src={optimizedUrl} preload="metadata" />
      
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="w-24 h-24 aspect-square rounded-xl overflow-hidden relative flex-shrink-0 bg-[#1a1a1a] shadow-md cursor-pointer group/cover" onClick={togglePlay}>
          {bgImage ? (
            <img src={bgImage} alt="Cover" className="w-full h-full object-cover opacity-80 group-hover/cover:opacity-50 transition-opacity" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#111] group-hover/cover:opacity-50 transition-opacity" />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity">
            <div className={`bg-black/60 rounded-full p-2 backdrop-blur-sm border ${hasError ? 'border-red-500/50' : 'border-white/10'}`}>
              {hasError ? <AlertCircle size={18} className="text-red-500" /> : isPlaying ? <Pause size={18} className="text-white fill-current" /> : <Play size={18} className="text-white fill-current ml-0.5" />}
            </div>
          </div>
        </div>

        {/* Info Header */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start gap-4 w-full">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1 flex items-center gap-2">
                <span className="truncate">{timeAgo(letter.createdAt)}</span>
                {letter.isPinned && <Pin size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
                {letter.isSpecial && <Star size={10} className="text-[#c2410c] fill-current flex-shrink-0" />}
              </div>
              <Link href={`/letter/${letter.id}`} className="font-serif text-lg text-white hover:text-[#c2410c] transition-colors truncate block w-full" title={titleText}>
                {titleText}
              </Link>
              <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-mono truncate w-full">
                By {letter.sender?.name || 'Unknown'}
              </p>
              {hasError && <p className="text-xs text-red-500/80 mt-1">Unsupported audio format or broken link</p>}
            </div>

            {/* 3-Dot Menu */}
            <div className="relative flex-shrink-0">
              <button 
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal size={18} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl p-1.5 w-48 z-50">
                    <button 
                      onClick={handleTogglePin}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Pin size={14} className={letter.isPinned ? "text-[#c2410c]" : ""} />
                      <span>{letter.isPinned ? 'Unpin music' : 'Pin music'}</span>
                    </button>
                    <button 
                      onClick={handleToggleSpecial}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Star size={14} className={letter.isSpecial ? "text-[#c2410c]" : ""} />
                      <span className="whitespace-nowrap">{letter.isSpecial ? 'Remove special' : 'Put as special'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Audio Player */}
      <div className="flex flex-col gap-3 px-1">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/50 w-8">{currentTime}</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0}
            onChange={handleSeek}
            disabled={hasError}
            className={`flex-1 h-1 bg-[#333] rounded-lg appearance-none ${hasError ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:h-1.5'} accent-[#c2410c] transition-all`}
          />
          <span className="text-[10px] font-mono text-white/50 w-8 text-right">{duration}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay} 
              disabled={hasError}
              className={`text-white transition-colors bg-white/5 rounded-full p-2 border ${hasError ? 'opacity-50 cursor-not-allowed border-white/5' : 'hover:text-[#c2410c] hover:bg-white/10 border-white/5 hover:border-[#c2410c]/30'}`}
            >
              {hasError ? <AlertCircle size={14} className="text-red-500" /> : isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>
            
            {/* Volume */}
            <div className="flex items-center gap-2 group relative">
              <button onClick={toggleMute} disabled={hasError} className={`transition-colors p-1 ${hasError ? 'text-white/20 cursor-not-allowed' : 'text-white/40 hover:text-white'}`}>
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                disabled={hasError}
                className="w-16 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleLoop}
              disabled={hasError} 
              className={`p-1.5 rounded-md transition-colors ${hasError ? 'opacity-50 cursor-not-allowed' : isLooping ? 'text-[#c2410c] bg-[#c2410c]/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              title="Repeat"
            >
              {isLooping ? <Repeat1 size={14} /> : <Repeat size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
