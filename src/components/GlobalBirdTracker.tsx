'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [inTransitLetter, setInTransitLetter] = useState<any>(null);

  // We still fetch the letter to know who is who, but the animation is now continuous
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
    const intervalId = setInterval(fetchLetter, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (!inTransitLetter) return null;

  const { isSender, senderGender, receiverGender } = inTransitLetter;
  const currentUserGender = isSender ? senderGender : receiverGender;
  const partnerGender = isSender ? receiverGender : senderGender;

  // Premium floating particles array
  const particles = Array.from({ length: 15 });

  return (
    <div className="absolute top-0 left-0 right-0 h-40 z-50 pointer-events-none overflow-hidden">
      
      {/* Floating Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/40 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * 160 
          }}
          animate={{ 
            y: [null, Math.random() * -50 - 20],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 3 + Math.random() * 4, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 2 
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

      {/* The Bird - Continuous curved flight path loop */}
      <motion.div 
        className="absolute top-8 w-14 h-14 z-20"
        animate={{ 
          left: ["15%", "85%", "15%"], // Fly back and forth
          y: [0, 30, 0, 30, 0], // Curved dip in the middle
          scaleX: [1, 1, -1, -1, 1] // Flip bird direction
        }}
        transition={{ 
          duration: 10, 
          ease: "easeInOut",
          repeat: Infinity 
        }}
      >
        {/* Bobbing Motion */}
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full relative"
        >
          {/* Realistic Bird Silhouette Animation */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]">
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
    </div>
  );
}
