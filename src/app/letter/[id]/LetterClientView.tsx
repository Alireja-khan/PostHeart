'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Music, Mic, X, Folder, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, ArrowLeft, Feather } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  deliverAt?: string;
}

const VoiceNoteCard = ({ 
  id, url, isTop, hasMultiple, onNext, onPrev, activePlayingVoice, setActivePlayingVoice
}: { 
  id: string, url: string, isTop?: boolean, hasMultiple?: boolean, onNext?: () => void, onPrev?: () => void, activePlayingVoice: string | null, setActivePlayingVoice: (url: string | null) => void
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (activePlayingVoice !== url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [activePlayingVoice, url, isPlaying]);

  return (
    <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
            <Mic size={12} className="text-white/60" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[10px] font-bold leading-tight">Voice Note</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3 relative z-10">
        <div className="flex justify-between text-[9px] text-white/50 mb-1 font-mono">
          <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
          <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
        </div>
        <div 
          className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
             if (!audioRef.current || !duration) return;
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             audioRef.current.currentTime = pos * duration;
          }}
        >
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Volume and Extra Controls */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2 w-1/2">
          <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <div 
            className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer flex-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setVolume(Math.max(0, Math.min(1, pos)));
              setIsMuted(false);
            }}
          >
            <div className="h-full bg-white transition-all" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
          </div>
        </div>
        <button 
          onClick={() => setIsRepeat(!isRepeat)}
          className={`transition-colors ${isRepeat ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
        >
          {isRepeat ? <Repeat1 size={12} /> : <Repeat size={12} />}
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex justify-center items-center gap-4 relative z-10">
        {isTop && hasMultiple && (
           <button 
             onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
             className="text-white/40 hover:text-white transition-colors"
           >
             <SkipBack size={14} fill="currentColor" />
           </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (isPlaying) {
              audioRef.current?.pause();
              setIsPlaying(false);
              setActivePlayingVoice(null);
            } else {
              setActivePlayingVoice(url);
              audioRef.current?.play();
              setIsPlaying(true);
            }
          }}
          className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        {isTop && hasMultiple && (
           <button 
             onClick={(e) => { e.stopPropagation(); onNext?.(); }}
             className="text-white/40 hover:text-white transition-colors"
           >
             <SkipForward size={14} fill="currentColor" />
           </button>
        )}
      </div>

      <audio 
        ref={audioRef}
        src={url}
        loop={isRepeat}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => !isRepeat && setIsPlaying(false)}
        className="hidden"
      />
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
        className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
      </button>
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
};

export default function LetterClientView({ letter }: { letter: Letter }) {
  const router = useRouter();
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [playingMusic, setPlayingMusic] = useState(false);
  
  // Music states
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [musicVolume, setMusicVolume] = useState(1);
  const [musicIsMuted, setMusicIsMuted] = useState(false);
  const [musicIsRepeat, setMusicIsRepeat] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Gallery and Embed States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<{ images: string[], music: string[], audio: string[] } | null>(null);
  const [isEmbedGalleryOpen, setIsEmbedGalleryOpen] = useState(false);
  const [embedGalleryType, setEmbedGalleryType] = useState<'images' | 'music' | 'audio'>('images');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Parse music cover
  const [musicUrl, musicCoverUrl] = letter.music ? letter.music.split('|') : [null, null];

  // Parse receiver name header out of content
  let displayReceiver = `To ${letter.receiver?.name || "my love"}...`;
  let displayContent = letter.content;

  const toMatch = displayContent.match(/^\[To: (.*?)\]\n+/);
  if (toMatch) {
    displayReceiver = toMatch[1];
    displayContent = displayContent.substring(toMatch[0].length);
  }

  let activeFontClass = "font-serif";
  const fontMatch = displayContent.match(/^\[Font: (.*?)\]\n+/);
  if (fontMatch) {
    const fontName = fontMatch[1];
    if (fontName === 'caveat') {
      activeFontClass = "font-handwriting";
    } else if (fontName === 'custom') {
      activeFontClass = "font-myhandwriting";
    }
    displayContent = displayContent.substring(fontMatch[0].length);
  }

  // Rotate list of voices
  const [voiceList, setVoiceList] = useState<{ id: string, url: string }[]>(
    letter.voices?.map((url, i) => ({ id: i.toString(), url })) || []
  );

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = musicIsMuted ? 0 : musicVolume;
  }, [musicVolume, musicIsMuted]);

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
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-[#f9f8f6] text-black text-[10px] font-bold uppercase tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity delay-100 pointer-events-none shadow-2xl z-50 animate-fade">
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

  return (
    <div className="w-full min-h-screen bg-transparent text-white relative flex flex-col items-center pt-24 pb-48 px-6 font-sans">
      
      {/* Back Button (Ultra Minimal, matches top left back style of Details page screenshot) */}
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 border border-white/10 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md text-[10px] uppercase tracking-widest text-[#a0a0a0] hover:text-[#f9f8f6] transition-colors font-bold"
        >
          <ArrowLeft size={12} />
          <span>Back</span>
        </button>
      </div>

      {musicUrl && (
        <audio 
          ref={musicRef} 
          src={musicUrl} 
          loop={musicIsRepeat}
          onTimeUpdate={() => setMusicCurrentTime(musicRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setMusicDuration(musicRef.current?.duration || 0)}
          onEnded={() => !musicIsRepeat && setPlayingMusic(false)}
          className="hidden" 
        />
      )}

      {/* Ultra Minimal Boundless Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl flex flex-col z-10 relative mt-12"
      >
        <div className="flex flex-col mb-12">
          <h2 className={`w-full bg-transparent text-3xl md:text-5xl text-white/90 mb-4 text-center ${activeFontClass}`}>
            {displayReceiver}
          </h2>
        </div>
        
        <div className="relative w-full min-h-[300px]">
          <div 
            className={`w-full text-xl md:text-2xl leading-relaxed md:leading-loose whitespace-pre-wrap break-words text-white/90 text-center ${activeFontClass}`}
          >
            {renderParsedContent(displayContent)}
          </div>
          
          <p className={`italic text-white/40 mt-16 text-lg text-right ${activeFontClass}`}>
            - {letter.sender.name}
          </p>
        </div>
      </motion.div>

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
                        isTop={isTop}
                        hasMultiple={voiceList.length > 1}
                        activePlayingVoice={playingVoice}
                        setActivePlayingVoice={setPlayingVoice}
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
              <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-2xl border border-white/10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      <Music size={12} className="text-white/60" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-bold leading-tight">Audio Track</span>
                    </div>
                  </div>
                </div>

                {/* Cover Art */}
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 mb-4 flex items-center justify-center border border-white/5 overflow-hidden relative z-10 cursor-pointer">
                  {musicCoverUrl ? (
                    <img src={musicCoverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-0 backdrop-blur-3xl opacity-50" />
                      <Music size={32} className="text-white/20" />
                    </>
                  )}
                  {playingMusic && (
                    <div className="absolute bottom-4 flex gap-1 items-end h-4">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.8 + (i * 0.2), ease: 'easeInOut' }}
                          className="w-1 bg-white/50 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-3 relative z-10">
                  <div className="flex justify-between text-[9px] text-white/50 mb-1 font-mono">
                    <span>{Math.floor(musicCurrentTime / 60)}:{(Math.floor(musicCurrentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(musicDuration / 60)}:{(Math.floor(musicDuration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                  <div 
                    className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                       if (!musicRef.current || !musicDuration) return;
                       const rect = e.currentTarget.getBoundingClientRect();
                       const pos = (e.clientX - rect.left) / rect.width;
                       musicRef.current.currentTime = pos * musicDuration;
                    }}
                  >
                    <div 
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{ width: `${musicDuration ? (musicCurrentTime / musicDuration) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Volume and Extra Controls */}
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <div className="flex items-center gap-2 w-1/2">
                    <button onClick={() => setMusicIsMuted(!musicIsMuted)} className="text-white/50 hover:text-white transition-colors">
                      {musicIsMuted || musicVolume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <div 
                      className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer flex-1"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setMusicVolume(pos);
                        if (pos > 0) setMusicIsMuted(false);
                      }}
                    >
                      <div className="h-full bg-white transition-all duration-100 ease-linear" style={{ width: `${musicIsMuted ? 0 : musicVolume * 100}%` }} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setMusicIsRepeat(!musicIsRepeat)}
                    className={`transition-colors ${musicIsRepeat ? 'text-[#ff9f1c]' : 'text-white/50 hover:text-white'}`}
                  >
                    <Repeat size={12} />
                  </button>
                </div>

                {/* Main Controls */}
                <div className="flex justify-center items-center gap-5 relative z-10">
                  <button 
                     onClick={() => { if(musicRef.current) musicRef.current.currentTime = Math.max(0, musicCurrentTime - 10) }}
                     className="text-white/50 hover:text-white transition-colors"
                  >
                    <SkipBack size={14} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => {
                      if (playingMusic) {
                        musicRef.current?.pause();
                      } else {
                        musicRef.current?.play();
                      }
                      setPlayingMusic(!playingMusic);
                    }}
                    className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {playingMusic ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button 
                     onClick={() => { if(musicRef.current) musicRef.current.currentTime = Math.min(musicDuration, musicCurrentTime + 10) }}
                     className="text-white/50 hover:text-white transition-colors"
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
              <div className="relative w-52 bg-[#1a1a1a] rounded-3xl p-4 shadow-2xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2 bg-black/40 rounded-full pr-2 p-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      <Folder size={12} className="text-white/60" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-[10px] font-bold leading-tight">Gallery</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                    {totalAttachments} items
                  </div>
                </div>

                {/* Folder Graphic */}
                <div className="flex justify-center mt-2 relative z-10">
                  <div className="relative w-24 h-[72px] transition-transform duration-300 group-hover:scale-105">
                    {/* Folder Back (Dark) */}
                    <div className="absolute bottom-0 left-0 w-full h-[85%] bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-xl rounded-tl-none shadow-2xl border border-white/10" />
                    {/* Folder Back Tab */}
                    <div className="absolute top-0 left-0 w-[40%] h-[25%] bg-[#2a2a2a] rounded-t-lg border-t border-l border-white/10" />

                    {/* Document 1 */}
                    <div className="absolute top-2 left-4 w-12 h-[50px] bg-[#e5e5e5] rounded shadow-sm transform -rotate-6 origin-bottom-left transition-transform duration-300 group-hover:-translate-y-3 group-hover:-rotate-12 overflow-hidden border border-white/20">
                      {secondLastImage ? (
                        <img src={secondLastImage} alt="Preview 1" className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <>
                          <div className="mt-2 ml-2 w-8 h-[2px] bg-black/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-5 h-[2px] bg-black/10 rounded-full" />
                        </>
                      )}
                    </div>
                    
                    {/* Document 2 */}
                    <div className="absolute top-3 left-8 w-12 h-[48px] bg-white rounded shadow-sm transform rotate-6 origin-bottom-right transition-transform duration-300 group-hover:-translate-y-2 group-hover:rotate-12 overflow-hidden border border-white/20">
                      {lastImage ? (
                        <img src={lastImage} alt="Preview 2" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="mt-2 ml-2 w-6 h-[2px] bg-black/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-8 h-[2px] bg-black/10 rounded-full" />
                          <div className="mt-1.5 ml-2 w-4 h-[2px] bg-black/10 rounded-full" />
                        </>
                      )}
                    </div>

                    {/* Front Glass layer (Translucent Frosted) */}
                    <div className="absolute bottom-0 left-0 w-full h-[70%] bg-white/[0.15] backdrop-blur-md rounded-xl border border-white/30 shadow-[0_-4px_16px_rgba(0,0,0,0.2)] overflow-hidden">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl font-serif">Attached Memories</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {letter.images?.map((url, idx) => (
                   <div 
                     key={`final-${idx}`} 
                     className="relative group aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10 cursor-zoom-in"
                     onClick={() => setLightboxImage(url)}
                   >
                     <img src={url} alt={`Memory ${idx+1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/20 p-8 rounded-3xl shadow-2xl flex gap-6"
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
                    <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                      {selectedMemory.images.length}
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Images</span>
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
                    <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                      {selectedMemory.music.length}
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Music</span>
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
                    <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/20">
                      {selectedMemory.audio.length}
                    </div>
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Voice</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsEmbedGalleryOpen(false)} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                  </button>
                  <h3 className="text-white text-xl font-serif capitalize">Memory {embedGalleryType}</h3>
                </div>
                <button onClick={() => { setIsEmbedGalleryOpen(false); setSelectedMemory(null); }} className="text-white/60 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {embedGalleryType === 'images' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedMemory.images?.map((url, idx) => (
                    <div 
                      key={`embed-img-${idx}`} 
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-black/20 border border-white/10 cursor-zoom-in"
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
                    <div key={`embed-music-${idx}`} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-white/10">
                      <span className="text-white text-sm font-mono">Embedded Track {idx + 1}</span>
                      <AudioPlayerRow url={url} />
                    </div>
                  ))}
                </div>
              )}

              {embedGalleryType === 'audio' && (
                <div className="flex flex-col gap-4">
                  {selectedMemory.audio?.map((url, idx) => (
                    <div key={`embed-audio-${idx}`} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-white/10">
                      <span className="text-white text-sm font-mono">Embedded Voice {idx + 1}</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out"
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
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
              />
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
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
