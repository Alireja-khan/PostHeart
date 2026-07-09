'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic } from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import WorldMediaTabs from '@/components/WorldMediaTabs';
import VoiceCard from '@/components/VoiceCard';

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

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchVoices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world/media?media=voices&tab=${currentTab}&year=${currentYear}`);
        if (res.ok) {
          const json = await res.json();
          setYears(json.years);
          
          const allVoices: {url: string, letter: any}[] = [];
          json.data.forEach((letter: any) => {
            if (letter.voices && Array.isArray(letter.voices)) {
              letter.voices.forEach((url: string) => {
                allVoices.push({
                  url,
                  letter
                });
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
  }, [status, currentTab, currentYear]);

  const handleUpdateLetter = (id: string, data: any) => {
    setVoices(prev => {
      if (currentTab === 'pinned' && data.isPinned === false) {
        return prev.filter(v => v.letter.id !== id);
      }
      if ((currentTab === 'special_me' || currentTab === 'special_them') && data.isSpecial === false) {
        return prev.filter(v => v.letter.id !== id);
      }
      
      return prev.map(v => {
        if (v.letter.id === id) {
          return { ...v, letter: { ...v.letter, ...data } };
        }
        return v;
      });
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
          <Mic className="text-[#c2410c]" size={36} strokeWidth={1.5} />
          Voice Notes<span className="text-[#c2410c]">.</span>
        </h1>
      </div>

      <WorldMediaTabs years={years} />

      {/* Voices List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        </div>
      ) : voices.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
          <p className="font-serif text-white/40 text-lg">No voice notes found in this category.</p>
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
      <div className="flex justify-center py-20 min-h-screen bg-black">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
      </div>
    }>
      <WorldVoicesPageContent />
    </Suspense>
  );
}
