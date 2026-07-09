'use client';

import { useState } from 'react';
import { MoreHorizontal, Pin, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function timeAgo(date: string | Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

interface ImageCardProps {
  letter: any;
  imageUrl: string;
  onUpdate: (id: string, data: any) => void;
}

export default function ImageCard({ letter, imageUrl, onUpdate }: ImageCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  
  const titleText = letter.coverTitle || (letter.content.substring(0, 50) + '...');

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    const newPinnedStatus = !letter.isPinned;
    onUpdate(letter.id, { isPinned: newPinnedStatus });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isPinned: newPinnedStatus })
    });
  };

  const handleToggleSpecial = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    const newSpecialStatus = !letter.isSpecial;
    onUpdate(letter.id, { isSpecial: newSpecialStatus });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isSpecial: newSpecialStatus })
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    router.push(`/letter/${letter.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="relative aspect-square group overflow-hidden bg-[#1a1a1a] border border-white/5 rounded-xl block cursor-pointer hover:border-[#c2410c]/50 transition-colors"
    >
      <img 
        src={imageUrl} 
        alt="Letter attachment" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-40"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
        
        {/* Top bar with menu and badges */}
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-2">
            {letter.isPinned && (
              <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded border border-white/5 text-[#c2410c]" title="Pinned">
                <Pin size={12} className="fill-current" />
              </div>
            )}
            {letter.isSpecial && (
              <div className="bg-black/50 backdrop-blur-sm p-1.5 rounded border border-white/5 text-[#c2410c]" title="Special">
                <Star size={12} className="fill-current" />
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/5 hover:bg-[#c2410c]/20 hover:border-[#c2410c]/50 transition-colors cursor-pointer text-white/80"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal size={16} />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-xl p-2 w-48 z-50">
                  <button 
                    onClick={handleTogglePin}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-[#333333] rounded-md transition-colors relative z-50"
                  >
                    <Pin size={14} className={letter.isPinned ? "text-[#c2410c]" : ""} />
                    <span>{letter.isPinned ? 'Unpin image' : 'Pin image'}</span>
                  </button>
                  <button 
                    onClick={handleToggleSpecial}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-[#333333] rounded-md transition-colors relative z-50"
                  >
                    <Star size={14} className={letter.isSpecial ? "text-[#c2410c]" : ""} />
                    <span className="whitespace-nowrap">{letter.isSpecial ? 'Remove special' : 'Put as special'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom text info */}
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-white/50 mb-1">
            {timeAgo(letter.createdAt)}
          </div>
          <h3 className="font-serif text-lg text-white leading-tight drop-shadow-md">
            From: {titleText}
          </h3>
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#c2410c] mt-2 font-semibold">
            By {letter.sender?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
