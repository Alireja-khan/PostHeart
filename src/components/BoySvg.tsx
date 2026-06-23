import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 250" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {/* Pillar */}
      <line x1="30" y1="10" x2="30" y2="240" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="60" y1="10" x2="60" y2="240" strokeOpacity="0.4" strokeWidth="2" />
      
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        {/* Head Group: Moves Head */}
        <motion.g 
          animate={{ rotate: [0, 0, -8, -8, 0, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          style={{ originX: "90px", originY: "60px" }}
        >
          {/* Face/Neck */}
          <path d="M 85 70 C 80 70, 75 55, 80 45 C 85 35, 95 35, 100 45 C 105 55, 100 65, 90 65" fill="#f9f8f6" stroke="currentColor" />
          {/* Nose */}
          <path d="M 100 45 L 105 50 L 100 55" />
          {/* Cap */}
          <path d="M 75 40 C 75 25, 100 30, 95 45 Z" fill="#1a2035" stroke="currentColor" />
          <path d="M 75 40 L 65 45" strokeWidth="3" />
        </motion.g>

        {/* Torso & Shirt: Continuously Waving */}
        <motion.g 
          animate={{ skewX: [0, -3, 3, 0], scaleY: [1, 1.02, 0.98, 1] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ originX: "90px", originY: "100px" }}
        >
          {/* Shirt */}
          <path d="M 70 70 L 115 75 L 130 140 C 110 150, 70 140, 65 130 Z" fill="#1a2035" stroke="currentColor" />
          <path d="M 65 130 L 130 140" strokeOpacity="0.5" />
          {/* Crossbody Bag */}
          <path d="M 115 75 L 70 135" strokeWidth="6" stroke="#111" />
          <path d="M 50 110 C 40 130, 60 150, 80 140 C 70 120, 60 110, 50 110 Z" fill="#111" stroke="currentColor" />
        </motion.g>

        {/* Legs */}
        {/* Straight leg */}
        <path d="M 85 140 L 95 210 L 115 210 L 110 145" fill="#f9f8f6" stroke="currentColor" />
        {/* Bent leg against pillar */}
        <path d="M 85 140 L 60 170 L 60 190" fill="#f9f8f6" stroke="currentColor" strokeLinejoin="miter" />
        <path d="M 60 170 L 45 175" strokeWidth="2.5" />

        {/* Shoes */}
        <path d="M 95 210 C 90 220, 125 225, 125 215 L 115 210 Z" fill="#f9f8f6" stroke="currentColor" />
        <path d="M 45 175 C 40 185, 65 195, 65 185 L 60 180 Z" fill="#f9f8f6" stroke="currentColor" />

        {/* Static Arm (holding cup) */}
        <path d="M 75 80 L 65 110 L 80 115" strokeWidth="3" />
        <rect x="75" y="105" width="12" height="18" fill="#f9f8f6" stroke="currentColor" strokeWidth="2" />

        {/* Animated Arm (touches head occasionally) */}
        <motion.g 
          animate={{ rotate: [0, 0, 0, -110, -110, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          style={{ originX: "105px", originY: "85px" }}
        >
          {/* Upper Arm Sleeve */}
          <path d="M 100 75 L 125 95 L 115 110 L 95 85 Z" fill="#1a2035" stroke="currentColor" />
          {/* Lower Arm */}
          <path d="M 115 105 L 125 130" strokeWidth="3" />
          {/* Hand/Cigarette */}
          <circle cx="127" cy="133" r="3" fill="#f9f8f6" stroke="currentColor" />
          <line x1="129" y1="133" x2="136" y2="130" strokeWidth="1" />
        </motion.g>

      </motion.g>
    </svg>
  );
}
