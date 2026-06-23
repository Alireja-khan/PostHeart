import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      {/* Base Body (Torso and Legs) */}
      <motion.img 
        src="/boy_transparent.png" 
        alt="Boy"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)',
          transformOrigin: '50% 100%'
        }}
        animate={{ skewX: [0, -4, 0, 4, 0], scaleY: [1, 1.02, 1, 0.98, 1] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      />

      {/* Head - moving on a loop */}
      <motion.img 
        src="/boy_transparent.png" 
        alt="Boy Head"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)',
          transformOrigin: '50% 30%'
        }}
        animate={{ rotate: [0, -12, 0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
    </div>
  );
}
