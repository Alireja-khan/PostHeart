'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Search } from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import WorldMediaTabs from '@/components/WorldMediaTabs';
import VoiceCard from '@/components/VoiceCard';
import { Play } from 'lucide-react';

import { Suspense } from 'react';

function WorldVoicesPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<{url: string, letter: any}[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [playingAll, setPlayingAll] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(-1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchVoices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world/media?media=voices&tab=${currentTab}&year=${currentYear}&search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          setYears(json.years);
          
          const allVoices: {url: string, letter: any}[] = [];
          json.data.forEach((letter: any) => {
            if (letter.voices && Array.isArray(letter.voices)) {
              letter.voices.forEach((url: string) => {
                let shouldAdd = true;
                
                if (currentTab === 'pinned') {
                  shouldAdd = letter.pinnedVoices && letter.pinnedVoices.includes(url);
                } else if (currentTab === 'special_me' || currentTab === 'special_them') {
                  shouldAdd = letter.specialVoices && letter.specialVoices.includes(url);
                } else if (currentTab.length === 24) {
                  shouldAdd = json.folderItems && json.folderItems.includes(url);
                }

                if (shouldAdd) {
                  allVoices.push({
                    url,
                    letter
                  });
                }
              });
            }
          });
          setVoices(allVoices);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoices();

    const handleFolderItemUpdated = (e: any) => {
      const { folderId, action, itemId } = e.detail || {};
      if (currentTab === folderId && action === 'remove' && itemId) {
        setVoices(prev => prev.filter(v => v.url !== itemId));
      }
    };
    window.addEventListener('folderItemUpdated', handleFolderItemUpdated as EventListener);
    
    return () => {
      window.removeEventListener('folderItemUpdated', handleFolderItemUpdated as EventListener);
    };
  }, [status, currentTab, currentYear, searchQuery]);

  const handlePlayAll = () => {
    if (voices.length === 0) return;
    setPlayingAll(true);
    setCurrentPlayIndex(0);
  };

  useEffect(() => {
    if (!playingAll || currentPlayIndex < 0 || currentPlayIndex >= voices.length) {
       setPlayingAll(false);
       return;
    }
    const currentVoice = voices[currentPlayIndex];
    const audioEl = document.getElementById(`voice-audio-${currentVoice.url}`) as HTMLAudioElement;
    if (audioEl) {
      const handleEnded = () => {
        setCurrentPlayIndex(prev => prev + 1);
        audioEl.removeEventListener('ended', handleEnded);
      };
      audioEl.addEventListener('ended', handleEnded);
      
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(a => {
        if (a !== audioEl && !a.paused) a.pause();
      });
      
      audioEl.play().catch(e => {
        setCurrentPlayIndex(prev => prev + 1);
        audioEl.removeEventListener('ended', handleEnded);
      });
      
      return () => {
        audioEl.removeEventListener('ended', handleEnded);
      };
    } else {
      setCurrentPlayIndex(prev => prev + 1);
    }
  }, [currentPlayIndex, playingAll, voices]);

  const handleUpdateLetter = (id: string, data: any) => {
    setVoices(prev => {
      let next = prev.map(v => {
        if (v.letter.id === id) {
          return { ...v, letter: { ...v.letter, ...data } };
        }
        return v;
      });

      if (currentTab === 'pinned') {
        next = next.filter(img => img.letter.pinnedVoices && img.letter.pinnedVoices.includes(img.url));
      }
      if (currentTab === 'special_me' || currentTab === 'special_them') {
        next = next.filter(img => img.letter.specialVoices && img.letter.specialVoices.includes(img.url));
      }
      
      return next;
    });
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <BirdLoader className="w-16 h-16 text-text-primary/80" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/world" className="inline-flex items-center space-x-2 text-text-primary/40 hover:text-text-primary transition-colors font-mono text-[10px] uppercase tracking-widest mb-6">
            <ArrowLeft size={14} />
            <span>Back to My World</span>
          </Link>
          <h1 className="font-serif text-4xl font-light text-text-primary tracking-wide flex items-center gap-4">
            <Mic className="text-[#c2410c]" size={36} strokeWidth={1.5} />
            Voice Notes<span className="text-[#c2410c]">.</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <input 
              type="text"
              placeholder="Search voice notes..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-text-primary/5 border border-text-primary/10 rounded-full px-4 py-2.5 pl-10 text-sm text-text-primary placeholder-white/40 focus:outline-none focus:border-text-primary/30 transition-colors"
            />
            <Search className="absolute left-4 top-3 text-text-primary/40" size={16} />
          </div>

          {voices.length > 0 && !loading && (
            <button 
              onClick={handlePlayAll}
              disabled={playingAll}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-serif text-sm transition-all whitespace-nowrap ${
                playingAll 
                  ? 'bg-[#c2410c]/20 text-[#c2410c] cursor-not-allowed' 
                  : 'bg-[#c2410c] text-text-primary hover:bg-[#c2410c]/90 hover:shadow-lg hover:shadow-[#c2410c]/20 hover:-translate-y-0.5'
              }`}
            >
              <Play size={16} className={playingAll ? 'animate-pulse' : 'fill-current'} />
              {playingAll ? 'Playing All...' : 'Play All'}
            </button>
          )}
        </div>
      </div>

      <WorldMediaTabs years={years} />

      {/* Voices List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        </div>
      ) : voices.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-text-primary/10 rounded-2xl">
          <p className="font-serif text-text-primary/40 text-lg">No voice notes found in this category.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {voices.map((voice, index) => (
            <VoiceCard 
              key={`${voice.letter.id}-${index}`} 
              letter={voice.letter} 
              voiceUrl={voice.url} 
              onUpdate={handleUpdateLetter} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldVoicesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20 min-h-screen bg-bg-primary">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
      </div>
    }>
      <WorldVoicesPageContent />
    </Suspense>
  );
}
