"use client";

import { motion } from 'framer-motion';

interface BirdLoaderProps {
  className?: string;
}

export default function BirdLoader({ className = "w-10 h-10" }: BirdLoaderProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-full h-full relative"
      >
        {/* Realistic Bird Silhouette Animation */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          <path fill="currentColor">
            <animate 
              attributeName="d"
              dur="0.4s"
              repeatCount="indefinite"
              values="
                M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z;
                M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                M 30,50 Q 50,60 70,70 Q 60,60 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                M 30,50 Q 50,40 70,30 Q 60,40 50,50 Q 70,45 90,40 Q 70,50 50,60 Q 30,55 10,60 Q 20,50 30,50 Z;
                M 30,50 Q 50,20 70,10 Q 60,30 50,40 Q 70,40 90,45 Q 70,50 50,50 Q 30,55 10,60 Q 20,50 30,50 Z
              "
            />
          </path>
        </svg>
      </motion.div>
    </div>
  );
}
