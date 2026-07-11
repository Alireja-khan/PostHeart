'use client';

import { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HTMLFlipBook from 'react-pageflip';
import { Image as ImageIcon, Music, Mic, X, Folder, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, ArrowLeft, Feather } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/contexts/AudioContext';

interface User {
  id: string;
  name: string | null;
}

interface Letter {
  id: string;
  content: string;
  sender: User;
  receiver: User | null;
  images?: string[];
  music?: string | null;
  voices?: string[];
  voiceTitles?: string[];
  musicTitle?: string | null;
  coverTitle?: string | null;
  coverSubtitle?: string | null;
  deliverAt?: string;
}

const VoiceNoteCard = ({ 
  id, url, title, isTop, hasMultiple, onNext, onPrev
}: { 
  id: string, url: string, title?: string, isTop?: boolean, hasMultiple?: boolean, onNext?: () => void, onPrev?: () => void
}) => {
  const { currentTrack, isPlaying: globalIsPlaying, togglePlayPause, playTrack, progress, duration, seek } = useAudio();
  
  let optimizedUrl = url;
  if (optimizedUrl.includes('res.cloudinary.com') && optimizedUrl.includes('/video/upload/')) {
    optimizedUrl = optimizedUrl.replace(/\.[^/.]+$/, ".mp3");
  }

  const isThisTrack = currentTrack?.url === optimizedUrl;
  const isThisPlaying = isThisTrack && globalIsPlaying;
  
  const localProgress = isThisTrack ? progress : 0;
  const localDuration = isThisTrack ? duration : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isThisTrack) {
      seek(Number(e.target.value));
    }
  };

  const toggle = () => {
    if (isThisTrack) {
      togglePlayPause();
    } else {
      playTrack({ url: optimizedUrl, title: title || 'Voice Note', type: 'voice' });
    }
  };

  return (
    <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-text-primary/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
          <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
            <Mic size={12} className="text-text-primary/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-text-primary text-[10px] font-bold leading-tight">{title || 'Voice Note'}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 relative z-10">
        {/* Compact Slider & Time */}
        <div className="flex items-center gap-2 mb-2 w-full">
          <span className="text-[9px] font-mono opacity-50 w-6">{Math.floor(localProgress / 60)}:{(Math.floor(localProgress % 60)).toString().padStart(2, '0')}</span>
          <div className="flex-1 relative h-1 bg-text-primary/20 rounded-full group">
            <div className="absolute top-0 left-0 h-full bg-text-primary rounded-full pointer-events-none" style={{ width: `${localDuration ? (localProgress / localDuration) * 100 : 0}%` }} />
            <input 
              type="range"
              min="0"
              max={localDuration || 100}
              value={localProgress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[9px] font-mono opacity-50 w-6 text-right">{Math.floor(localDuration / 60)}:{(Math.floor(localDuration % 60)).toString().padStart(2, '0')}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-4 relative z-10 mt-1">
        {isTop && hasMultiple && (
           <button 
             onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
             className="text-text-primary/40 hover:text-text-primary transition-colors"
           >
             <SkipBack size={14} fill="currentColor" />
           </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          className="w-8 h-8 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {isThisPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        {isTop && hasMultiple && (
           <button 
             onClick={(e) => { e.stopPropagation(); onNext?.(); }}
             className="text-text-primary/40 hover:text-text-primary transition-colors"
           >
             <SkipForward size={14} fill="currentColor" />
           </button>
        )}
      </div>
    </div>
  );
};

const AudioPlayerRow = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggle}
        className="w-8 h-8 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
      </button>
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
};

const getPaginatedContent = (text: string, charsPerPage: number = 380) => {
  const paragraphs = text.split('\n');
  const pages: string[] = [];
  let currentPage = '';

  paragraphs.forEach((p) => {
    const currentLimit = pages.length === 0 ? charsPerPage - 100 : charsPerPage;
    if (currentPage.length + p.length > currentLimit && currentPage.length > 0) {
      pages.push(currentPage.trim());
      currentPage = '';
    }
    currentPage += p + '\n';
  });
  
  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }
  
  return pages.length > 0 ? pages : [''];
};

export default function LetterClientView({ letter }: { letter: Letter }) {
  const router = useRouter();
  
  // Global audio context for background music and voice notes
  const { 
    currentTrack, 
    isPlaying: globalIsPlaying, 
    togglePlayPause, 
    playTrack,
    progress,
    duration,
    volume,
    isMuted,
    isLooping,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleLoop
  } = useAudio();

  // Gallery and Embed States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<{ images: string[], music: string[], audio: string[] } | null>(null);
  const [isEmbedGalleryOpen, setIsEmbedGalleryOpen] = useState(false);
  const [embedGalleryType, setEmbedGalleryType] = useState<'images' | 'music' | 'audio'>('images');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Parse music cover
  const [musicUrl, musicCoverUrl] = letter.music ? letter.music.split('|') : [null, null];
  
  let optimizedMusicUrl = musicUrl;
  if (optimizedMusicUrl && optimizedMusicUrl.includes('res.cloudinary.com') && optimizedMusicUrl.includes('/video/upload/')) {
    optimizedMusicUrl = optimizedMusicUrl.replace(/\.[^/.]+$/, ".mp3");
  }

  const isMusicPlaying = currentTrack?.url === optimizedMusicUrl && globalIsPlaying;
  const isMusicTrack = currentTrack?.url === optimizedMusicUrl;
  const localMusicProgress = isMusicTrack ? progress : 0;
  const localMusicDuration = isMusicTrack ? duration : 0;

  // Parse receiver name header out of content
  let displayReceiver = `To ${letter.receiver?.name || "my love"}...`;
  let displayContent = letter.content;

  const toMatch = displayContent.match(/^\[To: (.*?)\]\n+/);
  if (toMatch) {
    displayReceiver = toMatch[1];
    displayContent = displayContent.substring(toMatch[0].length);
  }

  let activeFontClass = "font-typewriter";
  const fontMatch = displayContent.match(/^\[Font: (.*?)\]\n+/);
  if (fontMatch) {
    displayContent = displayContent.substring(fontMatch[0].length);
  }

  // Pagination States
  const [currentPage, setCurrentPage] = useState(0);
  const pageTurnAudioRef = useRef<HTMLAudioElement | null>(null);
  const bookRef = useRef<any>(null);
  
  const pages = useMemo(() => getPaginatedContent(displayContent), [displayContent]);

  const turnPage = (direction: 'next' | 'prev') => {
    if (direction === 'next' && bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    } else if (direction === 'prev' && bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const playTurnSound = () => {
    if (pageTurnAudioRef.current) {
      pageTurnAudioRef.current.currentTime = 0;
      pageTurnAudioRef.current.play().catch(e => console.log('Audio play failed', e));
    }
  };

  const onPage = (e: any) => {
    setCurrentPage(e.data);
    playTurnSound();
  };

  // Rotate list of voices
  const [voiceList, setVoiceList] = useState<{ id: string, url: string, title?: string }[]>(
    letter.voices?.map((url, i) => ({ 
      id: i.toString(), 
      url,
      title: letter.voiceTitles && letter.voiceTitles[i] !== 'Voice Note' ? letter.voiceTitles[i] : undefined
    })) || []
  );

  // Parse DB finalContent to rich layout link components
  const renderParsedContent = (text: string) => {
    if (!text) return null;
    
    const parts = [];
    // Matches [[linkText|jsonString]]
    const regex = /\[\[(.*?)\|(.*?)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }
      
      const linkText = match[1];
      const jsonStr = match[2];
      let memory = null;
      try {
        memory = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse embedded memory JSON", e);
      }
      
      const currentMemory = memory;
      
      parts.push(
        <span 
          key={`link-${match.index}`} 
          className="text-[#ff9f1c] cursor-pointer pointer-events-auto relative group transition-colors hover:text-[#ffd166]"
          onClick={() => {
            if (currentMemory) {
              setSelectedMemory(currentMemory);
              setIsEmbedGalleryOpen(false);
            }
          }}
        >
          {linkText}
          {currentMemory && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-text-primary text-bg-primary text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-none shadow-2xl z-50 animate-fade">
              See Memory
            </span>
          )}
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    
    return parts;
  };

  const totalAttachments = letter.images?.length || 0;
  const lastImage = letter.images && letter.images.length > 0 ? letter.images[letter.images.length - 1] : null;
  const secondLastImage = letter.images && letter.images.length > 1 ? letter.images[letter.images.length - 2] : null;

  const totalFlipPages = 2 + pages.length + (pages.length % 2 !== 0 ? 1 : 0) + 2; 
  const isFrontCover = currentPage === 0;
  const isBackCover = currentPage >= totalFlipPages - 2;

  let transformStyle = 'translateX(0)';
  if (isFrontCover) {
    transformStyle = 'translateX(-25%)';
  } else if (isBackCover) {
    transformStyle = 'translateX(25%)';
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-transparent text-text-primary relative flex flex-col items-center pt-32 pb-12 px-6 font-sans">
      
      {/* Back Button (Ultra Minimal, matches top left back style of Details page screenshot) */}
      <div className="absolute top-56 left-8 z-50">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-text-primary/10 px-4 py-2 rounded-full bg-text-primary/5 backdrop-blur-md text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors font-bold"
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>
      </div>

      {/* Removed local background audio element */}

      {/* Ultra Minimal Boundless Content Area with Realistic Page Turn */}
      <div className="w-full max-w-5xl flex flex-col items-center justify-start z-10 relative mt-0 pt-0 px-4 h-full max-h-[85vh]">
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between w-full max-w-md mb-4 opacity-50 text-text-secondary text-[10px] uppercase tracking-widest font-bold">
          <button 
            onClick={() => turnPage('prev')} 
            disabled={currentPage === 0}
            className="hover:text-text-primary disabled:opacity-30 transition-colors py-2 px-4 -ml-4"
          >
            &larr; Prev
          </button>
          <span>Page {currentPage + 1} / {pages.length}</span>
          <button 
            onClick={() => turnPage('next')} 
            disabled={currentPage === pages.length - 1}
            className="hover:text-text-primary disabled:opacity-30 transition-colors py-2 px-4 -mr-4"
          >
            Next &rarr;
          </button>
        </div>

        <div 
          className="relative w-full max-w-4xl shadow-2xl rounded-lg mt-2 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: transformStyle }}
        >
          {/* @ts-ignore - react-pageflip types require all optional props in React 18 */}
          <HTMLFlipBook 
            width={450} 
            height={520} 
            size="stretch"
            minWidth={300}
            maxWidth={600}
            minHeight={400}
            maxHeight={580}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startPage={0}
            showCover={true}
            mobileScrollSupport={true}
            onFlip={onPage}
            className="bg-transparent"
            ref={bookRef}
            style={{ margin: "0 auto" }}
          >
            {/* Front Cover */}
            <div data-density="hard" className="bg-[#0a0a0a] border border-text-primary/10 p-8 h-full overflow-hidden flex flex-col justify-center items-center relative text-center">
              <h1 className={`text-2xl md:text-4xl text-text-primary/90 mb-3 mt-6 px-4 ${activeFontClass}`}>{letter.coverTitle || 'Dear You.'}</h1>
              <p className={`text-text-primary/40 text-sm md:text-base px-4 ${activeFontClass}`}>{letter.coverSubtitle || 'A Private Space'}</p>
              <div className="absolute bottom-8 opacity-20">
                <Feather size={24} />
              </div>
            </div>

            {/* Inside Front Cover (Blank) */}
            <div data-density="hard" className="bg-bg-primary border border-text-primary/5 h-full"></div>

            {/* Inner Pages */}
            {pages.map((pageText, index) => (
              <div key={`inner-${index}`} className="bg-bg-primary border border-text-primary/5 p-6 md:p-8 h-full overflow-hidden flex flex-col justify-center relative text-left">
                {index === 0 && displayReceiver && (
                  <div className="flex flex-col mb-4">
                    <h2 className={`w-full bg-transparent text-2xl md:text-4xl text-text-primary/90 mb-4 text-left ${activeFontClass}`}>
                      {displayReceiver}
                    </h2>
                  </div>
                )}
                <div 
                  className={`w-full text-lg md:text-xl leading-relaxed md:leading-loose whitespace-pre-wrap break-words text-text-primary/90 text-left ${activeFontClass}`}
                >
                  {renderParsedContent(pageText)}
                </div>
                
                <div className="absolute bottom-4 right-8 text-text-secondary opacity-30 text-xs font-sans">
                  {index + 1}
                </div>
              </div>
            ))}

            {/* Blank page to ensure even text page count if needed */}
            {pages.length % 2 !== 0 && (
              <div data-density="soft" className="bg-bg-primary border border-text-primary/5 h-full"></div>
            )}

            {/* Inside Back Cover (Blank) */}
            <div data-density="hard" className="bg-bg-primary border border-text-primary/5 h-full"></div>

            {/* Back Cover */}
            <div data-density="hard" className="bg-[#0a0a0a] border border-text-primary/10 p-6 md:p-8 h-full overflow-hidden flex flex-col justify-center items-center relative text-center">
              <div className="w-12 h-12 rounded-full border border-text-primary/20 flex items-center justify-center opacity-30 mb-4">
                <Feather size={20} />
              </div>
              <p className="text-text-primary/20 text-xs tracking-widest uppercase font-bold">PostHeart</p>
            </div>
          </HTMLFlipBook>
        </div>
      </div>

      {/* Right-Side Attachments Container */}
      <div className="fixed right-6 top-[55%] -translate-y-1/2 z-40 flex flex-col items-end gap-6 pointer-events-none">
        
        {/* Right-Side Voice Notes Stack */}
        <AnimatePresence>
          {voiceList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="relative w-52"
              style={{ height: `${160 + (Math.min(voiceList.length - 1, 2) * 12)}px` }}
            >
              <AnimatePresence>
                {voiceList.slice(0, 3).map((voice, visualIndex) => {
                  const isTop = visualIndex === 0;
                  const zIndex = 50 - visualIndex * 10;
                  const offset = visualIndex * 12; 
                  const scale = 1 - (visualIndex * 0.05);
                  const opacity = 1 - (visualIndex * 0.2);
                  
                  return (
                    <motion.div 
                      key={voice.id}
                      initial={{ opacity: 0, y: -20, scale: 0.9 }}
                      animate={{ opacity, y: offset, scale }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute top-0 left-0 w-full"
                      style={{ 
                        zIndex,
                        pointerEvents: isTop ? 'auto' : 'none' 
                      }}
                    >
                      <VoiceNoteCard
                        id={voice.id}
                        url={voice.url}
                        title={voice.title}
                        isTop={isTop}
                        hasMultiple={voiceList.length > 1}
                        onNext={() => {
                          setVoiceList(prev => {
                            const arr = [...prev];
                            arr.push(arr.shift()!);
                            return arr;
                          });
                        }}
                        onPrev={() => {
                          setVoiceList(prev => {
                            const arr = [...prev];
                            arr.unshift(arr.pop()!);
                            return arr;
                          });
                        }}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right-Side Music Player UI */}
        <AnimatePresence>
          {letter.music && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="pointer-events-auto"
            >
              <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-2xl border border-text-primary/10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
                    <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
                      <Music size={12} className="text-text-primary/60" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-primary text-[10px] font-bold leading-tight truncate max-w-[100px]">{letter.musicTitle || 'Audio Track'}</span>
                    </div>
                  </div>
                </div>

                {/* Cover Art */}
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 mb-4 flex items-center justify-center border border-text-primary/5 overflow-hidden relative z-10 cursor-pointer">
                  {musicCoverUrl ? (
                    <img src={musicCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
                      <Music size={32} className="text-text-primary/20" />
                    </>
                  )}
                  {isMusicPlaying && (
                    <div className="absolute bottom-4 flex gap-1 items-end h-4">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.8 + (i * 0.2), ease: 'easeInOut' }}
                          className="w-1 bg-text-primary/50 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3 relative z-10">
                  <div className="flex justify-between text-[9px] text-text-primary/50 mb-1 font-mono">
                    <span>{Math.floor(localMusicProgress / 60)}:{(Math.floor(localMusicProgress % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(localMusicDuration / 60)}:{(Math.floor(localMusicDuration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                  <div className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden relative group">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#ff9f1c] pointer-events-none"
                      style={{ width: `${localMusicDuration ? (localMusicProgress / localMusicDuration) * 100 : 0}%` }}
                    />
                    <input 
                      type="range"
                      min="0"
                      max={localMusicDuration || 100}
                      value={localMusicProgress}
                      onChange={(e) => {
                        if (isMusicTrack) {
                          seek(Number(e.target.value));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Volume and Extra Controls */}
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <div className="flex items-center gap-2 w-1/2">
                    <button onClick={toggleMute} className="text-text-primary/50 hover:text-text-primary transition-colors">
                      {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <div className="w-full h-1 bg-text-primary/10 rounded-full overflow-hidden relative group">
                      <div 
                        className="absolute top-0 left-0 h-full bg-text-primary transition-all duration-100 ease-linear pointer-events-none" 
                        style={{ width: `${isMuted ? 0 : volume * 100}%` }} 
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolumeLevel(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggleLoop}
                    className={`transition-colors ${isLooping ? 'text-[#ff9f1c]' : 'text-text-primary/50 hover:text-text-primary'}`}
                  >
                    <Repeat size={12} />
                  </button>
                </div>

                {/* Main Controls */}
                <div className="flex justify-center items-center gap-5 relative z-10">
                  <button 
                     onClick={() => { if(isMusicTrack) seek(Math.max(0, localMusicProgress - 10)) }}
                     className="text-text-primary/50 hover:text-text-primary transition-colors"
                  >
                    <SkipBack size={14} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => {
                      if (!optimizedMusicUrl) return;
                      if (isMusicTrack) {
                        togglePlayPause();
                      } else {
                        playTrack({ url: optimizedMusicUrl, title: letter.musicTitle || 'Audio Track', coverUrl: musicCoverUrl || undefined, type: 'music' });
                      }
                    }}
                    className="w-10 h-10 bg-text-primary text-bg-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                  >
                    {isMusicPlaying ? (
                       <Pause size={16} fill="currentColor" />
                    ) : (
                       <Play size={16} fill="currentColor" className="ml-1" />
                    )}
                  </button>
                  <button 
                     onClick={() => { if(isMusicTrack) seek(Math.min(localMusicDuration, localMusicProgress + 10)) }}
                     className="text-text-primary/50 hover:text-text-primary transition-colors"
                  >
                    <SkipForward size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right-Side Folder UI */}
        <AnimatePresence>
          {totalAttachments > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              onClick={() => setIsGalleryOpen(true)}
              className="pointer-events-auto cursor-pointer group"
            >
              <div className="relative w-52 bg-bg-secondary rounded-3xl p-4 shadow-2xl border border-text-primary/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2 bg-bg-primary/40 rounded-full pr-2 p-1">
                    <div className="w-6 h-6 rounded-full bg-text-primary/10 flex items-center justify-center overflow-hidden">
                      <Folder size={12} className="text-text-primary/60" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-text-primary text-[10px] font-bold leading-tight">Gallery</span>
                    </div>
                  </div>
                  
                  <div className="bg-text-primary/10 text-text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-text-primary/10">
                    {totalAttachments} items
                  </div>
                </div>

                {/* Folder Graphic */}
                <div className="flex justify-center mt-2 relative z-10">
                  <div className="relative w-24 h-[72px] transition-transform duration-300 group-hover:scale-105">
                    {/* Folder Back (Dark) */}
                    <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-xl rounded-tl-none shadow-2xl border border-text-primary/10" />
                    {/* Folder Back Tab */}
                    <div className="absolute top-0 left-0 w-[40%] h-[25%] bg-[#2a2a2a] rounded-t-lg border-t border-l border-text-primary/10" />

                    {/* Document 1 */}
                    <div className="absolute top-2 left-4 w-12 h-[50px] bg-[#e5e5e5] rounded shadow-sm transform -rotate-6 origin-bottom-left transition-transform duration-300 group-hover:-translate-y-3 group-hover:-rotate-12 overflow-hidden border border-text-primary/20">
                      {secondLastImage ? (
                        <img src={secondLastImage} alt="Preview 1" className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <>
                          <div className="mt-2 ml-2 w-8 h-[2px] bg-bg-primary/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-5 h-[2px] bg-bg-primary/10 rounded-full" />
                        </>
                      )}
                    </div>
                    
                    {/* Document 2 */}
                    <div className="absolute top-3 left-8 w-12 h-[48px] bg-text-primary rounded shadow-sm transform rotate-6 origin-bottom-right transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12 overflow-hidden border border-text-primary/20">
                      {lastImage ? (
                        <img src={lastImage} alt="Preview 2" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="mt-2 ml-2 w-6 h-[2px] bg-bg-primary/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-8 h-[2px] bg-bg-primary/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-4 h-[2px] bg-bg-primary/10 rounded-full" />
                        </>
                      )}
                    </div>

                    {/* Front Glass layer (Translucent Frosted) */}
                    <div className="absolute bottom-0 left-0 w-full h-[70%] bg-text-primary/[0.15] backdrop-blur-md rounded-xl border border-text-primary/30 shadow-[0_-4px_16px_rgba(0,0,0,0.2)] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gallery Popup Overlay */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-text-primary/10 backdrop-blur-xl border border-text-primary/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-text-primary text-xl font-serif">Attached Memories</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {letter.images?.map((url, idx) => (
                   <div 
                     key={`final-${idx}`} 
                     className="relative group aspect-square rounded-2xl overflow-hidden bg-bg-primary/20 border border-text-primary/10 cursor-zoom-in"
                     onClick={() => setLightboxImage(url)}
                   >
                     <img src={url.includes('res.cloudinary.com') ? url.replace('/upload/', '/upload/q_auto,f_auto,w_500/') : url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                   </div>
                 ))}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vault Popup */}
      <AnimatePresence>
        {selectedMemory && !isEmbedGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-secondary border border-text-primary/20 p-8 rounded-3xl shadow-2xl flex gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Images Folder */}
              {selectedMemory.images && selectedMemory.images.length > 0 && (
                <div 
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    setEmbedGalleryType('images');
                    setIsEmbedGalleryOpen(true);
                  }}
                >
                  <div className="relative">
                    <div className="w-16 h-12 bg-blue-500/20 rounded-lg border border-blue-500/40 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <ImageIcon className="text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                      {selectedMemory.images.length}
                    </div>
                  </div>
                  <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Images</span>
                </div>
              )}
              
              {/* Music Folder */}
              {selectedMemory.music && selectedMemory.music.length > 0 && (
                <div 
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    setEmbedGalleryType('music');
                    setIsEmbedGalleryOpen(true);
                  }}
                >
                  <div className="relative">
                    <div className="w-16 h-12 bg-purple-500/20 rounded-lg border border-purple-500/40 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Music className="text-purple-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                      {selectedMemory.music.length}
                    </div>
                  </div>
                  <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Music</span>
                </div>
              )}
              
              {/* Audio Folder */}
              {selectedMemory.audio && selectedMemory.audio.length > 0 && (
                <div 
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    setEmbedGalleryType('audio');
                    setIsEmbedGalleryOpen(true);
                  }}
                >
                  <div className="relative">
                    <div className="w-16 h-12 bg-green-500/20 rounded-lg border border-green-500/40 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                      <Mic className="text-green-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-bg-primary text-text-primary text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-text-primary/20">
                      {selectedMemory.audio.length}
                    </div>
                  </div>
                  <span className="text-text-primary/60 text-xs font-bold uppercase tracking-wider group-hover:text-text-primary transition-colors">Voice</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded Gallery Popup */}
      <AnimatePresence>
        {selectedMemory && isEmbedGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-text-primary/10 backdrop-blur-xl border border-text-primary/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsEmbedGalleryOpen(false)} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                    <ArrowLeft size={16} />
                  </button>
                  <h3 className="text-text-primary text-xl font-serif capitalize">Memory {embedGalleryType}</h3>
                </div>
                <button onClick={() => { setIsEmbedGalleryOpen(false); setSelectedMemory(null); }} className="text-text-primary/60 hover:text-text-primary p-2 rounded-full bg-text-primary/5 hover:bg-text-primary/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {embedGalleryType === 'images' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedMemory.images?.map((url, idx) => (
                    <div 
                      key={`embed-img-${idx}`} 
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-bg-primary/20 border border-text-primary/10 cursor-zoom-in"
                      onClick={() => setLightboxImage(url)}
                    >
                      <img src={url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ))}
                </div>
              )}

              {embedGalleryType === 'music' && (
                <div className="flex flex-col gap-4">
                  {selectedMemory.music?.map((url, idx) => (
                    <div key={`embed-music-${idx}`} className="flex items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-text-primary/10">
                      <span className="text-text-primary text-sm font-mono">Embedded Track {idx + 1}</span>
                      <AudioPlayerRow url={url} />
                    </div>
                  ))}
                </div>
              )}

              {embedGalleryType === 'audio' && (
                <div className="flex flex-col gap-4">
                  {selectedMemory.audio?.map((url, idx) => (
                    <div key={`embed-audio-${idx}`} className="flex items-center justify-between bg-bg-secondary p-4 rounded-2xl border border-text-primary/10">
                      <span className="text-text-primary text-sm font-mono">Embedded Voice {idx + 1}</span>
                      <AudioPlayerRow url={url} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxImage} 
                alt="Full view" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-text-primary/10" 
              />
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-bg-primary/60 hover:bg-bg-primary text-text-primary p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
