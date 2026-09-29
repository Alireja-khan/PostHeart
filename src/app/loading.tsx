'use client';

import BirdLoader from '@/components/BirdLoader';

export default function Loading() {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg-primary select-none">
      <BirdLoader className="w-16 h-16 text-[#c2410c]" />
    </div>
  );
}
