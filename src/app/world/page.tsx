'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Music, 
  Image as ImageIcon, 
  Mic, 
  Mail, 
  Upload, 
  Calendar, 
  Clock, 
  BookOpen, 
  Hourglass,
  Scale,
  Camera,
  Trash2,
  PenTool,
  Maximize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BirdLoader from '@/components/BirdLoader';
import { useDialog } from '@/components/DialogProvider';
import { uploadFile } from '@/lib/upload';
import toast from 'react-hot-toast';
import { useAudio } from '@/contexts/AudioContext';

interface WorldStats {
  musicSent: number;
  musicReceived: number;
  imagesSent: number;
  imagesReceived: number;
  voicesSent: number;
  voicesReceived: number;
  lettersSent: number;
  lettersReceived: number;
}

interface WorldFacts {
  lastLetterSent: string | null;
  lastLetterReceived: string | null;
  totalWordsWritten: number;
  daysConnected: number;
  lettersInTransit: number;
  averageDelayHours: number;
}

interface WorldData {
  worldImage: string | null;
  stats: WorldStats;
  facts: WorldFacts;
}

export default function MyWorld() {
  const { confirm } = useDialog();
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<WorldData | null>(null);
  
  // Audio Player State
  const { currentTrack, isPlaying, togglePlayPause, playTrack, closePlayer } = useAudio();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [musicSelectorOpen, setMusicSelectorOpen] = useState(false);
  const [existingMusic, setExistingMusic] = useState<any[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(false);
  
  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openMusicSelector = async () => {
    setMusicSelectorOpen(true);
    if (existingMusic.length > 0) return;
    setLoadingMusic(true);
    try {
      const [sentRes, receivedRes] = await Promise.all([
        fetch('/api/world/media?tab=sent&media=songs'),
        fetch('/api/world/media?tab=received&media=songs')
      ]);
      const sentJson = await sentRes.json();
      const receivedJson = await receivedRes.json();
      
      const allMusic = [
        ...(sentJson.data || []),
        ...(receivedJson.data || [])
      ].filter((l: any) => l.music).map((l: any) => ({
        url: l.music.split('|')[0],
        title: l.musicTitle || 'Audio Track',
        coverUrl: l.images && l.images.length > 0 ? l.images[0] : undefined,
        id: l.id
      }));

      const uniqueMusic = Array.from(new Map(allMusic.map(item => [item.url, item])).values());
      setExistingMusic(uniqueMusic);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load existing music');
    } finally {
      setLoadingMusic(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/world');
      if (!res.ok) throw new Error('Failed to load world data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load your world statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading and hanging your photo...');

    try {
      const url = await uploadFile(file);
      const res = await fetch('/api/world', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldImage: url })
      });

      if (!res.ok) throw new Error('Failed to update image URL');
      const json = await res.json();

      if (json.success) {
        setData(prev => prev ? { ...prev, worldImage: json.worldImage } : null);
        toast.success('Your picture is now hanging in My World!', { id: toastId });
      } else {
        throw new Error(json.error || 'Failed to update database');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to hang image. Please try again.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!(await confirm('Remove Photo', 'Are you sure you want to remove this photo?'))) return;
    
    setUploading(true);
    const toastId = toast.loading('Removing photo...');

    try {
      const res = await fetch('/api/world', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldImage: null })
      });

      if (!res.ok) throw new Error('Failed to remove image');
      const json = await res.json();

      if (json.success) {
        setData(prev => prev ? { ...prev, worldImage: null } : null);
        toast.success('Photo removed.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove photo.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select a valid audio file.');
      return;
    }

    // Create a local object URL to play it
    const localUrl = URL.createObjectURL(file);
    playTrack({ url: localUrl, title: file.name, type: 'music' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <BirdLoader className="w-16 h-16 text-text-primary/80" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Interactive Hanging Photo Frame (Polaroid representation) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          {/* Minimalist Picture Frame */}
          <div className="w-full max-w-xl aspect-[4/5] bg-[#121212] relative group overflow-hidden border border-text-primary/5">
            {uploading ? (
              <div className="absolute inset-0 bg-bg-primary/75 z-20 flex flex-col items-center justify-center">
                <BirdLoader className="w-12 h-12 text-[#c2410c]" />
                <span className="text-[10px] uppercase tracking-wider text-text-primary/50 mt-4 font-mono">Updating...</span>
              </div>
            ) : null}

            {data.worldImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={data.worldImage} 
                alt="My World" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-text-primary/30">
                <Camera size={36} className="mb-4 stroke-[1.2]" />
                <p className="font-serif text-sm italic">"Your featured photo"</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 text-[10px] tracking-widest uppercase bg-text-primary/10 hover:bg-text-primary/20 text-text-primary font-mono py-2 px-4 rounded-full transition-all"
                >
                  Select Photo
                </button>
              </div>
            )}

            {/* Hover Overlay Controls */}
            {data.worldImage && (
              <div className="absolute inset-0 bg-bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div className="absolute bottom-4 right-4 flex gap-3">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="p-3 bg-bg-primary hover:bg-text-primary hover:text-bg-primary rounded-full text-text-primary transition-all shadow-lg"
                    title="View Fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-bg-primary hover:bg-text-primary hover:text-bg-primary rounded-full text-text-primary transition-all shadow-lg"
                    title="Change Photo"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="p-3 bg-bg-primary hover:bg-red-950 hover:text-red-400 rounded-full text-text-primary/80 transition-all shadow-lg"
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
        </div>

        {/* Right Column: Statistics Grid & Interesting Facts */}
        <div className="lg:col-span-6 flex flex-col space-y-12">
          
          {/* Improved Audio Player UI */}
          <div className="flex items-center justify-between bg-bg-primary border border-text-primary/5 rounded-[2rem] p-2 pr-4 w-full max-w-md shadow-lg transition-all">
            {currentTrack ? (
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-text-primary/5 flex items-center justify-center shrink-0 border border-text-primary/10 relative group cursor-pointer" onClick={togglePlayPause}>
                  {currentTrack.coverUrl ? (
                    <img src={currentTrack.coverUrl} alt="Cover" className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} style={{ animationDuration: '8s' }} />
                  ) : (
                    <Music size={16} className="text-[#c2410c]" />
                  )}
                  <div className="absolute inset-0 bg-bg-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* Assume Play/Pause icon from lucide-react if imported, or just use text/simple shape for now */}
                     <span className="text-text-primary text-xs font-bold">{isPlaying ? '||' : '▶'}</span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] text-text-primary/40 font-mono uppercase tracking-widest mb-0.5">Now Playing</span>
                  <span className="text-text-primary/90 text-sm font-serif truncate">{currentTrack.title}</span>
                </div>
                <button 
                  onClick={closePlayer}
                  className="text-text-primary/30 hover:text-text-primary transition-colors p-2"
                  title="Clear Track"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                 <span className="text-[10px] font-mono text-text-primary/40 uppercase tracking-widest">World Soundtrack</span>
                 <button
                  onClick={openMusicSelector}
                  className="bg-text-primary/10 hover:bg-text-primary/20 text-text-primary px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-mono transition-all flex items-center gap-2"
                >
                  <Music size={12} />
                  Choose Audio File
                </button>
              </div>
            )}
            <input 
              type="file"
              ref={audioInputRef}
              onChange={handleAudioUpload}
              accept="audio/*"
              className="hidden"
            />
          </div>

          {/* Statistics Grid (Boundless canvas design) */}
          <div>
            <h2 className="font-serif text-lg tracking-wider text-text-primary/30 mb-8 uppercase font-light">
              Exchange Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              
              {/* Stat 1: Letters */}
              <Link href="/world/letters" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-text-primary/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Mail size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Letters</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-text-primary group-hover:text-[#c2410c] transition-colors">{data.stats.lettersSent}</span>
                  <span className="text-xs text-text-primary/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-text-primary/60">{data.stats.lettersReceived}</span>
                  <span className="text-[10px] text-text-primary/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 2: Music */}
              <Link href="/world/songs" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-text-primary/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Music size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Songs</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-text-primary group-hover:text-[#c2410c] transition-colors">{data.stats.musicSent}</span>
                  <span className="text-xs text-text-primary/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-text-primary/60">{data.stats.musicReceived}</span>
                  <span className="text-[10px] text-text-primary/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 3: Images */}
              <Link href="/world/images" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-text-primary/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <ImageIcon size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Images</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-text-primary group-hover:text-[#c2410c] transition-colors">{data.stats.imagesSent}</span>
                  <span className="text-xs text-text-primary/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-text-primary/60">{data.stats.imagesReceived}</span>
                  <span className="text-[10px] text-text-primary/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 4: Voice Notes */}
              <Link href="/world/voices" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-text-primary/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Mic size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Voices</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-text-primary group-hover:text-[#c2410c] transition-colors">{data.stats.voicesSent}</span>
                  <span className="text-xs text-text-primary/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-text-primary/60">{data.stats.voicesReceived}</span>
                  <span className="text-[10px] text-text-primary/30 font-mono">received</span>
                </div>
              </Link>

            </div>
          </div>

          {/* Interesting Facts Section (Styled like typed vintage log entries) */}
          <div className="border-t border-text-primary/5 pt-12">
            <h2 className="font-serif text-lg tracking-wider text-text-primary/30 mb-8 uppercase font-light">
              Interesting Journal Facts
            </h2>

            <div className="space-y-6 font-typewriter text-text-primary/80 max-w-xl text-sm leading-relaxed">
              
              {/* Fact 1: Connection Length */}
              <div className="flex items-start space-x-4">
                <Calendar size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">DAYS CONNECTED</span>
                  <span>
                    {data.facts.daysConnected > 0 ? (
                      <>You have shared this space for <span className="text-text-primary font-bold">{data.facts.daysConnected}</span> days.</>
                    ) : (
                      <>Your connection starts today with your first letter.</>
                    )}
                  </span>
                </div>
              </div>

              {/* Fact 2: Last Letter Sent */}
              <div className="flex items-start space-x-4">
                <Clock size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LAST LETTER SENT</span>
                  <span>{formatDate(data.facts.lastLetterSent)}</span>
                </div>
              </div>

              {/* Fact 3: Last Letter Received */}
              <div className="flex items-start space-x-4">
                <BookOpen size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LAST LETTER RECEIVED</span>
                  <span>{formatDate(data.facts.lastLetterReceived)}</span>
                </div>
              </div>

              {/* Fact 4: Words Written */}
              <div className="flex items-start space-x-4">
                <PenTool size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">WORDS WRITTEN</span>
                  <span>
                    You have penned a total of <span className="text-text-primary font-bold">{data.facts.totalWordsWritten}</span> words of affection in your letters.
                  </span>
                </div>
              </div>

              {/* Fact 5: In Transit */}
              {data.facts.lettersInTransit > 0 && (
                <div className="flex items-start space-x-4">
                  <Hourglass size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LETTERS IN TRANSIT</span>
                    <span className="text-[#c2410c] animate-pulse">
                      There are currently <span className="font-bold">{data.facts.lettersInTransit}</span> letter(s) traveling through space to your partner.
                    </span>
                  </div>
                </div>
              )}

              {/* Fact 6: Average Transit Time */}
              {data.facts.averageDelayHours > 0 && (
                <div className="flex items-start space-x-4">
                  <Scale size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-text-primary/40 block text-[10px] tracking-widest uppercase font-mono mb-1">PATIENCE INDEX</span>
                    <span>
                      Your letters take an average of <span className="text-text-primary font-bold">{data.facts.averageDelayHours}</span> hours to cross the distance.
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && data?.worldImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/90 p-4"
          >
            <button 
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 bg-text-primary/10 hover:bg-text-primary/20 rounded-full text-text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={data.worldImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Selector Modal */}
      <AnimatePresence>
        {musicSelectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-bg-primary border border-text-primary/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-text-primary font-serif text-xl">Select Soundtrack</h3>
                <button onClick={() => setMusicSelectorOpen(false)} className="text-text-primary/40 hover:text-text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
                {loadingMusic ? (
                  <div className="flex justify-center py-10">
                    <BirdLoader className="w-8 h-8 text-text-primary/50" />
                  </div>
                ) : existingMusic.length > 0 ? (
                  existingMusic.map(track => (
                    <div 
                      key={track.id} 
                      onClick={() => { playTrack({ url: track.url, title: track.title, coverUrl: track.coverUrl, type: 'music' }); setMusicSelectorOpen(false); }}
                      className="flex items-center gap-4 bg-text-primary/5 hover:bg-text-primary/10 p-3 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-text-primary/10"
                    >
                      <div className="w-12 h-12 rounded-lg bg-bg-primary/40 flex items-center justify-center shrink-0 overflow-hidden">
                        {track.coverUrl ? (
                          <img src={track.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                          <Music size={16} className="text-[#c2410c]" />
                        )}
                      </div>
                      <span className="text-text-primary/80 text-sm font-mono truncate">{track.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-text-primary/40 font-mono text-xs py-10">
                    No existing music found in your letters.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-text-primary/10 flex flex-col items-center">
                <span className="text-[10px] text-text-primary/30 uppercase tracking-widest font-mono mb-3">Or upload a new track</span>
                <button
                  onClick={() => { audioInputRef.current?.click(); setMusicSelectorOpen(false); }}
                  className="bg-text-primary text-bg-primary hover:bg-text-primary/90 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-2"
                >
                  <Upload size={14} />
                  Upload from Device
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
