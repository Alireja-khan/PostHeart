'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import BoySvg from './BoySvg';
import GirlSvg from './GirlSvg';

const WaitingFigure = ({ gender, facing }: { gender: string | null, facing: 'left' | 'right' }) => {
  const isGirl = gender === 'female';
  const SvgComponent = isGirl ? GirlSvg : BoySvg;
  
  return (
    <div className={`w-20 h-28 md:w-24 md:h-32 text-white pointer-events-none transition-transform duration-500 ${facing === 'left' ? 'scale-x-[-1]' : ''}`}>
      <SvgComponent className="w-full h-full" />
    </div>
  );
};

export default function GlobalBirdTracker() {
  const [inTransitLetter, setInTransitLetter] = useState<Record<string, any> | null>(null);
  const [hasReached, setHasReached] = useState(false);
  const [genders, setGenders] = useState<{userGender: string | null, partnerGender: string | null}>({userGender: null, partnerGender: null});
  const [particles, setParticles] = useState<{x: number, y: number, destY: number, duration: number, delay: number}[]>([]);

  // We still fetch the letter to know who is who, but the animation is now continuous
  useEffect(() => {
    // Initialize particles here to avoid Math.random() during render (react-hooks/purity)
    setParticles(Array.from({ length: 15 }).map(() => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * 160,
      destY: Math.random() * -50 - 20,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2
    })));

    const fetchLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setGenders({ userGender: json.userGender, partnerGender: json.partnerGender });
            if (json.data) {
              setInTransitLetter(json.data);
            } else {
              setInTransitLetter(null);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching global in-transit letter:", error);
      }
    };

    fetchLetter();
    const intervalId = setInterval(fetchLetter, 30000);
    
    window.addEventListener('letter-posted', fetchLetter);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('letter-posted', fetchLetter);
    };
  }, []);

  const progress = useMotionValue(0);

  // Run a continuous 60FPS loop for perfectly smooth time-based interpolation
  useAnimationFrame(() => {
    if (!inTransitLetter) return;

    const now = Date.now();
    const start = new Date(inTransitLetter.createdAt as string).getTime();
    const end = new Date(inTransitLetter.deliverAt as string).getTime();

    if (now >= end) {
      progress.set(100);
      if (!hasReached) setHasReached(true);
    } else if (now <= start) {
      progress.set(0);
      if (hasReached) setHasReached(false);
    } else {
      progress.set(((now - start) / (end - start)) * 100);
      if (hasReached) setHasReached(false);
    }
  });

  // Map the 0-100 progress directly into a CSS calc value continuously
  const birdLeftStyle = useTransform(progress, (p) => {
    const position = 15 + (p * 0.7); // 15% to 85%
    if (!inTransitLetter) return `calc(15% - 28px)`;
    return inTransitLetter.isSender ? `calc(${position}% - 28px)` : `calc(${100 - position}% - 28px)`;
  });

  const currentUserGender = inTransitLetter ? (inTransitLetter.isSender ? inTransitLetter.senderGender : inTransitLetter.receiverGender) : genders.userGender;
  const partnerGender = inTransitLetter ? (inTransitLetter.isSender ? inTransitLetter.receiverGender : inTransitLetter.senderGender) : genders.partnerGender;

  return (
    <div className="absolute top-0 left-0 right-0 h-40 z-50 pointer-events-none overflow-hidden">
      
      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          initial={{ 
            x: p.x, 
            y: p.y 
          }}
          animate={{ 
            y: [null, p.destY],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: p.delay 
          }}
        />
      ))}

      {/* Current User Figure (Always Left) */}
      <div className="absolute left-6 md:left-16 bottom-4 z-30">
        <WaitingFigure gender={currentUserGender} facing="right" />
      </div>

      {/* Partner Figure (Always Right) */}
      <div className="absolute right-6 md:right-16 bottom-4 z-30">
        <WaitingFigure gender={partnerGender} facing="left" />
      </div>

      {/* The Bird - Progress Tracking */}
      {inTransitLetter && !hasReached && (
        <motion.div 
          className="absolute top-8 w-14 h-14 z-20"
          style={{ left: birdLeftStyle }}
        >
          {/* Bobbing Motion */}
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            {/* Realistic Bird Silhouette Animation */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]" style={{ transform: inTransitLetter.isSender ? "scaleX(-1)" : "none" }}>
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
              className="absolute bottom-2 right-[18px] w-[14px] h-[10px] bg-white rounded-sm shadow-lg flex flex-col overflow-hidden"
              animate={{ rotate: [-12, 12, -12], transformOrigin: "top center" }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              {/* Envelope flap detail */}
              <div className="w-full h-[4px] border-b border-gray-300 relative">
                <div className="absolute top-0 left-0 right-0 h-full bg-red-400/20" style={{ clipPath: "polygon(0 0, 50% 100%, 100% 0)" }}></div>
              </div>
              {/* Envelope seal */}
              <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[4px] h-[4px] bg-red-500 rounded-full shadow-md"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
