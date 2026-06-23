'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="absolute top-0 left-0 right-0 h-16 z-50 pointer-events-none overflow-hidden">
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
