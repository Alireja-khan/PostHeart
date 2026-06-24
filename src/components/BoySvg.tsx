import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: any) {
  return (
    <motion.div 
      className={`relative w-full h-full ${props.className || ''}`}
      animate={{ y: [-4, 4, -4], rotate: [-1, 1, -1] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      <img 
        src="/boy_transparent.png" 
        alt="Boy"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
      />
    </motion.div>
  );
}
