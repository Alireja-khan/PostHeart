'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Image as ImageIcon, Send, Music, Mic, X } from 'lucide-react';

export default function WriteLetterPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [receiver, setReceiver] = useState('');
  const [delay, setDelay] = useState('24h');
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('Please write a message first.');
      return;
    }

    setIsSubmitting(true);

    // Convert delay choice to hours
    let hours = 24;
    if (delay === '1h') hours = 1;
    if (delay === '7d') hours = 168;

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          receiverName: receiver || 'My Love',
          delayHours: hours,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setContent('');
        setReceiver('');
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
    <div className="w-full h-full bg-[#f9f8f6] p-8 lg:p-12 select-none overflow-y-auto no-scrollbar flex items-center justify-center">
      
      {/* Main editor split view */}
      <div className="w-full max-w-3xl flex gap-8 items-stretch relative">
        
        {/* The Writing Pad card */}
        <div className="flex-1 bg-white border border-[#e6e4df] rounded-lg shadow-sm flex flex-col justify-between h-[75vh] card-shadow">
          
          {/* Pad Header & Metadata options */}
          <div className="px-8 py-5 border-b border-[#e6e4df] flex justify-between items-center bg-stone-50/50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <span className="text-[10px] tracking-widest text-[#707070] uppercase font-semibold">Delivery Delay:</span>
              <select 
                value={delay} 
                onChange={(e) => setDelay(e.target.value)}
                className="bg-transparent border-b border-[#707070]/30 text-[#1a1a1a] font-serif focus:outline-none focus:border-[#c2410c] cursor-pointer text-xs pb-0.5"
              >
                <option value="1h" className="bg-white">1 Hour</option>
                <option value="24h" className="bg-white">24 Hours</option>
                <option value="7d" className="bg-white">7 Days</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-[#707070] hover:text-[#c2410c] transition-colors"><Music size={16} /></button>
              <button className="text-[#707070] hover:text-[#c2410c] transition-colors"><Mic size={16} /></button>
              <button 
                onClick={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
                className={`transition-colors ${isMemoryPanelOpen ? 'text-[#c2410c]' : 'text-[#707070] hover:text-[#c2410c]'}`} 
              >
                <ImageIcon size={16} />
              </button>
            </div>
          </div>

          {/* Clean editor text area */}
          <div className="p-8 lg:p-10 flex-1 flex flex-col bg-notebook-lines rounded-b-lg">
            <input 
              type="text" 
              placeholder="To my love..." 
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              className="w-full bg-transparent border-none text-2xl text-[#1a1a1a] font-serif focus:outline-none mb-6 placeholder-[#1a1a1a]/25 border-b border-[#e6e4df]/40 pb-2 font-bold"
            />
            
            <textarea 
              placeholder="Write your heart out here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-transparent border-none text-lg text-[#1a1a1a] font-serif leading-[3rem] focus:outline-none resize-none placeholder-[#1a1a1a]/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-[#e6e4df] flex justify-end bg-stone-50/20 rounded-b-lg">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
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
              className="bg-white border border-[#e6e4df] rounded-lg shadow-sm flex flex-col overflow-hidden card-shadow"
            >
              <div className="p-6 border-b border-[#e6e4df] flex justify-between items-center">
                <h2 className="font-serif text-[#1a1a1a] text-base font-bold">Interactive Memories</h2>
                <button onClick={() => setIsMemoryPanelOpen(false)} className="text-[#707070] hover:text-[#c2410c]"><X size={16}/></button>
              </div>
              
              <div className="p-6 text-[#707070] text-xs font-serif italic border-b border-[#e6e4df]/60">
                Attach coordinates or photos to specific letter content.
              </div>
              
              <div className="flex-1 p-6 flex flex-col items-center justify-center opacity-40 border-2 border-dashed border-[#e6e4df] m-6 hover:opacity-100 hover:border-[#c2410c] transition-all cursor-pointer bg-[#f9f8f6] rounded">
                <ImageIcon size={32} className="mb-2 text-[#c2410c]" />
                <p className="font-serif text-[11px] text-center text-[#707070]">Drop photo here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
