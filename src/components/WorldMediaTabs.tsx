'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'sent', label: 'Sent' },
  { id: 'received', label: 'Received' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'special_me', label: 'Special from Me' },
  { id: 'special_them', label: 'Special from Them' },
];

export default function WorldMediaTabs({ years, partnerGender }: { years: string[], partnerGender?: string | null }) {
  const getTabLabel = (tabId: string, label: string) => {
    if (tabId === 'special_them') {
      if (partnerGender?.toLowerCase() === 'male') return 'Special from Him';
      if (partnerGender?.toLowerCase() === 'female') return 'Special from Her';
      return 'Special from Them';
    }
    return label;
  };
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' && key === 'year') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col space-y-6 mb-12">
      {/* Primary Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setParam('tab', tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300",
              currentTab === tab.id 
                ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105" 
                : "bg-[#111] text-white/40 hover:bg-[#222] hover:text-white border border-white/5"
            )}
          >
            {getTabLabel(tab.id, tab.label)}
          </button>
        ))}
      </div>

      {/* Secondary Year Tabs (Only show if years exist) */}
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam('year', 'all')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all",
              currentYear === 'all'
                ? "bg-[#c2410c]/20 text-[#c2410c] border border-[#c2410c]/30"
                : "bg-transparent text-white/30 hover:text-white/60"
            )}
          >
            All Time
          </button>
          
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setParam('year', year)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all",
                currentYear === year
                  ? "bg-[#c2410c]/20 text-[#c2410c] border border-[#c2410c]/30"
                  : "bg-transparent text-white/30 hover:text-white/60"
              )}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
