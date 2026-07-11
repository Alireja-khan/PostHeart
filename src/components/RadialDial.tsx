"use client"

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { Mail, Globe, PenLine, Settings, User, Users, Image as ImageIcon, Mic, Music, Heart, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface RadialDialProps {
  side: 'left' | 'right';
  avatarUrl: string | null;
  name: string;
  isPartnered?: boolean;
}

const userMenuItems = [
  { id: 'mailbox', icon: Mail, label: 'Mailbox', href: '/', subItems: [] },
  { id: 'write', icon: PenLine, label: 'Write Letter', href: '/write', subItems: [] },
  { id: 'world', icon: Globe, label: 'My World', href: '/world', subItems: [
    { label: 'All Memories', icon: Globe, href: '/world' },
    { label: 'Letters', icon: Mail, href: '/world/letters' },
    { label: 'Images', icon: ImageIcon, href: '/world/images' },
    { label: 'Voices', icon: Mic, href: '/world/voices' },
    { label: 'Songs', icon: Music, href: '/world/songs' }
  ]},
  { id: 'connect', icon: Users, label: 'Partner Hub', href: '/connect', subItems: [] },
  { id: 'profile', icon: User, label: 'Profile Settings', href: '/profile', subItems: [] },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings', subItems: [] },
];

const partnerMenuItems = [
  { id: 'partner-profile', icon: User, label: 'Partner Profile', href: '/connect', subItems: [] },
  { id: 'write-partner', icon: PenLine, label: 'Write to Them', href: '/write', subItems: [] },
  { id: 'shared-world', icon: Globe, label: 'Shared World', href: '/world', subItems: [
    { label: 'Letters', icon: Mail, href: '/world/letters' },
    { label: 'Images', icon: ImageIcon, href: '/world/images' },
    { label: 'Voices', icon: Mic, href: '/world/voices' },
    { label: 'Songs', icon: Music, href: '/world/songs' }
  ]},
  { id: 'disconnect', icon: Heart, label: 'Disconnect Partner', href: '/connect', subItems: [] },
];

export default function RadialDial({ side, avatarUrl, name, isPartnered = true }: RadialDialProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [absoluteIndex, setAbsoluteIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = side === 'left' ? userMenuItems : partnerMenuItems;
  const numItems = items.length;
  const angleStep = 360 / numItems;
  
  // Calculate the actual active item using modulo math
  const activeIndex = ((absoluteIndex % numItems) + numItems) % numItems;

  // Spring for ultra-smooth rotation
  const rotation = useSpring(0, { stiffness: 180, damping: 20 });
  const iconRotation = useTransform(rotation, (val) => -val);

  useEffect(() => {
    // Left dial active item points right (0 deg)
    // Right dial active item points left (180 deg)
    const targetAngle = side === 'left' ? 0 : 180;
    // We use absoluteIndex to ensure continuous rotation without snapping back
    rotation.set(targetAngle - absoluteIndex * angleStep);
  }, [absoluteIndex, rotation, angleStep, side]);

  const activeItem = items[activeIndex];

  const handleItemClick = (index: number) => {
    if (index === activeIndex) {
      if (activeItem.subItems.length === 0) {
        router.push(activeItem.href);
        setIsOpen(false);
      }
    } else {
      // Find the shortest path to the new index
      let diff = index - activeIndex;
      if (diff > numItems / 2) diff -= numItems;
      if (diff < -numItems / 2) diff += numItems;
      setAbsoluteIndex((prev) => prev + diff);
    }
  };

  const touchStartY = useRef<number | null>(null);

  // Native non-passive listeners to perfectly prevent background page scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isOpen) return;
      
      e.stopPropagation();

      // If scrolling over the sub-pages list, scroll the list instead of rotating the dial
      const submenu = (e.target as HTMLElement).closest('.submenu-container');
      if (submenu) {
        submenu.scrollBy({ top: e.deltaY, behavior: 'smooth' });
        e.preventDefault(); // Perfectly block page scroll chaining
        return;
      }

      // Scrolling over the dial itself: prevent page scroll and rotate the dial
      e.preventDefault();

      if (e.deltaY > 0) {
        setAbsoluteIndex((prev) => prev + 1);
      } else if (e.deltaY < 0) {
        setAbsoluteIndex((prev) => prev - 1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!isOpen) return;
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isOpen || touchStartY.current === null) return;
      
      e.stopPropagation();

      // If touch-swiping over the sub-pages list, let native overflow touch scrolling run
      const submenu = (e.target as HTMLElement).closest('.submenu-container');
      if (submenu) {
        return;
      }

      // Swiping over the dial itself: prevent default page drag and rotate the dial
      e.preventDefault();

      const touchEndY = e.touches[0].clientY;
      const diff = touchStartY.current - touchEndY;
      const threshold = 20; // responsive touch swipe

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          setAbsoluteIndex((prev) => prev + 1);
        } else {
          setAbsoluteIndex((prev) => prev - 1);
        }
        touchStartY.current = touchEndY;
      }
    };

    const onTouchEnd = () => {
      touchStartY.current = null;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isOpen, numItems]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${name || 'User'}`;

  return (
    <div 
      ref={containerRef}
      className="relative pointer-events-auto z-[99]"
    >
      {/* Background backdrop blur when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Dial Element */}
      <div className="relative z-50 flex items-center justify-center touch-none">
        
        {/* Shaded Mesh Wedge Behind the Ring (Static highlight wedge) */}
        <AnimatePresence>
          {isOpen && isPartnered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none z-10"
              style={{
                transform: side === 'right' ? 'scaleX(-1)' : 'none',
              }}
            >
              <svg width="130" height="130" viewBox="-65 -65 130 130" className="overflow-visible">
                <defs>
                  {/* Diagonally striped mesh pattern exactly like reference image */}
                  <pattern 
                    id="striped-mesh-mini" 
                    width="4" 
                    height="4" 
                    patternTransform="rotate(45 0 0)" 
                    patternUnits="userSpaceOnUse"
                  >
                    <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.75" />
                  </pattern>
                </defs>
                {/* 60 degree wedge pointing right (from -30 to 30 degrees) */}
                <path 
                  d="M 56.29 -32.5 A 65 65 0 0 1 56.29 32.5 L 22.52 13 A 26 26 0 0 0 22.52 -13 Z" 
                  fill="url(#striped-mesh-mini)"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rotating Ring containing icons (extremely thin and subtle) */}
        <AnimatePresence>
          {isOpen && isPartnered && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="absolute z-20"
            >
              <motion.div 
                style={{ rotate: rotation }}
                className="w-[130px] h-[130px] rounded-full border border-white/10 bg-[#121212]/30 backdrop-blur-[1px] relative flex items-center justify-center"
              >
                {items.map((item, i) => {
                  const baseAngle = i * angleStep;
                  const radius = 48; // Distance from center to icon center
                  
                  // Calculate positioning around the ring
                  const x = Math.cos((baseAngle * Math.PI) / 180) * radius;
                  const y = Math.sin((baseAngle * Math.PI) / 180) * radius;

                  const isActive = i === activeIndex;

                  return (
                    <div
                      key={item.id}
                      className="absolute flex items-center justify-center"
                      style={{
                        left: `calc(50% + ${x - 14}px)`, // half of 28px icon button
                        top: `calc(50% + ${y - 14}px)`,
                      }}
                    >
                      <motion.button
                        style={{ rotate: iconRotation }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(i);
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border ${
                          isActive 
                            ? 'bg-text-primary text-bg-primary border-white shadow-[0_0_10px_rgba(255,255,255,0.4)] scale-105' 
                            : 'bg-[#141414]/95 text-text-secondary border-white/5 hover:text-text-primary hover:bg-[#1c1c1c]'
                        }`}
                      >
                        <item.icon size={12} />
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Profile Knob (Static Center Button) */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative z-30 w-12 h-12 rounded-full overflow-hidden border-[4px] border-[#121212] bg-[#1a1a1a] shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex items-center justify-center transition-transform hover:scale-105`}
          animate={{ scale: isOpen ? 1.05 : 1 }}
        >
          {isPartnered ? (
            avatarUrl ? (
              <Image src={avatarUrl} alt={name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-primary font-serif text-xs">
                {name ? name.substring(0, 1).toUpperCase() : 'P'}
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary bg-[#1a1a1a]">
              <Users size={14} className="mb-0.5 text-text-secondary/60" />
              <span className="text-[7px] font-mono tracking-tighter">Add</span>
            </div>
          )}
        </motion.button>

        {/* Curved Connection Path & Sub-menu items expanding to the side */}
        <AnimatePresence>
          {isOpen && activeItem && isPartnered && (
            <motion.div
              initial={{ opacity: 0, x: side === 'left' ? 15 : -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: side === 'left' ? 10 : -10 }}
              transition={{ delay: 0.05 }}
              className={`absolute top-1/2 -translate-y-1/2 z-50 flex items-center min-w-[170px] ${
                side === 'left' ? 'left-[85px]' : 'right-[85px] flex-row-reverse'
              }`}
            >
              {(() => {
                const subCount = activeItem.subItems.length;
                const mid = Math.floor(subCount / 2);
                const displayItems = [
                  ...activeItem.subItems.slice(0, mid).map(s => ({ ...s, isMain: false })),
                  { label: activeItem.label, icon: activeItem.icon, href: activeItem.href, isMain: true },
                  ...activeItem.subItems.slice(mid).map(s => ({ ...s, isMain: false }))
                ];
                const centerIdx = mid;

                return (
                  <>
                    {/* Connector SVG Line */}
                    <svg 
                      width="30" 
                      height="100" 
                      viewBox="0 0 30 100" 
                      className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                        side === 'left' ? '-left-[20px]' : '-right-[20px] rotate-180'
                      } overflow-visible z-0`}
                    >
                      <path 
                        d="M 0 50 L 15 50 C 22 50, 25 50, 30 50" 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.25)" 
                        strokeWidth="1"
                      />
                      <circle cx="30" cy="50" r="1.5" fill="rgba(255,255,255,0.5)" />
                    </svg>

                    {/* Scrollable Staggered Pills */}
                    <div className="submenu-container overflow-y-auto no-scrollbar max-h-[160px] overscroll-contain py-4 px-2 flex flex-col gap-2 relative z-10 w-full scroll-smooth">
                      {displayItems.map((item, idx) => {
                        const baseOffset = Math.abs(idx - centerIdx) * 14;
                        const targetX = side === 'left' ? baseOffset : -baseOffset;
                        const startX = side === 'left' ? targetX - 15 : targetX + 15;

                        return (
                          <motion.button
                            key={`${activeItem.label}-${idx}`}
                            initial={{ opacity: 0, x: startX }}
                            animate={{ opacity: 1, x: targetX }}
                            transition={{ delay: 0.04 * idx, type: 'spring', stiffness: 350, damping: 25 }}
                            onClick={() => {
                              router.push(item.href);
                              setIsOpen(false);
                            }}
                            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-[12px] transition-all duration-300 shadow-lg backdrop-blur-md border ${
                              item.isMain 
                                ? 'bg-[#252525]/80 border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.03)] scale-[1.02]' 
                                : 'bg-[#141414]/70 border-white/5 text-text-secondary hover:bg-[#1f1f1f]/90 hover:text-text-primary hover:border-white/10'
                            }`}
                            style={{
                              width: 'max-content',
                              alignSelf: side === 'left' ? 'flex-start' : 'flex-end',
                            }}
                          >
                            {side === 'left' && <item.icon size={item.isMain ? 13 : 11} className={item.isMain ? 'text-text-primary' : 'text-text-secondary opacity-70'} />}
                            <span className={`font-medium ${item.isMain ? 'font-serif text-[11.5px] tracking-wide' : 'font-sans text-[10.5px]'}`}>
                              {item.label}
                            </span>
                            {side === 'right' && <item.icon size={item.isMain ? 13 : 11} className={item.isMain ? 'text-text-primary' : 'text-text-secondary opacity-70'} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connect Action for Unpartnered Partner Dial */}
        <AnimatePresence>
          {isOpen && !isPartnered && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute right-[85px] top-1/2 -translate-y-1/2 flex flex-col gap-2 min-w-[170px] z-50 items-end"
            >
              <button 
                onClick={() => {
                  router.push('/connect');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 bg-[#141414]/95 backdrop-blur-xl border border-white/5 rounded-xl text-text-primary hover:bg-[#1a1a1a] transition-colors shadow-lg"
              >
                <Plus size={13} />
                <span className="font-serif text-[11px] tracking-wide font-medium">Connect Partner</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
