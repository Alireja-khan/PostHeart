'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Music, Mic, X, AlertCircle } from 'lucide-react';

export default function WriteLetterPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [delay, setDelay] = useState('5m');
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInTransitLetter, setHasInTransitLetter] = useState(false);

  useEffect(() => {
    const checkActiveLetter = async () => {
      try {
        const res = await fetch('/api/letters/in-transit');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.isSender) {
            setHasInTransitLetter(true);
          }
        }
      } catch (err) {
        console.error("Error checking in-transit letters:", err);
      }
    };
    checkActiveLetter();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Please write a message first.');
      return;
    }

    setIsSubmitting(true);

    // Convert delay choice to minutes
    let delayMinutes = 24 * 60;
    if (delay === '5m') delayMinutes = 5;
    if (delay === '1h') delayMinutes = 60;
    if (delay === '7d') delayMinutes = 7 * 24 * 60;

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          receiverName: receiver || 'My Love',
          delayMinutes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setContent('');
        setReceiver('');
        window.dispatchEvent(new Event('letter-posted'));
        router.push('/scheduled');
      } else {
        alert(data.error || 'Failed to post letter');
      }
    } catch (err) {
      console.error('Error posting letter:', err);
      alert('An error occurred while posting your letter.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#111111] p-8 lg:p-12 select-none overflow-y-auto no-scrollbar flex items-center justify-center">
      
      {/* Main editor split view */}
      <div className="w-full max-w-3xl flex gap-8 items-stretch relative">
        
        {/* The Writing Pad card */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-sm flex flex-col justify-between h-[75vh] card-shadow">
          
          {/* Pad Header & Metadata options */}
          <div className="px-8 py-5 border-b border-[#333333] flex justify-between items-center bg-[#1a1a1a] rounded-t-lg">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Delivery Delay:</span>
              <select 
                value={delay} 
                onChange={(e) => setDelay(e.target.value)}
                className="bg-transparent border-b border-[#a0a0a0]/30 text-[#f9f8f6] font-serif focus:outline-none focus:border-[#c2410c] cursor-pointer text-xs pb-0.5"
              >
                <option value="5m" className="bg-[#1a1a1a]">5 Minutes</option>
                <option value="1h" className="bg-[#1a1a1a]">1 Hour</option>
                <option value="24h" className="bg-[#1a1a1a]">24 Hours</option>
                <option value="7d" className="bg-[#1a1a1a]">7 Days</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-[#a0a0a0] hover:text-[#c2410c] transition-colors"><Music size={16} /></button>
              <button className="text-[#a0a0a0] hover:text-[#c2410c] transition-colors"><Mic size={16} /></button>
              <button 
                onClick={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
                className={`transition-colors ${isMemoryPanelOpen ? 'text-[#c2410c]' : 'text-[#a0a0a0] hover:text-[#c2410c]'}`} 
              >
                <ImageIcon size={16} />
              </button>
            </div>
          </div>

          {/* Clean editor text area */}
          <div className="p-8 lg:p-10 flex-1 flex flex-col rounded-b-lg relative">
            {hasInTransitLetter && (
              <div className="absolute inset-0 z-10 bg-[#1a1a1a]/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center rounded-b-lg">
                <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#333333] max-w-sm flex flex-col items-center">
                  <AlertCircle className="text-[#c2410c] mb-4" size={32} />
                  <h3 className="font-serif text-[#f9f8f6] text-lg font-bold mb-2">Letter in Transit</h3>
                  <p className="text-sm text-[#a0a0a0] font-serif leading-relaxed">
                    You already have a letter on its way. Please wait for it to be delivered before sending another one.
                  </p>
                </div>
              </div>
            )}
            
            <input 
              type="text" 
              placeholder="To my love..." 
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={hasInTransitLetter}
              className="w-full bg-transparent border-none text-2xl text-[#f9f8f6] font-serif focus:outline-none mb-6 placeholder-[#f9f8f6]/25 border-b border-[#333333]/40 pb-2 font-bold disabled:opacity-50"
            />
            
            <textarea 
              placeholder="Write your heart out here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={hasInTransitLetter}
              className="w-full flex-1 bg-transparent border-none text-lg text-[#f9f8f6] font-serif leading-[3rem] focus:outline-none resize-none placeholder-[#f9f8f6]/20 disabled:opacity-50"
            />
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-[#333333] flex justify-end bg-[#1a1a1a] rounded-b-lg">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || hasInTransitLetter}
              className="flex items-center space-x-2 bg-[#c2410c] hover:bg-[#a5360a] text-white px-8 py-3 rounded-lg shadow-md transition-all text-xs font-serif uppercase tracking-widest font-bold disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Posting...' : 'Post Letter'}</span>
              <Send size={12} />
            </button>
          </div>
        </div>

        {/* Slide-in Memory panel inside the container bounds */}
        <AnimatePresence>
          {isMemoryPanelOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-sm flex flex-col overflow-hidden card-shadow"
            >
              <div className="p-6 border-b border-[#333333] flex justify-between items-center">
                <h2 className="font-serif text-[#f9f8f6] text-base font-bold">Interactive Memories</h2>
                <button onClick={() => setIsMemoryPanelOpen(false)} className="text-[#a0a0a0] hover:text-[#c2410c]"><X size={16}/></button>
              </div>
              
              <div className="p-6 text-[#a0a0a0] text-xs font-serif italic border-b border-[#333333]/60">
                Attach coordinates or photos to specific letter content.
              </div>
              
              <div className="flex-1 p-6 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-[#333333] m-6 hover:opacity-100 hover:border-[#c2410c] transition-all cursor-pointer bg-[#111111] rounded">
                <ImageIcon size={32} className="mb-2 text-[#c2410c]" />
                <p className="font-serif text-[11px] text-center text-[#a0a0a0]">Drop photo here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
