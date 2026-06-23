import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Floor */}
      <motion.line x1="10" y1="85" x2="90" y2="85" strokeOpacity="0.3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
      
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
        {/* Head Profile */}
        <path d="M 52 28 C 52 23, 56 20, 60 20 C 65 20, 68 24, 68 28 C 68 32, 66 34, 63 36 C 58 38, 52 34, 52 28 Z" />
        
        {/* Flowing Hair */}
        <motion.g animate={{ skewX: [0, -4, 0], x: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ transformOrigin: "55px 25px" }}>
          <path d="M 56 20 C 45 20, 38 35, 35 50 C 33 60, 36 68, 42 75" />
          <path d="M 50 25 C 42 32, 40 45, 40 60" />
        </motion.g>

        {/* Breathing Torso */}
        <motion.g animate={{ y: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
          {/* Back curve */}
          <path d="M 48 35 C 40 45, 42 60, 48 72" /> 
          {/* Front hugging knees */}
          <path d="M 58 36 C 62 45, 68 50, 72 55" />
          
          {/* Arms wrapped around knees */}
          <path d="M 52 40 C 60 50, 72 55, 75 62 C 72 66, 66 65, 60 62 L 55 55" />
        </motion.g>

        {/* Legs folded up */}
        <path d="M 48 72 L 75 72 C 80 72, 85 65, 80 58 C 75 52, 65 55, 58 65" />
        
        {/* Feet and shoes */}
        <path d="M 75 72 C 80 74, 84 78, 82 82 C 80 85, 75 85, 72 85 L 68 85" />
      </motion.g>
    </svg>
  );
}
