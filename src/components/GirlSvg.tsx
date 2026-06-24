import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: any) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${props.className || ''}`} style={{ transform: 'scaleX(-1)' }}>
      <motion.div 
        className="relative w-full h-full"
        style={{ transformOrigin: '50% 100%' }}
        animate={{ 
          y: [0, -3, 0],
          scale: [1, 1.01, 1]
        }}
        transition={{ 
          duration: 4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <img 
          src="/girl_transparent.png" 
          alt="Girl"
          className="w-[90%] h-[90%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        />
      </motion.div>
    </div>
  );
}
