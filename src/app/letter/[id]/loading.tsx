'use client';

import BirdLoader from '@/components/BirdLoader';
import { motion } from 'framer-motion';

export default function LetterLoading() {
  return (
    <div className="w-full min-h-screen bg-[#0a0908] flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,65,12,0.12)_0%,transparent_70%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm"
      >
        <div className="w-16 h-16 rounded-full bg-[#181512] border border-[#382f25] flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
          <BirdLoader className="w-10 h-10 text-[#c2410c]" />
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <h2 className="font-serif text-lg sm:text-xl text-[#f5f0e6] tracking-wide animate-pulse">
            ডাকপিয়ন চিঠিটি নিয়ে আসছে...
          </h2>
          <p className="font-mono text-xs text-[#a89b88] tracking-widest uppercase">
            Unfolding your private letter
          </p>
        </div>

        <div className="w-48 h-0.5 bg-[#25201a] rounded-full overflow-hidden mt-3 relative">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#c2410c] to-transparent"
          />
        </div>
      </motion.div>
    </div>
  );
}
