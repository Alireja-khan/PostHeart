import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 250" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Table */}
      <line x1="10" y1="110" x2="120" y2="110" strokeOpacity="0.4" strokeWidth="2" />
      {/* Chair / Ledge */}
      <line x1="90" y1="150" x2="190" y2="150" strokeOpacity="0.4" strokeWidth="2" />
      
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {/* Head Group: Looks up occasionally */}
        <motion.g 
          animate={{ rotate: [0, 0, 6, 6, 0, 0] }} 
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          style={{ originX: "120px", originY: "60px" }}
        >
          {/* Face */}
          <path d="M 110 50 C 105 55, 105 65, 115 70 C 120 70, 125 65, 125 55 C 125 45, 115 45, 110 50 Z" fill="#f9f8f6" stroke="currentColor" />
          <path d="M 110 60 L 105 60" /> {/* Nose */}
          {/* Hijab / Hair */}
          <path d="M 115 40 C 100 40, 130 80, 140 70 C 150 60, 140 40, 115 40 Z" fill="#111" stroke="currentColor" />
        </motion.g>

        {/* Torso & Shirt: Continuously Waving */}
        <motion.g 
          animate={{ skewX: [0, -2, 2, 0], scaleY: [1, 1.02, 0.98, 1] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ originX: "125px", originY: "100px" }}
        >
          {/* Shirt */}
          <path d="M 115 70 L 145 80 L 135 130 C 115 140, 95 120, 110 90 Z" fill="#f9f8f6" stroke="currentColor" />
          {/* Pants/Overalls top */}
          <path d="M 115 110 L 140 120 L 135 140 L 105 130 Z" fill="#111" stroke="currentColor" />
        </motion.g>

        {/* Legs */}
        {/* Static Leg (sitting on ledge) */}
        <path d="M 105 130 L 155 140 L 140 200 L 115 190 Z" fill="#111" stroke="currentColor" />
        
        {/* Animated Leg (swinging) */}
        <motion.g 
          animate={{ rotate: [0, -20, 0] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ originX: "145px", originY: "135px" }}
        >
          <path d="M 135 135 L 160 145 L 140 215 L 115 205 Z" fill="#111" stroke="currentColor" />
          {/* Shoe */}
          <path d="M 115 205 C 105 210, 110 225, 125 220 L 140 215 Z" fill="#f9f8f6" stroke="currentColor" />
          <path d="M 125 220 L 130 210" strokeWidth="1" /> {/* Shoe detail */}
        </motion.g>

        {/* Static Shoe (other leg) */}
        <path d="M 115 190 C 105 195, 110 210, 125 205 L 140 200 Z" fill="#f9f8f6" stroke="currentColor" />

        {/* Arms */}
        {/* Arm resting on table */}
        <path d="M 115 90 L 80 100 L 60 100" strokeWidth="4" strokeLinecap="round" />
        
        {/* Arm supporting chin */}
        <motion.g 
          animate={{ y: [0, 0, -3, -3, 0, 0] }} 
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
        >
          <path d="M 125 90 L 110 115 L 115 70" strokeWidth="4" strokeLinecap="round" />
        </motion.g>

      </motion.g>
    </svg>
  );
}
