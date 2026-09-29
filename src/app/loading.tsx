'use client';

import BirdLoader from '@/components/BirdLoader';
import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-screen bg-[#0a0908] flex items-center justify-center relative overflow-hidden select-none p-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,65,12,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex items-center justify-center"
      >
        <BirdLoader className="w-16 h-16 text-[#c2410c]" />
      </motion.div>
    </div>
  );
}
