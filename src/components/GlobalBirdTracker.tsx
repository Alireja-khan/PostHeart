'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WindowSilhouette = ({ gender, facing }: { gender: string | null, facing: 'left' | 'right' }) => {
  const isGirl = gender === 'female';
  
  return (
    <svg viewBox="0 0 100 120" className="w-12 h-16 drop-shadow-md pointer-events-none">
      {/* Solid background to hide bird behind it */}
      <rect x="10" y="10" width="80" height="100" rx="4" fill="#111111" stroke="#333333" strokeWidth="4" />
      {/* Sill */}
      <line x1="2" y1="110" x2="98" y2="110" stroke="#f9f8f6" strokeWidth="4" strokeLinecap="round" />
      
      {/* Person Silhouette */}
      <g transform={facing === 'left' ? 'translate(100, 0) scale(-1, 1)' : ''}>
        {/* Head */}
        <circle cx="45" cy="80" r="12" fill="#f9f8f6" />
        {/* Body */}
        <path d="M30 110 Q40 95 45 95 Q50 95 65 110 Z" fill="#f9f8f6" />
        {/* Hair */}
        {isGirl && (
          <path d="M33 80 Q30 95 38 105 Q45 105 45 95 Q40 80 33 80 Z" fill="#f9f8f6" />
        )}
      </g>
      
      {/* Stars/Moon if facing right, just to add that night sky vibe */}
      {facing === 'right' && (
        <g stroke="#a0a0a0" fill="none" strokeWidth="1.5">
          <path d="M75 25 Q85 30 80 40 Q70 35 75 25 Z" fill="#f9f8f6" stroke="none" opacity="0.8" />
          <circle cx="25" cy="30" r="1" fill="#f9f8f6" />
          <circle cx="85" cy="15" r="1" fill="#f9f8f6" />
        </g>
      )}
    </svg>
  );
};

export default function GlobalBirdTracker() {
  const [inTransitLetter, setInTransitLetter] = useState<any>(null);
  const [progressPercent, setProgressPercent] = useState(0);

  // Fetch the in-transit letter
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setInTransitLetter(json.data);
          } else {
            setInTransitLetter(null);
          }
        }
      } catch (error) {
        console.error("Error fetching global in-transit letter:", error);
      }
    };

    fetchLetter();
    // Poll every 30 seconds
    const intervalId = setInterval(fetchLetter, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Update progress bar
  useEffect(() => {
    if (!inTransitLetter) return;

    const updateProgress = () => {
      const now = new Date().getTime();
      const start = new Date(inTransitLetter.createdAt).getTime();
      const end = new Date(inTransitLetter.deliverAt).getTime();

      if (now >= end) {
        setProgressPercent(100);
      } else if (now <= start) {
        setProgressPercent(0);
      } else {
        const total = end - start;
        const current = now - start;
        setProgressPercent((current / total) * 100);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // update every minute
    return () => clearInterval(interval);
  }, [inTransitLetter]);

  if (!inTransitLetter) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-16 z-50 pointer-events-none">
      {/* Sender Window (Left) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
        <WindowSilhouette gender={inTransitLetter.senderGender} facing="right" />
      </div>

      {/* Receiver Window (Right) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
        <WindowSilhouette gender={inTransitLetter.receiverGender} facing="left" />
      </div>
      {/* The Bird */}
      <motion.div 
        className="absolute top-1/2 -translate-y-1/2 w-14 h-14 z-20"
        initial={{ left: `calc(${progressPercent}% - 28px)` }}
        animate={{ left: `calc(${progressPercent}% - 28px)` }}
        transition={{ ease: "linear", duration: 1 }}
      >
        {/* Bobbing Motion */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-full h-full relative"
        >
          {/* Realistic Bird Silhouette Animation */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" style={{ transform: "scaleX(-1)" }}>
            <path fill="currentColor">
              <animate 
                attributeName="d"
                dur="0.4s"
                repeatCount="indefinite"
                values="
                  M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z;
                  M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                  M 30,50 Q 50,60 70,70 Q 60,60 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                  M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                  M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z
                "
              />
            </path>
          </svg>

          {/* Dangling Letter Envelope */}
          <motion.div 
            className="absolute bottom-2 right-[18px] w-[14px] h-[10px] bg-white rounded-sm shadow-md flex flex-col overflow-hidden"
            animate={{ rotate: [-8, 8, -8], transformOrigin: "top center" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            {/* Envelope flap detail */}
            <div className="w-full h-[4px] border-b border-gray-300 relative">
              <div className="absolute top-0 left-0 right-0 h-full bg-red-400/20" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}></div>
            </div>
            {/* Envelope seal */}
            <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-red-500 rounded-full shadow-sm"></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
