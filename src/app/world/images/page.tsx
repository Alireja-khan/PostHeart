'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import BirdLoader from '@/components/BirdLoader';
import WorldMediaTabs from '@/components/WorldMediaTabs';
import ImageCard from '@/components/ImageCard';

import { Suspense } from 'react';

function WorldImagesPageContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<{url: string, letter: any}[]>([]);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchImages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/world/media?media=images&tab=${currentTab}&year=${currentYear}`);
        if (res.ok) {
          const json = await res.json();
          setYears(json.years);
          
          const allImages: {url: string, letter: any}[] = [];
          json.data.forEach((letter: any) => {
            if (letter.images && Array.isArray(letter.images)) {
              letter.images.forEach((url: string) => {
                let shouldAdd = true;
                
                if (currentTab === 'pinned') {
                  shouldAdd = letter.pinnedImages && letter.pinnedImages.includes(url);
                } else if (currentTab === 'special_me' || currentTab === 'special_them') {
                  shouldAdd = letter.specialImages && letter.specialImages.includes(url);
                }

                if (shouldAdd) {
                  allImages.push({
                    url,
                    letter
                  });
                }
              });
            }
          });
          setImages(allImages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [status, currentTab, currentYear]);

  const handleUpdateLetter = (id: string, data: any) => {
    setImages(prev => {
      let next = prev.map(img => {
        if (img.letter.id === id) {
          return { ...img, letter: { ...img.letter, ...data } };
        }
        return img;
      });

      if (currentTab === 'pinned') {
        next = next.filter(img => img.letter.pinnedImages && img.letter.pinnedImages.includes(img.url));
      }
      if (currentTab === 'special_me' || currentTab === 'special_them') {
        next = next.filter(img => img.letter.specialImages && img.letter.specialImages.includes(img.url));
      }
      
      return next;
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
          <ImageIcon className="text-[#c2410c]" size={36} strokeWidth={1.5} />
          Photo Gallery<span className="text-[#c2410c]">.</span>
        </h1>
      </div>

      <WorldMediaTabs years={years} />

      {/* Images Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <BirdLoader className="w-12 h-12 text-[#c2410c]" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-white/10 rounded-2xl">
          <p className="font-serif text-white/40 text-lg">No photos found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <ImageCard 
              key={`${img.letter.id}-${index}`} 
              letter={img.letter} 
              imageUrl={img.url} 
              onUpdate={handleUpdateLetter} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldImagesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20 min-h-screen bg-black">
        <BirdLoader className="w-12 h-12 text-[#c2410c]" />
      </div>
    }>
      <WorldImagesPageContent />
    </Suspense>
  );
}
