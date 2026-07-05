'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image as ImageIcon, Music, Mic, Play, Pause, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const [playingMusic, setPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

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

  const toggleMusic = () => {
    if (playingMusic) {
      musicRef.current?.pause();
      setPlayingMusic(false);
    } else {
      musicRef.current?.play();
      setPlayingMusic(true);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-6 pb-20 bg-[#111]">
      
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto w-full mb-6 flex justify-between items-center z-10 px-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#a0a0a0] hover:text-[#f9f8f6] transition-colors bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#333]"
        >
          <ArrowLeft size={16} />
          <span className="text-xs uppercase tracking-widest font-bold">Back</span>
        </button>
      </div>

      <audio ref={audioRef} onEnded={() => setPlayingVoice(null)} className="hidden" />
      {letter.music && (
        <audio ref={musicRef} src={letter.music} onEnded={() => setPlayingMusic(false)} className="hidden" />
      )}

      {/* Main Container - EXACTLY mimics Write layout */}
      <div className="w-full max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 relative flex-1 min-h-[75vh] px-4">
        
        {/* LEFT/CENTER - Letter Content */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-3xl p-8 md:p-14 flex flex-col relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full items-center max-w-2xl mx-auto w-full mt-10">
            <h2 className="font-serif text-4xl text-[#555] italic mb-8">
              To {letter.receiver?.name || "my love"}...
            </h2>

            {/* Letter Body */}
            <div className="flex-1 w-full mt-4">
              <p className="font-serif text-2xl md:text-3xl text-[#888] leading-relaxed text-center">
                {letter.content}
              </p>
            </div>
            
            <p className="font-serif italic text-[#444] mt-16 text-lg self-end">
              - {letter.sender.name}
            </p>
          </div>
        </motion.div>

        {/* RIGHT SIDE - Floating Widgets (mimicking Write page EXACTLY) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full xl:w-[320px] flex flex-col gap-6 shrink-0 pt-10"
        >
          
          {/* Voice Notes */}
          {letter.voices && letter.voices.length > 0 && (
            <div className="space-y-4">
              {letter.voices.map((url, idx) => (
                <div key={idx} className="bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl flex flex-col relative">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-[#888]">
                         <Mic size={14} />
                         <span className="text-xs font-bold">Voice Note {idx + 1}</span>
                      </div>
                   </div>
                   
                   <div className="flex justify-center my-4">
                      <button 
                        onClick={() => toggleVoice(url)}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {playingVoice === url ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                      </button>
                   </div>
                   
                   <div className="w-full h-1 bg-[#333] rounded-full mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Audio Track (Music) */}
          {letter.music && (
            <div className="bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl flex flex-col relative">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-[#888]">
                      <Music size={14} />
                      <span className="text-xs font-bold">Audio Track</span>
                  </div>
                </div>
                
                <div className="w-full h-32 rounded-xl overflow-hidden relative mb-4 border border-[#333]">
                   <div className="absolute inset-0 bg-[#222] flex items-center justify-center">
                     <Music size={32} className="text-[#444]" />
                   </div>
                </div>

                <div className="flex justify-center mb-2">
                  <button 
                    onClick={toggleMusic}
                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {playingMusic ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                  </button>
                </div>
            </div>
          )}

          {/* Gallery */}
          {letter.images && letter.images.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl flex flex-col relative">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-[#888]">
                      <ImageIcon size={14} />
                      <span className="text-xs font-bold">Gallery</span>
                  </div>
                  <span className="text-xs text-[#888]">{letter.images.length} items</span>
                </div>
                
                <div className="flex -space-x-4 justify-center py-4">
                   {letter.images.slice(0, 3).map((img, i) => (
                      <div key={i} className="w-20 h-20 rounded-2xl border-4 border-[#1a1a1a] overflow-hidden relative z-10 shadow-lg">
                        <Image src={img} alt={`Gallery ${i}`} fill className="object-cover" />
                      </div>
                   ))}
                   {letter.images.length > 3 && (
                     <div className="w-20 h-20 rounded-2xl border-4 border-[#1a1a1a] bg-[#222] flex items-center justify-center z-0 relative shadow-lg text-[#888] font-bold">
                       +{letter.images.length - 3}
                     </div>
                   )}
                </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
