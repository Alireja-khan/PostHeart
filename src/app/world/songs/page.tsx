'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music } from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import WorldMediaTabs from '@/components/WorldMediaTabs';
import MusicCard from '@/components/MusicCard';

import { Suspense } from 'react';

function WorldSongsPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchSongs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world/media?media=songs&tab=${currentTab}&year=${currentYear}`);
        if (res.ok) {
          const json = await res.json();
          setYears(json.years);
          setLetters(json.data);
          setCurrentUserId(json.currentUserId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [status, currentTab, currentYear]);

  const handleUpdateLetter = (id: string, data: any) => {
    setLetters(prev => {
      if (currentTab === 'pinned' && data.isPinned === false) {
        return prev.filter(l => l.id !== id);
      }
      if ((currentTab === 'special_me' || currentTab === 'special_them') && data.isSpecial === false) {
        return prev.filter(l => l.id !== id);
      }
      return prev.map(l => l.id === id ? { ...l, ...data } : l);
    });
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <BirdLoader className="w-16 h-16 text-white/80" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 min-h-screen">
      
      {/* Header */}
      <div className="mb-12">
        <Link href="/world" className="inline-flex items-center space-x-2 text-white/40 hover:text-white transition-colors font-mono text-[10px] uppercase tracking-widest mb-6">
          <ArrowLeft size={14} />
          <span>Back to My World</span>
        </Link>
        <h1 className="font-serif text-4xl font-light text-white tracking-wide flex items-center gap-4">
          <Music className="text-[#c2410c]" size={36} strokeWidth={1.5} />
          Music Library<span className="text-[#c2410c]">.</span>
        </h1>
      </div>

      <WorldMediaTabs years={years} />

      {/* Songs List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
          <p className="font-serif text-white/40 text-lg">No songs found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {letters.map((letter) => (
            <MusicCard 
              key={letter.id} 
              letter={letter} 
              onUpdate={handleUpdateLetter} 
              currentUserId={currentUserId || undefined} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldSongsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20 min-h-screen bg-black">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
      </div>
    }>
      <WorldSongsPageContent />
    </Suspense>
  );
}
