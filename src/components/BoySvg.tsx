import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: any) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${props.className || ''}`}>
      <motion.div 
        className="relative w-full h-full"
        style={{ transformOrigin: '50% 100%' }}
        animate={{ 
          y: [0, -2.5, 0],
          scale: [1, 1.01, 1]
        }}
        transition={{ 
          duration: 4.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <img 
          src="/boy_transparent.png" 
          alt="Boy"
          className="w-[90%] h-[90%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        />
      </motion.div>
    </div>
  );
}
