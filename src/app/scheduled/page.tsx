'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, CheckCircle, ArrowRight, X } from 'lucide-react';

interface TransitLetter {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  createdAt: string;
  deliverAt: string;
  durationHours: number;
  isSender: boolean;
}

export default function ScheduledLettersPage() {
  const [letters, setLetters] = useState<TransitLetter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<TransitLetter | null>(null);

  // Load transit letters from database
  useEffect(() => {
    const fetchTransitLetters = async () => {
      try {
        const response = await fetch('/api/letters');
        const data = await response.json();
        if (data.success) {
          const now = Date.now();
          const transit = data.data
            .filter((letter: any) => {
              const deliverTime = new Date(letter.deliverAt || letter.createdAt).getTime();
              return deliverTime > now;
            })
            .map((letter: any) => ({
              id: letter.id,
              sender: letter.sender.name || 'Sarah',
              receiver: letter.receiver?.name || 'Alex',
              content: letter.content,
              createdAt: letter.createdAt,
              deliverAt: letter.deliverAt || new Date().toISOString(),
              durationHours: (new Date(letter.deliverAt || new Date()).getTime() - new Date(letter.createdAt).getTime()) / (3600 * 1000),
              isSender: letter.isSender
            }));
          setLetters(transit);
        }
      } catch (err) {
        console.error('Error fetching transit letters:', err);
      }
    };
    fetchTransitLetters();
  }, []);

  const calculateProgress = (letter: TransitLetter) => {
    const created = new Date(letter.createdAt).getTime();
    const deliver = new Date(letter.deliverAt).getTime();
    const now = Date.now();

    if (now >= deliver) return 100;
    if (now <= created) return 0;

    const total = deliver - created;
    const elapsed = now - created;
    return Math.round((elapsed / total) * 100);
  };

  const getRemainingTime = (letter: TransitLetter) => {
    const deliver = new Date(letter.deliverAt).getTime();
    const now = Date.now();
    const diffMs = deliver - now;

    if (diffMs <= 0) return 'Arrived';

    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffMins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));

    if (diffHours > 24) {
      return `${Math.ceil(diffHours / 24)} days remaining`;
    }
    return `${diffHours}h ${diffMins}m remaining`;
  };

  return (
    <div className="w-full h-full bg-[#111111] p-8 lg:p-12 overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="mb-10 max-w-4xl mx-auto">
        <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Active Logistics</span>
        <h1 className="font-serif text-4xl font-bold text-[#f9f8f6] mt-1">In Transit</h1>
        <p className="text-sm text-[#a0a0a0] mt-2">
          Letters currently traveling through the postal system.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {letters.map((letter) => {
          const progress = calculateProgress(letter);
          return (
            <div 
              key={letter.id} 
              className="bg-[#1a1a1a] border border-[#333333] p-6 rounded-lg shadow-sm flex flex-col justify-between h-64 card-shadow"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2 text-[#c2410c]">
                    <Clock size={14} />
                    <span className="text-[10px] tracking-wider uppercase font-semibold">{getRemainingTime(letter)}</span>
                  </div>
                  <span className="bg-[#1a1a1a] border border-[#333333] text-[#a0a0a0] text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                    {progress}% Complete
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#f9f8f6] mb-1">
                  To {letter.receiver}
                </h3>
                <span className="text-[10px] text-[#a0a0a0] font-medium">From {letter.sender}</span>
                
                <p className="text-xs text-[#a0a0a0]/90 leading-relaxed mt-4 line-clamp-2 font-sans italic break-words">
                  "{letter.content.replace(/^\[To: (.*?)\]\n+/, '').replace(/^\[Font: (.*?)\]\n+/, '')}"
                </p>
              </div>

              {/* Progress Slider */}
              <div className="mt-6 border-t border-[#333333]/60 pt-4 flex justify-between items-center">
                <div className="w-2/3 h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#344e41]" style={{ width: `${progress}%` }}></div>
                </div>
                <button 
                  onClick={() => setSelectedLetter(letter)}
                  className="flex items-center gap-1 text-[10px] text-[#344e41] hover:text-[#c2410c] font-serif uppercase tracking-widest transition-colors font-bold"
                >
                  <span>Track Status</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MINIMALIST LINE-DOT TRACKER MODAL */}
      <AnimatePresence>
        {selectedLetter && (
          <TransitTrackerModal 
            letter={selectedLetter} 
            progress={calculateProgress(selectedLetter)}
            onClose={() => setSelectedLetter(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

function TransitTrackerModal({ 
  letter, 
  progress, 
  onClose 
}: { 
  letter: TransitLetter; 
  progress: number;
  onClose: () => void;
}) {
  
  // Define 4 minimalist checkpoints along the delivery route
  const checkpoints = [
    { label: 'Posted', desc: 'At Sender Post Box', minVal: 0 },
    { label: 'In Transit', desc: 'Sorting Node', minVal: 20 },
    { label: 'Out for Delivery', desc: 'Local Postman Carriage', minVal: 60 },
    { label: 'Delivered', desc: 'Recipient Mailbox', minVal: 100 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#1a1a1a] rounded-lg w-full max-w-xl shadow-2xl p-8 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6] p-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="border-b border-[#333333] pb-4 mb-8 relative">
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Delivery Logistics</span>
          <h2 className="font-serif text-2xl font-bold text-[#f9f8f6] mt-1">
            Tracking to {letter.receiver}
          </h2>
          <p className="text-xs text-[#a0a0a0] mt-1 font-sans">
            From {letter.sender} • Posted {new Date(letter.createdAt).toLocaleDateString()}
          </p>

          {/* Cancel button if sender */}
          {letter.isSender && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm("Are you sure you want to cancel sending this letter? This action cannot be undone.")) {
                    const res = await fetch('/api/letters/in-transit', { method: 'DELETE' });
                    if (res.ok) {
                      window.location.reload();
                    }
                  }
                }}
                className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 rounded border border-red-900/50 uppercase tracking-wider font-semibold cursor-pointer"
              >
                Cancel Letter
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Line-Dot progress tracking layout */}
        <div className="relative py-12 flex justify-between items-center w-full max-w-md mx-auto">
          {/* Main Track Line */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-stone-100 z-0"></div>
          {/* Completed Line Fill */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 bg-[#344e41] transition-all duration-700 z-0"
            style={{ width: `${progress}%` }}
          ></div>

          {checkpoints.map((cp, idx) => {
            const isCompleted = progress >= cp.minVal;
            const isCurrent = progress >= cp.minVal && (idx === checkpoints.length - 1 || progress < checkpoints[idx + 1].minVal);

            return (
              <div key={idx} className="flex flex-col items-center relative z-10">
                {/* Checkpoint Dot */}
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-300 border-2 ${
                    isCompleted 
                      ? 'bg-[#344e41] border-[#344e41]' 
                      : 'bg-[#1a1a1a] border-[#333333]'
                  }`}
                >
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] animate-ping"></span>
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle size={10} className="text-white" />
                  )}
                </div>
                
                {/* Checkpoint labels absolute positioning below */}
                <div className="absolute top-7 flex flex-col items-center w-28 text-center pointer-events-none">
                  <span className={`text-[10px] font-serif font-bold ${isCompleted ? 'text-[#f9f8f6]' : 'text-[#a0a0a0]/60'}`}>
                    {cp.label}
                  </span>
                  <span className="text-[8px] text-[#a0a0a0]/50 font-sans mt-0.5 leading-none">
                    {cp.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed status status section */}
        <div className="mt-12 pt-6 border-t border-[#333333]/60 flex items-center justify-between text-xs text-[#a0a0a0] font-sans">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#c2410c]" />
            <span className="font-serif font-bold text-[#f9f8f6]">Transit Node</span>
          </div>
          <span>{progress}% Traveled • {Math.round((letter.durationHours * (100 - progress)) / 100)} hours remaining</span>
        </div>

      </motion.div>
    </motion.div>
  );
}
