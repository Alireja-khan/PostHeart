'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, HeartHandshake, Sparkles, Mail, Wind, Flame, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AntiqueEmptyDeskProps {
  activeTab: 'received' | 'sent';
  onSwitchTab?: (tab: 'received' | 'sent') => void;
  onPreviewEnvelope?: () => void;
  receivedCount?: number;
  sentCount?: number;
}

export default function AntiqueEmptyDesk({
  activeTab,
  onSwitchTab,
  onPreviewEnvelope,
  receivedCount = 0,
  sentCount = 0,
}: AntiqueEmptyDeskProps) {
  const router = useRouter();
  // Candle state: false = extinguished (default per user prompt), true = lit
  const [isCandleLit, setIsCandleLit] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 py-6 sm:py-10 z-10">
      {/* Tab Switcher on Top */}
      {onSwitchTab && (
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-full bg-[#181512]/90 border border-[#382f25]/80 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md mb-6 sm:mb-10">
          <button
            onClick={() => onSwitchTab('received')}
            className={`font-serif text-xs sm:text-sm tracking-wider px-4 sm:px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'received'
                ? 'bg-[#c2410c] text-[#fbf8f3] font-semibold shadow-md'
                : 'text-[#9c9182] hover:text-[#e8dfd1] hover:bg-[#25201a]'
            }`}
          >
            <span>Whispers Received</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              activeTab === 'received' ? 'bg-black/30 text-white' : 'bg-[#2a241c] text-[#8e8477]'
            }`}>
              {receivedCount}
            </span>
          </button>

          <button
            onClick={() => onSwitchTab('sent')}
            className={`font-serif text-xs sm:text-sm tracking-wider px-4 sm:px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent'
                ? 'bg-[#c2410c] text-[#fbf8f3] font-semibold shadow-md'
                : 'text-[#9c9182] hover:text-[#e8dfd1] hover:bg-[#25201a]'
            }`}
          >
            <span>Echoes Sent</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              activeTab === 'sent' ? 'bg-black/30 text-white' : 'bg-[#2a241c] text-[#8e8477]'
            }`}>
              {sentCount}
            </span>
          </button>
        </div>
      )}

      {/* Antique Desk Illustration Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-2xl p-6 sm:p-10 border border-[#382f25]/70 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col items-center"
        style={{
          background: isCandleLit
            ? 'radial-gradient(ellipse at 50% 35%, #2a1f16 0%, #15120f 55%, #0b0908 100%)'
            : 'radial-gradient(ellipse at 50% 35%, #1a1612 0%, #120f0d 60%, #0a0807 100%)',
          transition: 'background 0.8s ease-in-out'
        }}
      >
        {/* Subtle Antique Desk Wood Texture Grain Lines */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #f5e6d3 0, #f5e6d3 1px, transparent 0, transparent 16px)`,
          }}
        />

        {/* Ambient Candlelit Glow Effect */}
        <AnimatePresence>
          {isCandleLit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.6 }}
              className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-b from-[#f59e0b]/25 via-[#ea580c]/10 to-transparent blur-3xl pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Brass Desk Corner Ornaments */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8b7355]/40 rounded-tl pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8b7355]/40 rounded-tr pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#8b7355]/40 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#8b7355]/40 rounded-br pointer-events-none" />

        {/* Interactive Candle & Antique Props Section */}
        <div className="relative flex items-center justify-center gap-6 sm:gap-12 my-2 sm:my-4 z-10">
          
          {/* 1. Vintage Inkpot & Feather Quill */}
          <div className="flex flex-col items-center">
            <svg 
              viewBox="0 0 100 120" 
              className="w-20 h-24 sm:w-24 sm:h-28 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
            >
              {/* Slanted Feather Quill */}
              <g transform="rotate(-28 45 40)">
                {/* Feather Stem / Shaft */}
                <path d="M45,10 C44,35 43,65 42,95" stroke="#e8dfd1" strokeWidth="2.5" strokeLinecap="round" />
                {/* Feather Vane Left */}
                <path d="M45,15 Q30,35 44,70 Q32,50 43,80" fill="rgba(235, 226, 212, 0.45)" />
                {/* Feather Vane Right */}
                <path d="M45,15 Q60,35 44,70 Q56,50 43,80" fill="rgba(215, 203, 186, 0.35)" />
                {/* Feather Tip / Nib */}
                <polygon points="41,95 43,95 42,106" fill="#c5a059" />
              </g>

              {/* Inkpot Brass Rim */}
              <ellipse cx="65" cy="92" rx="16" ry="6" fill="#8c734b" />
              <ellipse cx="65" cy="91" rx="14" ry="4.5" fill="#423420" />
              {/* Ink Well Glass Body */}
              <path d="M51,92 C51,108 55,116 65,116 C75,116 79,108 79,92 Z" fill="#141416" stroke="#5a4931" strokeWidth="1.5" />
              {/* Deep Sepia Ink Reflection */}
              <ellipse cx="65" cy="94" rx="10" ry="3" fill="#09090b" />
              <ellipse cx="67" cy="93" rx="4" ry="1.5" fill="rgba(255,255,255,0.2)" />
            </svg>
            <span className="text-[10px] font-serif text-[#7d7162] tracking-wider mt-1 opacity-70">
              Quill & Ink
            </span>
          </div>

          {/* 2. Central Candle (Extinguished with curling smoke or Lit) */}
          <div 
            className="relative flex flex-col items-center cursor-pointer group"
            onClick={() => setIsCandleLit(!isCandleLit)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            title="Click to light or extinguish the candle"
          >
            {/* Click Tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute -top-9 whitespace-nowrap bg-[#1f1a14] border border-[#524333] text-[#dcd3c5] text-[11px] font-serif px-3 py-1 rounded-full shadow-lg pointer-events-none z-30"
                >
                  {isCandleLit ? 'Touch to blow out candle' : 'Touch to light candle'}
                </motion.div>
              )}
            </AnimatePresence>

            <svg 
              viewBox="0 0 120 160" 
              className="w-24 h-32 sm:w-28 sm:h-38 drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]"
            >
              {/* Filter for smoke blur */}
              <defs>
                <filter id="smokeBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff4500" stopOpacity="1" />
                  <stop offset="40%" stopColor="#ea580c" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="flameInner" cx="50%" cy="60%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#ffea79" />
                  <stop offset="70%" stopColor="#ff7b00" />
                  <stop offset="100%" stopColor="#e63900" />
                </radialGradient>
              </defs>

              {/* SMOKE / FLAME RENDER */}
              {!isCandleLit ? (
                /* EXTINQUISHED SMOKE TRAILS */
                <g filter="url(#smokeBlur)">
                  {/* Smoke Trail 1 */}
                  <motion.path
                    d="M60,60 C58,45 68,35 62,20 C58,8 65,0 60,-15"
                    fill="none"
                    stroke="rgba(215, 205, 190, 0.4)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0.2, opacity: 0.3 }}
                    animate={{
                      pathLength: [0.2, 0.9, 0.3],
                      opacity: [0.2, 0.6, 0.15],
                      x: [0, 4, -4, 0],
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Smoke Trail 2 */}
                  <motion.path
                    d="M59,62 C63,48 54,38 61,24 C67,12 58,2 64,-10"
                    fill="none"
                    stroke="rgba(240, 230, 215, 0.3)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0.3, opacity: 0.2 }}
                    animate={{
                      pathLength: [0.3, 1, 0.2],
                      opacity: [0.1, 0.45, 0.1],
                      x: [0, -5, 3, 0],
                    }}
                    transition={{
                      duration: 3.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                  />
                  {/* Smoke Trail 3 - subtle wisp */}
                  <motion.path
                    d="M60,61 C56,50 63,40 59,28 C55,18 62,8 58,-4"
                    fill="none"
                    stroke="rgba(180, 170, 155, 0.25)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    animate={{
                      opacity: [0.15, 0.4, 0.1],
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  />
                </g>
              ) : (
                /* LIT FLICKERING FLAME */
                <g>
                  {/* Outer Flame Glow */}
                  <motion.circle
                    cx="60"
                    cy="45"
                    r="18"
                    fill="rgba(245, 158, 11, 0.25)"
                    animate={{
                      scale: [1, 1.15, 0.95, 1.08, 1],
                      opacity: [0.4, 0.7, 0.35, 0.6, 0.4]
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Flame Teardrop */}
                  <motion.path
                    d="M60,30 C66,42 68,52 64,58 C60,62 56,58 56,58 C52,52 54,42 60,30 Z"
                    fill="url(#flameInner)"
                    animate={{
                      scaleY: [1, 1.08, 0.94, 1.05, 1],
                      scaleX: [1, 0.94, 1.06, 0.96, 1],
                      rotate: [0, 2, -2, 1, 0],
                    }}
                    style={{ transformOrigin: "60px 58px" }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Flame Core */}
                  <ellipse cx="60" cy="54" rx="2.5" ry="4.5" fill="#ffffff" opacity="0.9" />
                </g>
              )}

              {/* CANDLE WICK */}
              <path d="M60,60 Q59,64 60,68" stroke="#1f1812" strokeWidth="2" strokeLinecap="round" />
              
              {/* Glowing Ember Tip when extinguished */}
              {!isCandleLit && (
                <motion.circle 
                  cx="60" 
                  cy="60" 
                  r="2" 
                  fill="#ff4500" 
                  animate={{
                    opacity: [0.6, 1, 0.4, 0.9, 0.6],
                    scale: [0.9, 1.2, 0.85, 1.1, 0.9]
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              {/* WAX CANDLE BODY */}
              {/* Candle Cylinder Body */}
              <rect x="50" y="68" width="20" height="48" rx="2" fill="#d8cdbd" />
              {/* Cylinder Shading & Texture */}
              <rect x="50" y="68" width="5" height="48" fill="rgba(0,0,0,0.18)" />
              <rect x="65" y="68" width="5" height="48" fill="rgba(0,0,0,0.22)" />
              {/* Wax Drips on Front */}
              <path d="M52,68 C52,74 54,78 54,82 C54,84 52,84 52,82" stroke="#e8dfd1" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M62,68 C62,76 64,80 64,88 C64,90 62,90 62,88" stroke="#ede5d8" strokeWidth="3" strokeLinecap="round" />
              {/* Top Melted Wax Rim */}
              <ellipse cx="60" cy="68" rx="10" ry="3" fill="#e8dfd1" />
              <ellipse cx="60" cy="68" rx="7" ry="2" fill="#b8ab99" />

              {/* ANTIQUE BRASS CANDLESTICK HOLDER */}
              {/* Candle socket cup */}
              <path d="M47,114 C47,118 73,118 73,114 L71,118 L49,118 Z" fill="#8c734b" />
              {/* Drip pan rim */}
              <ellipse cx="60" cy="120" rx="24" ry="6" fill="#a48858" stroke="#5a472c" strokeWidth="1" />
              <ellipse cx="60" cy="119" rx="22" ry="4.5" fill="#c5a975" />
              {/* Holder Stem */}
              <rect x="56" y="120" width="8" height="12" fill="#8c734b" />
              {/* Curved Brass Loop Handle */}
              <path 
                d="M74,121 C88,122 92,135 84,142 C78,145 72,139 74,136" 
                fill="none" 
                stroke="#a48858" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              {/* Base Pedestal */}
              <ellipse cx="60" cy="134" rx="28" ry="7" fill="#8c734b" />
              <ellipse cx="60" cy="133" rx="26" ry="5.5" fill="#a88c5a" />
              <ellipse cx="60" cy="135" rx="30" ry="6" fill="#54432a" />
            </svg>

            {/* Candle Status Label */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isCandleLit ? 'bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]' : 'bg-[#e05638] animate-pulse'}`} />
              <span className="text-[10px] font-mono tracking-widest text-[#a89b88] uppercase">
                {isCandleLit ? 'Warm Candlelight' : 'Extinguished Ember'}
              </span>
            </div>
          </div>

          {/* 3. Vintage Sealed Envelope & Stamp */}
          <div className="flex flex-col items-center">
            <svg 
              viewBox="0 0 100 120" 
              className="w-20 h-24 sm:w-24 sm:h-28 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
            >
              {/* Envelope Body */}
              <g transform="rotate(8 50 85)">
                <rect x="15" y="60" width="70" height="46" rx="2" fill="#241e18" stroke="#4a3d2e" strokeWidth="1.2" />
                {/* Envelope Flap Lines */}
                <path d="M15,60 L50,84 L85,60" fill="none" stroke="#3b3023" strokeWidth="1" />
                <path d="M15,106 L42,80" fill="none" stroke="#2e251b" strokeWidth="1" />
                <path d="M85,106 L58,80" fill="none" stroke="#2e251b" strokeWidth="1" />
                {/* Postage Stamp */}
                <rect x="64" y="64" width="16" height="18" fill="#5a3d28" stroke="#8b6848" strokeWidth="1" strokeDasharray="2 1" />
                <circle cx="72" cy="73" r="4" fill="#a87f58" opacity="0.6" />
                {/* Postmark Circle */}
                <circle cx="62" cy="74" r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                <line x1="50" y1="74" x2="60" y2="74" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
                {/* Red Wax Seal */}
                <circle cx="50" cy="84" r="8.5" fill="#a32815" stroke="#751809" strokeWidth="1" />
                <circle cx="50" cy="84" r="6" fill="#851e0f" />
                <path d="M47,84 C47,82 50,81 50,83 C50,81 53,82 53,84 C53,86 50,87.5 50,87.5 C50,87.5 47,86 47,84 Z" fill="#f0a897" opacity="0.7" />
              </g>
            </svg>
            <span className="text-[10px] font-serif text-[#7d7162] tracking-wider mt-1 opacity-70">
              Wax Seal
            </span>
          </div>

        </div>

        {/* Poetic Inscription & Bengali Quote (per user request) */}
        <div className="text-center mt-6 sm:mt-8 max-w-lg z-10 px-2">
          {/* Main Poetic Title */}
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#f4efe6] tracking-wide leading-snug drop-shadow-md">
            আপনার ডাকবাক্স শান্ত হয়ে অপেক্ষা করছে...
          </h2>

          {/* Subtitle / Contextual Poetic Verse */}
          <p className="font-serif italic text-sm sm:text-base text-[#b8ab97] mt-3 leading-relaxed">
            {activeTab === 'received' ? (
              <>
                "কোনো চিঠি এখনো বাতাসে ভাসছে... হয়ত কোনো এক অলস বিকেলে চেনা হাতের লেখায় এসে কড়া নাড়বে।"
              </>
            ) : (
              <>
                "আপনি এখনও কোনো চিঠি পাঠাননি... স্মৃতির খামে এক টুকরো হৃদস্পন্দন বন্দি করতে আজই লিখে ফেলুন প্রথম অনুভূতি।"
              </>
            )}
          </p>

          {/* Vintage English Epigraph */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] font-serif text-[#7d7162] tracking-widest uppercase">
            <span className="h-px w-6 bg-[#473a2b]" />
            <span>Awaiting words carried upon the quiet wind</span>
            <span className="h-px w-6 bg-[#473a2b]" />
          </div>
        </div>

        {/* Action Buttons: Write Letter & Connect Partner */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 z-10 w-full">
          {/* 1. Write First Letter */}
          <button
            onClick={() => router.push('/write')}
            className="group relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#c2410c] to-[#9a3412] text-[#fdfbf7] font-serif text-sm tracking-wider shadow-[0_8px_25px_rgba(194,65,12,0.4)] hover:shadow-[0_12px_30px_rgba(194,65,12,0.6)] hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-[#ea580c]/40 font-semibold"
          >
            <PenTool className="w-4 h-4 transition-transform group-hover:-rotate-12" />
            <span>একটি চিঠি লিখুন</span>
          </button>

          {/* 2. Connect with Partner */}
          <button
            onClick={() => router.push('/connect')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1e1a15]/90 hover:bg-[#2c241c] text-[#ded5c7] hover:text-white font-serif text-sm tracking-wider border border-[#4a3d2e] hover:border-[#7a644c] shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#c2410c]" />
            <span>পার্টনার খুঁজুন</span>
          </button>

          {/* 3. Preview Envelope Animation Option */}
          {onPreviewEnvelope && (
            <button
              onClick={onPreviewEnvelope}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-[#251f18]/60 text-[#9e907d] hover:text-[#e8dfd1] font-serif text-xs tracking-wider border border-[#382d20] hover:border-[#5a4833] transition-all duration-300 cursor-pointer"
              title="Open the 3D envelope preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>খামের অ্যানিমেশন দেখুন</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
