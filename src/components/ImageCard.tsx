'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Pin, Star, Maximize2 } from 'lucide-react';
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

interface ImageCardProps {
  letter: any;
  imageUrl: string;
  onUpdate: (id: string, data: any) => void;
  index?: number;
  onOpenLightbox?: (index: number) => void;
}

export default function ImageCard({ 
  letter, 
  imageUrl, 
  onUpdate,
  index = 0,
  onOpenLightbox
}: ImageCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  
  const titleText = letter.coverTitle || (letter.content ? letter.content.substring(0, 45) + '...' : 'Photographic Memory');
  const isImagePinned = letter.pinnedImages?.includes(imageUrl) || false;
  const isImageSpecial = letter.specialImages?.includes(imageUrl) || false;

  // Alternate natural organic tilts for scrapbook feel
  const tiltClasses = index % 3 === 0 ? '-rotate-1' : index % 3 === 1 ? 'rotate-1' : 'rotate-0';

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    let newPinnedImages = letter.pinnedImages || [];
    if (isImagePinned) {
      newPinnedImages = newPinnedImages.filter((url: string) => url !== imageUrl);
    } else {
      newPinnedImages = [...newPinnedImages, imageUrl];
    }
    
    onUpdate(letter.id, { pinnedImages: newPinnedImages });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, togglePinImage: true, imageUrl })
    });
  };

  const handleToggleSpecial = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    
    let newSpecialImages = letter.specialImages || [];
    if (isImageSpecial) {
      newSpecialImages = newSpecialImages.filter((url: string) => url !== imageUrl);
    } else {
      newSpecialImages = [...newSpecialImages, imageUrl];
    }
    
    onUpdate(letter.id, { specialImages: newSpecialImages });
    
    await fetch('/api/world/media', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: letter.id, toggleSpecialImage: true, imageUrl })
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    // If lightbox trigger exists, open lightbox; otherwise open letter
    if (onOpenLightbox) {
      onOpenLightbox(index);
    } else {
      router.push(`/letter/${letter.id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative bg-[#181410] border border-[#3d2f21] rounded-2xl p-2.5 sm:p-3 pb-8 sm:pb-9 shadow-[0_12px_28px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.95)] hover:border-[#c2410c]/50 transition-all duration-300 cursor-pointer ${tiltClasses} hover:rotate-0 hover:scale-[1.02] flex flex-col justify-between`}
    >
      {/* Semi-transparent Vintage Washi Tape Top Accent */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-[#e8dcbe]/25 border-x border-[#c2b295]/40 backdrop-blur-xs -rotate-1 pointer-events-none z-20 shadow-xs" />

      {/* Main Photographic Frame */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden bg-[#100d0a] border border-[#2a2016]">
        <img 
          src={imageUrl.includes('res.cloudinary.com') ? imageUrl.replace('/upload/', '/upload/q_auto,f_auto,w_800/') : imageUrl} 
          alt={titleText} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {/* Subtle vintage film vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex justify-between items-start p-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <FolderDropdown itemId={imageUrl} mediaType="images" />
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button 
              className="bg-[#120f0d]/85 backdrop-blur-md p-1.5 rounded-lg border border-white/10 hover:bg-[#c2410c] hover:border-[#c2410c] text-white/90 transition-all cursor-pointer shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenLightbox) {
                  onOpenLightbox(index);
                }
              }}
              title="Open Scrapbook Lightbox"
            >
              <Maximize2 size={13} />
            </button>
            
            <button 
              className="bg-[#120f0d]/85 backdrop-blur-md p-1.5 rounded-lg border border-white/10 hover:bg-[#c2410c] hover:border-[#c2410c] text-white/90 transition-all cursor-pointer shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="Options"
            >
              <MoreHorizontal size={13} />
            </button>
          </div>
        </div>

        {/* Status Stamp Badges (Pinned & Special) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
          {isImagePinned && (
            <div className="bg-[#16120e]/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-[#c2410c]/50 text-[#c2410c] flex items-center gap-1 shadow-sm" title="Pinned to Archive">
              <Pin size={10} className="fill-current" />
              <span className="text-[9px] font-mono uppercase tracking-wider">Pinned</span>
            </div>
          )}
          {isImageSpecial && (
            <div className="bg-[#16120e]/85 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-[#c5a059]/50 text-[#c5a059] flex items-center gap-1 shadow-sm" title="Special Keepsake">
              <Star size={10} className="fill-current" />
              <span className="text-[9px] font-mono uppercase tracking-wider">Special</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Options Dropdown */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-3 top-12 bg-[#1b1510] border border-[#3d2f21] rounded-xl shadow-2xl p-1.5 w-44 z-50 text-xs font-serif" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handleTogglePin}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[#d8cebe] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Pin size={13} className={isImagePinned ? "text-[#c2410c]" : ""} />
              <span>{isImagePinned ? 'Unpin photo' : 'Pin photo'}</span>
            </button>
            <button 
              onClick={handleToggleSpecial}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[#d8cebe] hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Star size={13} className={isImageSpecial ? "text-[#c5a059]" : ""} />
              <span>{isImageSpecial ? 'Remove special' : 'Mark special'}</span>
            </button>
          </div>
        </>
      )}

      {/* Polaroid Bottom Chin - Handwritten/Typewriter Caption */}
      <div className="pt-3 px-1 flex flex-col justify-between">
        <h4 className="font-typewriter text-xs sm:text-sm text-[#f5f0e6] leading-snug line-clamp-1 group-hover:text-[#c2410c] transition-colors">
          &ldquo;{titleText}&rdquo;
        </h4>
        
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#2a2016] text-[10px] font-mono text-[#8c7d6b]">
          <span>{timeAgo(letter.createdAt)}</span>
          <span className="text-[#c5a059] font-medium truncate max-w-[100px]">
            {letter.sender?.name ? `— ${letter.sender.name}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
