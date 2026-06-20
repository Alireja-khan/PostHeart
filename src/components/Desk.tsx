'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowUpRight } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface Letter {
  id: string;
  content: string;
  sender: User;
  receiver: User | null;
}

interface DeskProps {
  initialLetters: Letter[];
}

export default function Desk({ initialLetters }: DeskProps) {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  return (
    <div className="w-full min-h-full bg-[#f9f8f6] p-8 lg:p-12">
      
      {/* Page Header */}
      <div className="mb-10 max-w-5xl mx-auto">
        <span className="text-[10px] tracking-widest text-[#707070] uppercase font-semibold">Dashboard</span>
        <h2 className="font-serif text-4xl font-bold text-[#1a1a1a] mt-1">My Mailbox</h2>
        <p className="text-sm text-[#707070] mt-2">
          A collection of letters and private thoughts shared between you.
        </p>
      </div>

      {/* Grid of clean modern cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialLetters.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white border border-[#e6e4df] rounded-lg p-8">
            <Mail size={32} className="text-[#c2410c] mb-3 opacity-60" />
            <p className="font-serif italic text-[#707070] text-base">
              The mailbox is currently empty.
            </p>
          </div>
        ) : (
          initialLetters.map((letter) => (
            <motion.div
              key={letter.id}
              onClick={() => setSelectedLetter(letter)}
              className="bg-white border border-[#e6e4df] rounded-lg p-6 flex flex-col justify-between h-64 cursor-pointer card-shadow card-hover-shadow relative group"
            >
              {/* Card top details */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] tracking-wider text-[#707070] uppercase font-medium">Letter</span>
                  <div className="text-[#707070] group-hover:text-[#c2410c] transition-colors">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1a1a1a] mb-1 group-hover:text-[#c2410c] transition-colors">
                  To {letter.receiver?.name || "My Love"}
                </h3>
                <span className="text-[11px] text-[#707070] font-medium">From {letter.sender.name}</span>
                
                {/* Content snippet */}
                <p className="text-xs text-[#707070]/90 leading-relaxed mt-4 line-clamp-3 font-sans">
                  {letter.content}
                </p>
              </div>

              {/* Card footer date indicator */}
              <div className="border-t border-[#e6e4df]/60 pt-3 mt-4 flex justify-between items-center text-[10px] text-[#707070]/60">
                <span>Dear You Space</span>
                <span>Click to read</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Spaced Elegant Reading Overlay Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLetter(null)}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-lg w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 text-[#707070] hover:text-[#1a1a1a] p-1.5 rounded-full hover:bg-stone-50 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="border-b border-[#e6e4df] pb-4 mb-6">
                    <span className="text-[10px] tracking-widest text-[#707070] uppercase font-semibold">Private Correspondence</span>
                    <h3 className="font-serif text-2xl font-bold text-[#1a1a1a] mt-1">
                      To {selectedLetter.receiver?.name || "My Love"}
                    </h3>
                  </div>

                  {/* Letter content in elegant serif */}
                  <div className="font-serif text-lg text-[#1a1a1a] leading-relaxed whitespace-pre-wrap select-text selection:bg-[#c2410c]/10 pr-2 max-h-[50vh] overflow-y-auto">
                    {selectedLetter.content}
                  </div>
                </div>

                <div className="mt-10 pt-4 border-t border-[#e6e4df]/60 flex justify-between items-center text-[#707070]">
                  <span className="text-xs font-serif italic">With love,</span>
                  <span className="font-serif text-base font-semibold text-[#c2410c]">{selectedLetter.sender.name}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
