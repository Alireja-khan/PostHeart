import React from 'react';
import { motion } from 'framer-motion';

export default function GirlSvg(props: any) {
  return (
    <div className={`relative w-full h-full ${props.className || ''}`} style={{ transform: 'scaleX(-1)' }}>
      {/* Live2D Waving Filter */}
      <svg width="0" height="0" className="absolute">
        <filter id="wavy-girl">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" result="noise">
            <animate attributeName="baseFrequency" values="0.01 0.02; 0.02 0.04; 0.01 0.02" dur="3s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Torso - continuously waving */}
      <motion.img 
        src="/girl_transparent.png" 
        alt="Girl Torso"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 32%, 100% 32%, 100% 65%, 0 65%)',
          filter: 'url(#wavy-girl)'
        }}
      />

      {/* Head - moving on a loop */}
      <motion.img 
        src="/girl_transparent.png" 
        alt="Girl Head"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% 32%, 0 32%)',
          transformOrigin: '50% 32%'
        }}
        animate={{ rotate: [0, 10, 0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* Legs - swinging on a loop */}
      <motion.img 
        src="/girl_transparent.png" 
        alt="Girl Legs"
        className="absolute w-[90%] h-[90%] top-[10%] left-[5%] object-contain pointer-events-none drop-shadow-[0_0_2px_rgba(255,255,255,0.4)]"
        style={{ 
          clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)',
          transformOrigin: '50% 65%'
        }}
        animate={{ rotate: [0, -25, 0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
    </div>
  );
}
