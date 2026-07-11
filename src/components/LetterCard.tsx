'use client';

import { useState } from 'react';
import { MoreHorizontal, Image as ImageIcon, Music, Mic, Pin, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import FolderDropdown from '@/components/FolderDropdown';

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

interface LetterCardProps {
  letter: any;
  onUpdate: (id: string, data: any) => void;
  currentUserId?: string; // Optional, to know if we are sender or receiver, but we can just blindly toggle
}

export default function LetterCard({ letter, onUpdate, currentUserId }: LetterCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const rawBgImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
  const bgImage = rawBgImage?.includes('res.cloudinary.com') ? rawBgImage.replace('/upload/', '/upload/q_auto,f_auto,w_800/') : rawBgImage;

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    const newPinnedStatus = !letter.isPinned;
    // Optimistic UI update via parent
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
    const specialFor = letter.senderId === currentUserId ? 'sender' : 'receiver';
    onUpdate(letter.id, { isSpecial: newSpecialStatus, specialFor });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isSpecial: newSpecialStatus, specialFor })
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click was on the menu or its children, don't navigate
    if (showMenu) return;
    router.push(`/letter/${letter.id}`);
  };

  const titleText = letter.coverSubtitle || (letter.content.substring(0, 50) + (letter.content.length > 50 ? '...' : ''));

  return (
    <div 
      onClick={handleCardClick}
      className="relative block w-full aspect-[16/10] bg-bg-secondary border border-border-primary rounded-xl group hover:border-[#c2410c]/50 transition-colors cursor-pointer"
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        {/* Background Image & Gradient */}
      {bgImage && (
        <>
          <img src={bgImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />
        </>
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#111111]" />
      )}
      </div>

      {/* Content Container */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 rounded-xl">
        
        {/* Top Row: From & Date */}
        <div className="flex justify-between items-start">
          <div className="bg-bg-primary/50 backdrop-blur-sm px-3 py-1.5 rounded text-[10px] uppercase font-mono tracking-widest text-text-primary/80 font-semibold border border-text-primary/5">
            FROM {letter.sender?.name || 'UNKNOWN'}
          </div>
          
          <div className="flex items-center space-x-2">
            {letter.isPinned && (
              <div className="bg-bg-primary/50 backdrop-blur-sm p-1.5 rounded border border-text-primary/5 text-[#c2410c]" title="Pinned">
                <Pin size={12} className="fill-current" />
              </div>
            )}
            {letter.isSpecial && (
              <div className="bg-bg-primary/50 backdrop-blur-sm p-1.5 rounded border border-text-primary/5 text-[#c2410c]" title="Special">
                <Star size={12} className="fill-current" />
              </div>
            )}
            <div className="bg-bg-primary/50 backdrop-blur-sm px-3 py-1.5 rounded text-[10px] font-mono text-text-primary/80 border border-text-primary/5">
              {timeAgo(letter.createdAt)}
            </div>
          </div>
        </div>

        {/* Center Text */}
        <div className="flex-1 flex items-center justify-center px-4">
          <h3 className="font-serif text-2xl text-text-primary text-center leading-tight drop-shadow-md">
            "{titleText}"
          </h3>
        </div>

        {/* Bottom Row: Icons & Menu */}
        <div className="flex justify-between items-end relative">
          
          {/* Media Icons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-3 bg-bg-primary/60 backdrop-blur-md px-4 py-2 rounded-xl border border-text-primary/5 shadow-lg">
              <ImageIcon size={14} className={letter.images?.length > 0 ? "text-text-primary" : "text-text-primary/20"} />
              <Music size={14} className={letter.music ? "text-text-primary" : "text-text-primary/20"} />
              <Mic size={14} className={letter.voices?.length > 0 ? "text-text-primary" : "text-text-primary/20"} />
            </div>
            <FolderDropdown itemId={letter.id} mediaType="letters" />
          </div>

          {/* Three Dots Menu */}
          <div 
            className="bg-bg-primary/60 backdrop-blur-md p-2 rounded-xl border border-text-primary/5 hover:bg-[#c2410c]/20 hover:border-[#c2410c]/50 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreHorizontal size={16} className="text-text-primary/80" />
          </div>

          {/* Dropdown Menu */}
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
              <div className="absolute bottom-12 right-0 bg-bg-secondary border border-border-primary rounded-lg shadow-xl p-2 w-48 z-50">
                <button 
                  onClick={handleTogglePin}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary hover:bg-[#333333] rounded-md transition-colors relative z-50"
                >
                  <Pin size={14} className={letter.isPinned ? "text-[#c2410c]" : ""} />
                  <span>{letter.isPinned ? 'Unpin letter' : 'Pin letter'}</span>
                </button>
                <button 
                  onClick={handleToggleSpecial}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-text-primary/70 hover:text-text-primary hover:bg-[#333333] rounded-md transition-colors relative z-50"
                >
                  <Star size={14} className={letter.isSpecial ? "text-[#c2410c]" : ""} />
                  <span className="whitespace-nowrap">{letter.isSpecial ? 'Remove special' : 'Put as special'}</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
