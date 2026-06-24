import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`} style={{ transform: 'scaleX(-1)' }}>
      <motion.div 
        className="absolute inset-0"
        style={{ transformOrigin: '50% 65%' }}
        // Very subtle overall wind sway
        animate={{ skewX: [0, 1, 0, -1, 0] }}
        transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
      >
        {/* Torso - Natural Breathing */}
        <motion.img 
          src="/girl_transparent.png" 
          alt="Girl Torso"
          className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
          style={{ 
            clipPath: 'polygon(0 29%, 100% 29%, 100% 68%, 0 68%)',
            transformOrigin: '50% 65%'
          }}
          animate={{ scaleY: [1, 1.015, 1, 0.985, 1] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        />

        {/* Head & Hijab - Moving softly as if affected by wind */}
        <motion.img 
          src="/girl_transparent.png" 
          alt="Girl Head"
          className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)',
            transformOrigin: '50% 32%'
          }}
          animate={{ rotate: [0, 3, 0, -2, 0], skewX: [0, -2, 0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Legs - Slowly swinging while waiting */}
        <motion.img 
          src="/girl_transparent.png" 
          alt="Girl Legs"
          className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
          style={{ 
            clipPath: 'polygon(0 62%, 100% 62%, 100% 100%, 0 100%)',
            transformOrigin: '50% 65%'
          }}
          animate={{ rotate: [0, -8, 0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
