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
  PenTool
} from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import { useDialog } from '@/components/DialogProvider';
import { uploadFile } from '@/lib/upload';
import toast from 'react-hot-toast';

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
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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

    // Create a local object URL to play it without uploading to DB (as requested)
    const localUrl = URL.createObjectURL(file);
    setAudioSrc(localUrl);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <BirdLoader className="w-16 h-16 text-white/80" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      
      {/* Header */}
      <div className="mb-16 text-center md:text-left">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide">
          My World<span className="text-[#c2410c]">.</span>
        </h1>
        <p className="font-serif text-xs md:text-sm tracking-[0.2em] text-white/40 mt-3 uppercase">
          A personal gallery of your shared journey
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Interactive Hanging Photo Frame (Polaroid representation) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          
          {/* Minimalist Picture Frame */}
          <div className="w-full max-w-md aspect-[4/5] bg-[#121212] relative group overflow-hidden border border-white/5">
            {uploading ? (
              <div className="absolute inset-0 bg-black/75 z-20 flex flex-col items-center justify-center">
                <BirdLoader className="w-12 h-12 text-[#c2410c]" />
                <span className="text-[10px] uppercase tracking-wider text-white/50 mt-4 font-mono">Updating...</span>
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
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-white/30">
                <Camera size={36} className="mb-4 stroke-[1.2]" />
                <p className="font-serif text-sm italic">"Your featured photo"</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 text-[10px] tracking-widest uppercase bg-white/10 hover:bg-white/20 text-white font-mono py-2 px-4 rounded-full transition-all"
                >
                  Select Photo
                </button>
              </div>
            )}

            {/* Hover Overlay Controls */}
            {data.worldImage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-[#111] hover:bg-white hover:text-black rounded-full text-white transition-all shadow-lg"
                  title="Change Photo"
                >
                  <Upload size={18} />
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="p-3 bg-[#111] hover:bg-red-950 hover:text-red-400 rounded-full text-white/80 transition-all shadow-lg"
                  title="Remove Photo"
                >
                  <Trash2 size={18} />
                </button>
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
        <div className="lg:col-span-7 flex flex-col space-y-16">
          
          {/* Statistics Grid (Boundless canvas design) */}
          <div>
            <h2 className="font-serif text-lg tracking-wider text-white/30 mb-8 uppercase font-light">
              Exchange Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              
              {/* Stat 1: Letters */}
              <Link href="/world/letters" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-white/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Mail size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Letters</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-white group-hover:text-[#c2410c] transition-colors">{data.stats.lettersSent}</span>
                  <span className="text-xs text-white/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-white/60">{data.stats.lettersReceived}</span>
                  <span className="text-[10px] text-white/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 2: Music */}
              <Link href="/world/songs" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-white/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Music size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Songs</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-white group-hover:text-[#c2410c] transition-colors">{data.stats.musicSent}</span>
                  <span className="text-xs text-white/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-white/60">{data.stats.musicReceived}</span>
                  <span className="text-[10px] text-white/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 3: Images */}
              <Link href="/world/images" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-white/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <ImageIcon size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Images</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-white group-hover:text-[#c2410c] transition-colors">{data.stats.imagesSent}</span>
                  <span className="text-xs text-white/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-white/60">{data.stats.imagesReceived}</span>
                  <span className="text-[10px] text-white/30 font-mono">received</span>
                </div>
              </Link>

              {/* Stat 4: Voice Notes */}
              <Link href="/world/voices" className="flex flex-col space-y-2 group cursor-pointer">
                <div className="flex items-center text-white/30 space-x-2 group-hover:text-[#c2410c] transition-colors">
                  <Mic size={14} className="stroke-[1.5]" />
                  <span className="text-[10px] tracking-widest uppercase font-mono">Voices</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-serif text-white group-hover:text-[#c2410c] transition-colors">{data.stats.voicesSent}</span>
                  <span className="text-xs text-white/30 font-mono">sent</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-serif text-white/60">{data.stats.voicesReceived}</span>
                  <span className="text-[10px] text-white/30 font-mono">received</span>
                </div>
              </Link>

            </div>
          </div>

          {/* Interesting Facts Section (Styled like typed vintage log entries) */}
          <div className="border-t border-white/5 pt-12">
            <h2 className="font-serif text-lg tracking-wider text-white/30 mb-8 uppercase font-light">
              Interesting Journal Facts
            </h2>

            <div className="space-y-6 font-typewriter text-white/80 max-w-xl text-sm leading-relaxed">
              
              {/* Fact 1: Connection Length */}
              <div className="flex items-start space-x-4">
                <Calendar size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">DAYS CONNECTED</span>
                  <span>
                    {data.facts.daysConnected > 0 ? (
                      <>You have shared this space for <span className="text-white font-bold">{data.facts.daysConnected}</span> days.</>
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
                  <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LAST LETTER SENT</span>
                  <span>{formatDate(data.facts.lastLetterSent)}</span>
                </div>
              </div>

              {/* Fact 3: Last Letter Received */}
              <div className="flex items-start space-x-4">
                <BookOpen size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LAST LETTER RECEIVED</span>
                  <span>{formatDate(data.facts.lastLetterReceived)}</span>
                </div>
              </div>

              {/* Fact 4: Words Written */}
              <div className="flex items-start space-x-4">
                <PenTool size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                <div>
                  <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">WORDS WRITTEN</span>
                  <span>
                    You have penned a total of <span className="text-white font-bold">{data.facts.totalWordsWritten}</span> words of affection in your letters.
                  </span>
                </div>
              </div>

              {/* Fact 5: In Transit */}
              {data.facts.lettersInTransit > 0 && (
                <div className="flex items-start space-x-4">
                  <Hourglass size={16} className="mt-1 text-[#c2410c] flex-shrink-0 stroke-[1.5]" />
                  <div>
                    <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">LETTERS IN TRANSIT</span>
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
                    <span className="text-white/40 block text-[10px] tracking-widest uppercase font-mono mb-1">PATIENCE INDEX</span>
                    <span>
                      Your letters take an average of <span className="text-white font-bold">{data.facts.averageDelayHours}</span> hours to cross the distance.
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Audio Player Section */}
      <div className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center">
        <h2 className="font-serif text-lg tracking-wider text-white/30 mb-8 uppercase font-light text-center">
          World Soundtrack
        </h2>
        
        <div className="w-full max-w-2xl bg-[#111] p-6 rounded-2xl flex flex-col items-center gap-6 shadow-2xl border border-white/5">
          {audioSrc ? (
            <div className="w-full flex flex-col gap-4">
              <audio controls src={audioSrc} className="w-full h-12" autoPlay />
              <button 
                onClick={() => setAudioSrc(null)}
                className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-mono self-center"
              >
                Clear Track
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white/40 text-sm font-serif mb-4">No track playing. Select a song or voice note from your local device to set the mood.</p>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 mx-auto"
              >
                <Music size={16} />
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
      </div>

    </div>
  );
}
