'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useDialog } from '@/components/DialogProvider';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_TABS = [
  { id: 'sent', label: 'Sent' },
  { id: 'received', label: 'Received' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'special_me', label: 'Special from Me' },
  { id: 'special_them', label: 'Special from Them' },
];

interface CustomFolder {
  id: string;
  name: string;
}

export default function WorldMediaTabs({ years, partnerGender }: { years: string[], partnerGender?: string | null }) {
  const { confirm } = useDialog();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentTab = searchParams.get('tab') || 'sent';
  const currentYear = searchParams.get('year') || 'all';

  const [customFolders, setCustomFolders] = useState<CustomFolder[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // Determine mediaType based on pathname
  let mediaType = 'letters';
  if (pathname.includes('/images')) mediaType = 'images';
  if (pathname.includes('/songs')) mediaType = 'songs';
  if (pathname.includes('/voices')) mediaType = 'voices';

  useEffect(() => {
    fetchFolders();

    const handleFolderUpdated = (e: any) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.newFolder) {
        setCustomFolders(prev => {
          if (!prev.find(f => f.id === customEvent.detail.newFolder.id)) {
            return [...prev, customEvent.detail.newFolder];
          }
          return prev;
        });
      } else {
        fetchFolders();
      }
    };

    window.addEventListener('folderUpdated', handleFolderUpdated as EventListener);
    return () => window.removeEventListener('folderUpdated', handleFolderUpdated as EventListener);
  }, [mediaType]);

  const fetchFolders = async () => {
    try {
      const res = await fetch(`/api/folders?type=${mediaType}`);
      if (res.ok) {
        const data = await res.json();
        setCustomFolders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async () => {
    if (!newTabName.trim()) return;
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTabName.trim(), type: mediaType })
      });
      if (res.ok) {
        const newFolder = await res.json();
        setCustomFolders([...customFolders, newFolder]);
        setIsCreating(false);
        setNewTabName('');
        setParam('tab', newFolder.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const res = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCustomFolders(customFolders.filter(f => f.id !== folderId));
        if (currentTab === folderId) {
          setParam('tab', 'sent');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTabLabel = (tabId: string, label: string) => {
    if (tabId === 'special_them') {
      if (partnerGender?.toLowerCase() === 'male') return 'Special from Him';
      if (partnerGender?.toLowerCase() === 'female') return 'Special from Her';
      return 'Special from Them';
    }
    return label;
  };

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
      <div className="flex flex-wrap gap-2 pb-4 border-b border-text-primary/10 items-center">
        {DEFAULT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setParam('tab', tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300",
              currentTab === tab.id 
                ? "bg-text-primary text-bg-primary font-semibold shadow-lg shadow-text-primary/10 scale-105" 
                : "bg-bg-primary text-text-primary/40 hover:bg-bg-tertiary hover:text-text-primary border border-text-primary/5"
            )}
          >
            {getTabLabel(tab.id, tab.label)}
          </button>
        ))}

        {customFolders.length > 0 && <div className="w-px h-6 bg-text-primary/10 mx-2" />}

        {customFolders.map((folder) => (
          <div key={folder.id} className="relative group flex items-center">
            <button
              onClick={() => setParam('tab', folder.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300",
                currentTab === folder.id 
                  ? "bg-[#c2410c] text-text-primary font-semibold shadow-lg shadow-[#c2410c]/20 scale-105 border-transparent" 
                  : "bg-bg-primary text-[#c2410c]/70 hover:bg-[#c2410c]/10 hover:text-[#c2410c] border border-[#c2410c]/20"
              )}
            >
              {folder.name}
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (await confirm('Delete Folder', 'Are you sure you want to delete this folder?')) {
                  handleDeleteFolder(folder.id);
                }
              }}
              className="absolute -top-1 -right-1 bg-red-500/90 hover:bg-red-500 text-text-primary rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
              title="Delete Folder"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </div>
        ))}

        {isCreating ? (
          <div className="flex items-center gap-2 ml-2">
            <input
              autoFocus
              type="text"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              placeholder="Tab name..."
              className="bg-bg-primary/50 border border-text-primary/10 rounded-full px-4 py-2 text-xs font-mono text-text-primary focus:outline-none focus:border-[#c2410c] w-32 uppercase tracking-wider"
            />
            <button onClick={handleCreateFolder} className="text-[#c2410c] hover:text-text-primary transition-colors text-xs font-mono uppercase tracking-widest font-bold">Save</button>
            <button onClick={() => setIsCreating(false)} className="text-text-primary/40 hover:text-text-primary transition-colors text-xs font-mono uppercase tracking-widest">Cancel</button>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 bg-transparent text-text-primary/40 hover:text-text-primary hover:bg-text-primary/5 border border-dashed border-text-primary/20 ml-2"
          >
            <Plus size={14} />
            <span>New Tab</span>
          </button>
        )}
      </div>

      {/* Secondary Year Tabs */}
      {years.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam('year', 'all')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all",
              currentYear === 'all'
                ? "bg-[#c2410c]/20 text-[#c2410c] border border-[#c2410c]/30"
                : "bg-transparent text-text-primary/30 hover:text-text-primary/60"
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
                  : "bg-transparent text-text-primary/30 hover:text-text-primary/60"
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
