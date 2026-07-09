'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailOpen } from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import WorldMediaTabs from '@/components/WorldMediaTabs';
import LetterCard from '@/components/LetterCard';

import { Suspense } from 'react';

function WorldLettersPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<any[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [partnerGender, setPartnerGender] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchLetters = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world/media?media=letters&tab=${currentTab}&year=${currentYear}`);
        if (res.ok) {
          const json = await res.json();
          setLetters(json.data);
          setYears(json.years);
          setPartnerGender(json.partnerGender);
          setCurrentUserId(json.currentUserId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLetters();
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
          <MailOpen className="text-[#c2410c]" size={36} strokeWidth={1.5} />
          Letters Collection<span className="text-[#c2410c]">.</span>
        </h1>
      </div>

      <WorldMediaTabs years={years} partnerGender={partnerGender} />

      {/* Letters Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        </div>
      ) : letters.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
          <p className="font-serif text-white/40 text-lg">No letters found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} onUpdate={handleUpdateLetter} currentUserId={currentUserId || undefined} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldLettersPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20 min-h-screen bg-black">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
      </div>
    }>
      <WorldLettersPageContent />
    </Suspense>
  );
}
