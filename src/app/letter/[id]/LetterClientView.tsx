'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image as ImageIcon, Music, Mic, Download, Play, Pause, PackageOpen, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
}

interface Letter {
  id: string;
  content: string;
  sender: User;
  receiver: User | null;
  images?: string[];
  music?: string | null;
  voices?: string[];
  deliverAt?: string;
}

export default function LetterClientView({ letter }: { letter: Letter }) {
  const router = useRouter();
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleVoice = (url: string) => {
    if (playingVoice === url) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setPlayingVoice(url);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return 'Unknown date';
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full flex flex-col pt-6">
      
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto w-full mb-6 flex justify-between items-center z-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#f9f8f6] transition-colors bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#333]"
        >
          <ArrowLeft size={16} />
          <span className="text-xs uppercase tracking-widest font-bold">Back</span>
        </button>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} className="hidden" />

      {/* Main Container - mimics Write layout */}
      <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 relative flex-1 min-h-[75vh]">
        
        {/* LEFT/CENTER - Letter Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 md:p-14 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Subtle Background Watermark Image if attached */}
          {letter.images && letter.images.length > 0 && (
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{ backgroundImage: `url(${letter.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)' }}
            />
          )}

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-[#333] pb-6 mb-8">
              <div>
                <span className="text-xs tracking-widest text-[#a0a0a0] uppercase font-bold bg-[#222] px-3 py-1.5 rounded-full border border-[#333]">
                  Delivered
                </span>
                <h2 className="font-serif text-3xl font-bold text-[#f9f8f6] mt-6">
                  To {letter.receiver?.name || "My Love"}
                </h2>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#a0a0a0] text-sm justify-end">
                  <Calendar size={14} />
                  <span>{formatDate(letter.deliverAt)}</span>
                </div>
                <p className="font-serif italic text-[#c2410c] mt-2 text-lg">From {letter.sender.name}</p>
              </div>
            </div>

            {/* Letter Body */}
            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
              <p className="font-serif text-xl md:text-2xl text-[#e6e4df] leading-loose whitespace-pre-wrap selection:bg-[#c2410c]/20">
                {letter.content}
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - Folders & Attachments (mimicking Write page) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0"
        >
          
          {/* Music Player */}
          {letter.music && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2410c]/5 rounded-bl-full -z-10 group-hover:bg-[#c2410c]/10 transition-colors" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                  <Music size={18} className="text-[#c2410c]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#f9f8f6]">Background Music</h3>
              </div>
              <div className="bg-[#111] p-3 rounded-xl border border-[#333]">
                <audio controls src={letter.music} className="w-full h-10 accent-[#c2410c]" />
              </div>
            </div>
          )}

          {/* Voice Notes */}
          {letter.voices && letter.voices.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                    <Mic size={18} className="text-[#c2410c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f9f8f6]">Voice Notes</h3>
                </div>
                <span className="text-xs font-mono text-[#a0a0a0] bg-[#222] px-2 py-1 rounded">{letter.voices.length}</span>
              </div>
              
              <div className="space-y-3">
                {letter.voices.map((voice, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#111] p-3 rounded-xl border border-[#333] hover:border-[#444] transition-colors">
                    <button 
                      onClick={() => toggleVoice(voice)}
                      className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-[#c2410c] hover:bg-[#c2410c] hover:text-white transition-all shrink-0"
                    >
                      {playingVoice === voice ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                    </button>
                    <div className="flex-1">
                      <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                        {playingVoice === voice && (
                          <motion.div 
                            className="h-full bg-[#c2410c]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-[#a0a0a0] mt-1 font-mono">Record_0{idx + 1}.wav</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {letter.images && letter.images.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                    <ImageIcon size={18} className="text-[#c2410c]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f9f8f6]">Attached Memories</h3>
                </div>
                <span className="text-xs font-mono text-[#a0a0a0] bg-[#222] px-2 py-1 rounded">{letter.images.length}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[300px] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                {letter.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#333] group bg-[#111]">
                    <Image 
                      src={img} 
                      alt="Attachment" 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <a 
                        href={img} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors text-white"
                      >
                        <Download size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State if no attachments */}
          {(!letter.images?.length && !letter.music && !letter.voices?.length) && (
            <div className="bg-[#1a1a1a] border border-[#333] border-dashed rounded-2xl p-10 shadow-xl flex flex-col items-center justify-center text-center h-full">
              <PackageOpen size={32} className="text-[#a0a0a0]/30 mb-4" />
              <p className="font-serif text-[#a0a0a0] italic">No memories attached to this letter.</p>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
