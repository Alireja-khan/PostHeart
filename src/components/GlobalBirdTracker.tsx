'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WaitingFigure = ({ gender, facing }: { gender: string | null, facing: 'left' | 'right' }) => {
  const isGirl = gender === 'female';
  
  return (
    <div className={`w-8 h-8 md:w-10 md:h-10 text-[#f9f8f6] drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none transition-transform duration-500 ${facing === 'left' ? 'scale-x-[-1]' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {isGirl ? (
          /* Girl Silhouette: Flowing hair, looking up slightly, hugging knees */
          <g stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="45" cy="30" r="10" />
            {/* Long flowing hair */}
            <path d="M 38 22 C 20 30 25 55 35 65" />
            {/* Curved back */}
            <path d="M 40 40 C 25 60 35 85 35 85" />
            {/* Legs folded up */}
            <path d="M 35 85 L 75 85 L 65 55 C 60 45 50 45 40 50" />
            {/* Arms resting on knees */}
            <path d="M 40 50 L 65 60" />
          </g>
        ) : (
          /* Boy Silhouette: Leaning back casually, legs stretched slightly */
          <g stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="45" cy="30" r="10" />
            {/* Back leaning slightly */ }
            <path d="M 40 40 Q 30 65 40 85" />
            {/* One leg bent, one stretched */}
            <path d="M 40 85 L 85 85 M 40 85 L 65 65 L 50 55" />
            {/* Arms supporting leaning back */}
            <path d="M 40 45 L 25 70 L 30 85" />
          </g>
        )}
      </svg>
    </div>
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
      {/* Sender Figure (Left) */}
      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30">
        <WaitingFigure gender={inTransitLetter.senderGender} facing="right" />
      </div>

      {/* Receiver Figure (Right) */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-30">
        <WaitingFigure gender={inTransitLetter.receiverGender} facing="left" />
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
