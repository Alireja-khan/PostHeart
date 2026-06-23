import React from 'react';
import { motion } from 'framer-motion';

export default function BoySvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`}>
      {/* Live2D Waving Filter */}
      <svg width="0" height="0" className="absolute">
        <filter id="wavy-boy">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" result="noise">
            <animate attributeName="baseFrequency" values="0.01 0.02; 0.015 0.03; 0.01 0.02" dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Base Body (Torso and Legs) - continuously waving shirt */}
      <motion.img 
        src="/boy_transparent.png" 
        alt="Boy"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 30%, 100% 30%, 100% 100%, 0 100%)',
          filter: 'url(#wavy-boy)'
        }}
      />

      {/* Head - moving on a loop */}
      <motion.img 
        src="/boy_transparent.png" 
        alt="Boy Head"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 30%)',
          transformOrigin: '50% 30%'
        }}
        animate={{ rotate: [0, -3, 0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />
    </div>
  );
}
