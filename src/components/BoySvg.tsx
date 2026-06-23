import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Wall */}
      <motion.line x1="20" y1="10" x2="20" y2="90" strokeOpacity="0.3"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} />
      
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}>
        {/* Head Profile */}
        <path d="M 36 24 C 36 19, 40 16, 44 16 C 48 16, 52 19, 52 24 C 52 28, 48 30, 46 32 C 40 34, 36 30, 36 24 Z" />
        
        {/* Hair - subtle wind animation */}
        <motion.path d="M 36 24 C 34 18, 38 12, 45 14 C 48 15, 52 18, 52 22"
          animate={{ d: ["M 36 24 C 34 18, 38 12, 45 14 C 48 15, 52 18, 52 22", "M 36 24 C 35 17, 40 13, 46 15 C 49 16, 51 20, 52 22", "M 36 24 C 34 18, 38 12, 45 14 C 48 15, 52 18, 52 22"] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} />
          
        {/* Breathing Torso */}
        <motion.g animate={{ y: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
          {/* Back leaning on wall */}
          <path d="M 36 32 C 28 45, 26 55, 26 65" /> 
          {/* Front chest */}
          <path d="M 44 32 C 50 42, 50 55, 46 65" /> 
          {/* Waist line */}
          <path d="M 26 65 C 32 68, 40 68, 46 65" />
          
          {/* Hand in pocket / crossed arm */}
          <path d="M 38 36 C 46 45, 48 55, 40 60 L 35 55" /> 
        </motion.g>

        {/* Legs */}
        {/* Straight leg */}
        <path d="M 34 66 L 38 88" />
        <path d="M 42 66 L 46 88" />
        {/* Bent leg resting against wall */}
        <path d="M 34 66 L 24 75 L 20 80" />
        
        {/* Shoes */}
        <path d="M 38 88 C 42 88, 48 89, 48 91 C 48 93, 42 93, 38 93 Z" />
        <path d="M 20 80 C 17 82, 19 86, 24 85 L 26 83 Z" />
      </motion.g>
    </svg>
  );
}
