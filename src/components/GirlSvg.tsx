import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: any) {
  return (
    <motion.div 
      className={`relative w-full h-full ${props.className || ''}`} 
      style={{ transform: 'scaleX(-1)' }}
      animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
    >
      <img 
        src="/girl_transparent.png" 
        alt="Girl"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
      />
    </motion.div>
  );
}
