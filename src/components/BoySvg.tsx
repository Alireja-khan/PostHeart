import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      {/* Outer container with very subtle sway to simulate wind on the shirt */}
      <motion.div 
        className="absolute inset-0"
        style={{ transformOrigin: '50% 100%' }}
        animate={{ skewX: [0, -1, 0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      >
        {/* Base Body (Torso and Legs) - Breathing effect */}
        <motion.img 
          src="/boy_transparent.png" 
          alt="Boy"
          className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
          style={{ 
            clipPath: 'polygon(0 27%, 100% 27%, 100% 100%, 0 100%)',
            transformOrigin: '50% 50%'
          }}
          animate={{ scaleY: [1, 1.01, 1, 0.99, 1], scaleX: [1, 0.99, 1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />

        {/* Head - Slight natural movement and blinking simulation (if applicable) */}
        <motion.img 
          src="/boy_transparent.png" 
          alt="Boy Head"
          className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
            transformOrigin: '50% 30%'
          }}
          animate={{ rotate: [0, -2, 0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>
    </div>
  );
}
