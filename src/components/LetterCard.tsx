'use client';

import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Image as ImageIcon, 
  Music, 
  Mic, 
  Pin, 
  Star,
  Mail,
  Stamp,
  Feather
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import FolderDropdown from '@/components/FolderDropdown';

function timeAgo(date: string | Date | undefined) {
  if (!date) return '';
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
  currentUserId?: string;
  index?: number;
}

export default function LetterCard({ letter, onUpdate, currentUserId, index = 0 }: LetterCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  
  const rawBgImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
  const bgImage = rawBgImage?.includes('res.cloudinary.com') 
    ? rawBgImage.replace('/upload/', '/upload/q_auto,f_auto,w_800/') 
    : rawBgImage;

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
    const specialFor = letter.senderId === currentUserId ? 'sender' : 'receiver';
    onUpdate(letter.id, { isSpecial: newSpecialStatus, specialFor });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, isSpecial: newSpecialStatus, specialFor })
    });
  };

  const handleCardClick = () => {
    if (showMenu) return;
    router.push(`/letter/${letter.id}`);
  };

  const titleText = letter.coverSubtitle || (letter.content?.substring(0, 52) + (letter.content?.length > 52 ? '...' : '')) || 'Untitled Dispatch';
  const coverTitle = letter.coverTitle;

  return (
    <div 
      onClick={handleCardClick}
      className="group relative block w-full aspect-[16/10] bg-[#181410] border border-[#3d2f21] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_12px_28px_rgba(0,0,0,0.65)] hover:shadow-[0_22px_44px_rgba(0,0,0,0.9),0_0_24px_rgba(194,65,12,0.12)] hover:border-[#c2410c]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Image / Texture Layer */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {bgImage ? (
          <>
            <img 
              src={bgImage} 
              alt="Manuscript Cover" 
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 filter brightness-75 contrast-125" 
            />
            {/* Vintage sepia vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#14100c] via-[#181410]/85 to-[#1c1611]/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#221a13] via-[#1a140f] to-[#120e0a]" />
        )}

        {/* Vintage Inner Decorative Border */}
        <div className="absolute inset-2 border border-[#523f2d]/30 rounded-xl pointer-events-none" />
      </div>

      {/* Top Header Row: From stamp & Postal Date */}
      <div className="relative z-10 flex justify-between items-start gap-2">
        {/* From Badge / Typewriter Style */}
        <div className="flex items-center gap-1.5 bg-[#120f0d]/85 backdrop-blur-md px-3 py-1 rounded-md border border-[#3d2f21] text-[10px] font-mono tracking-widest text-[#fae1b8] shadow-sm">
          <Mail size={11} className="text-[#c2410c]" />
          <span>FROM {letter.sender?.name ? letter.sender.name.toUpperCase() : 'UNKNOWN'}</span>
        </div>

        {/* Right Badges: Pinned / Special Wax Seal / Date */}
        <div className="flex items-center gap-2">
          {letter.isPinned && (
            <div 
              className="bg-[#241a12]/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#c2410c]/50 text-[#c2410c] flex items-center gap-1 shadow-sm"
              title="Pinned Letter"
            >
              <Pin size={10} className="fill-current" />
              <span className="text-[9px] font-mono uppercase tracking-wider hidden sm:inline">Pinned</span>
            </div>
          )}

          {letter.isSpecial && (
            <div 
              className="bg-gradient-to-r from-[#854d0e]/80 to-[#a16207]/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#eab308]/40 text-[#fef08a] flex items-center gap-1 shadow-sm"
              title="Special Keepsake Letter"
            >
              <Star size={10} className="fill-current text-[#fef08a]" />
              <span className="text-[9px] font-mono uppercase tracking-wider hidden sm:inline">Special</span>
            </div>
          )}

          {/* Reply indicator */}
          {((letter.replies && letter.replies.length > 0) || letter.repliesCount > 0) && (
            <div 
              className="bg-[#1b1510]/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#8c734b]/40 text-[#c5a059] flex items-center gap-1 shadow-sm text-[9px] font-serif"
              title="Has letter replies"
            >
              <Feather size={10} />
              <span>{(letter.replies?.length || letter.repliesCount)} {((letter.replies?.length || letter.repliesCount) === 1 ? 'Reply' : 'Replies')}</span>
            </div>
          )}

          {/* Postal timestamp */}
          <div className="bg-[#120f0d]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#3d2f21] text-[10px] font-mono text-[#a89b88] shadow-sm">
            {timeAgo(letter.createdAt)}
          </div>
        </div>
      </div>

      {/* Center Excerpt / Letter Title with Vintage Postmark Watermark */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 my-2 text-center">
        {coverTitle && (
          <span className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.25em] mb-1 opacity-80">
            {coverTitle}
          </span>
        )}
        <h3 className="font-serif italic text-lg sm:text-2xl text-[#fae1b8] font-light leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:text-white transition-colors max-w-md line-clamp-2">
          "{titleText}"
        </h3>

        {/* Subtle Decorative Postal Stamp Background Accent */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
          <Stamp size={72} className="text-[#c5a059] -rotate-12" />
        </div>
      </div>

      {/* Bottom Bar: Media Indicators & Action Dropdown */}
      <div className="relative z-10 flex justify-between items-center pt-2 border-t border-[#3d2f21]/50">
        
        {/* Media Attachments Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2.5 bg-[#120f0d]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#3d2f21] shadow-sm">
            <span title="Photos Attached">
              <ImageIcon 
                size={13} 
                className={letter.images && letter.images.length > 0 ? "text-[#c5a059]" : "text-[#5a4838]"} 
              />
            </span>
            <span title="Music Attached">
              <Music 
                size={13} 
                className={letter.music ? "text-[#c2410c]" : "text-[#5a4838]"} 
              />
            </span>
            <span title="Voice Note Attached">
              <Mic 
                size={13} 
                className={letter.voices && letter.voices.length > 0 ? "text-[#38bdf8]" : "text-[#5a4838]"} 
              />
            </span>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <FolderDropdown itemId={letter.id} mediaType="letters" />
          </div>
        </div>

        {/* Options Button */}
        <div className="relative">
          <button 
            type="button"
            className="bg-[#120f0d]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#3d2f21] hover:bg-[#c2410c] hover:border-[#c2410c] text-[#a89b88] hover:text-white transition-all cursor-pointer shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Options"
          >
            <MoreHorizontal size={15} />
          </button>

          {/* Floating Dropdown Menu */}
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
              <div 
                className="absolute bottom-10 right-0 bg-[#16120e] border border-[#3d2f21] rounded-xl shadow-2xl p-1.5 w-44 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  type="button"
                  onClick={handleTogglePin}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-[#dcd1c4] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <Pin size={13} className={letter.isPinned ? "text-[#c2410c] fill-current" : "text-[#a89b88]"} />
                  <span>{letter.isPinned ? 'Unpin from Archive' : 'Pin to Archive'}</span>
                </button>
                <button 
                  type="button"
                  onClick={handleToggleSpecial}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs text-[#dcd1c4] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <Star size={13} className={letter.isSpecial ? "text-[#fef08a] fill-current" : "text-[#a89b88]"} />
                  <span>{letter.isSpecial ? 'Remove Special' : 'Mark as Special'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
