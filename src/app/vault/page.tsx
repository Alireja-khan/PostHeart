'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Music, Mic, Mail, ArrowUpRight, Play, Pause, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  images?: string[];
  music?: string | null;
  voices?: string[];
  deliverAt?: string;
}

export default function KeepsakeBoxPage() {
  const [activeTab, setActiveTab] = useState<'letters' | 'images' | 'records'>('letters');
  const [deliveredLetters, setDeliveredLetters] = useState<Letter[]>([]);
  const router = useRouter();
  const [playingRecord, setPlayingRecord] = useState<string | null>(null);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const res = await fetch('/api/letters?box=inbox');
        if (res.ok) {
          const data = await res.json();
          setDeliveredLetters(data.letters);
        }
      } catch (error) {
        console.error('Failed to fetch letters:', error);
      }
    };
    fetchLetters();
  }, []);

  const allImages = deliveredLetters.flatMap(l => 
    (l.images || []).map(img => ({ url: img, letter: l }))
  );

  const allRecords = deliveredLetters.flatMap(l => {
    const items = [];
    if (l.music) items.push({ type: 'music', url: l.music, letter: l });
    if (l.voices) {
      l.voices.forEach(v => items.push({ type: 'voice', url: v, letter: l }));
    }
    return items;
  });

  const toggleAudio = (url: string) => {
    setPlayingRecord(prev => prev === url ? null : url);
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12 relative flex flex-col">
      <div className="mb-10 max-w-5xl mx-auto w-full flex flex-col md:flex-row md:items-end justify-between border-b border-[#333333] pb-6 relative z-10">
        <div>
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Keepsake Box</span>
          <h2 className="font-serif text-4xl font-bold text-[#f9f8f6] mt-1">The Vault</h2>
          <p className="text-sm text-[#a0a0a0] mt-2">
            A secure archive of all memories attached to your letters.
          </p>
        </div>

        <div className="flex items-center space-x-6 mt-8 md:mt-0">
          <button 
            onClick={() => setActiveTab('letters')}
            className={`flex items-center gap-2 font-serif text-lg transition-all ${activeTab === 'letters' ? 'text-[#c2410c] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            <Mail size={16} /> Letters
          </button>
          <button 
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 font-serif text-lg transition-all ${activeTab === 'images' ? 'text-[#c2410c] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            <ImageIcon size={16} /> Images
          </button>
          <button 
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 font-serif text-lg transition-all ${activeTab === 'records' ? 'text-[#c2410c] font-bold pb-1' : 'text-[#a0a0a0] hover:text-[#f9f8f6] pb-1'}`}
          >
            <Mic size={16} /> Records
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full">
        {activeTab === 'letters' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveredLetters.map((letter) => {
              const coverImage = letter.images && letter.images.length > 0 ? letter.images[0] : null;
              
              return (
                <div
                  key={letter.id}
                  onClick={() => router.push(`/letter/${letter.id}`)}
                  className="w-full h-72 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative cursor-pointer group hover:scale-105 transition-transform duration-300"
                  style={{ 
                    backgroundColor: '#1a1a1a',
                    backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${coverImage ? 'from-black/95 via-black/50 to-black/30' : 'from-[#111] to-[#222]'}`} />
                  
                  <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase tracking-widest text-white/80 font-bold bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        From {letter.sender.name}
                      </span>
                      <span className="text-[10px] font-mono text-white/60 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                        {formatTime(letter.deliverAt)}
                      </span>
                    </div>

                    <div className="my-auto">
                      <p className="font-serif text-white text-lg leading-snug line-clamp-4 text-center drop-shadow-md">
                        "{letter.content.replace(/^\[To: (.*?)\]\n+/, '').replace(/^\[Font: (.*?)\]\n+/, '').substring(0, 100)}..."
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 mt-auto">
                      {letter.images && letter.images.length > 0 && <ImageIcon size={14} className="text-white/70" />}
                      {letter.music && <Music size={14} className="text-white/70" />}
                      {letter.voices && letter.voices.length > 0 && <Mic size={14} className="text-white/70" />}
                      <span className="ml-auto text-[10px] text-[#c2410c] font-bold group-hover:text-white transition-colors flex items-center gap-1">
                        Read Letter <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {allImages.length === 0 ? (
              <p className="text-[#a0a0a0] font-serif col-span-full text-center mt-10">No images archived yet.</p>
            ) : (
              allImages.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden border border-[#333] group break-inside-avoid shadow-lg bg-[#1a1a1a]">
                  <img src={img.url} alt="Archived Image" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-serif mb-3 line-clamp-2 shadow-black drop-shadow-md">"{img.letter.content.replace(/^\[To: (.*?)\]\n+/, '').replace(/^\[Font: (.*?)\]\n+/, '').substring(0,50)}..."</p>
                    <button 
                      onClick={() => router.push(`/letter/${img.letter.id}`)}
                      className="text-[10px] uppercase tracking-widest font-bold text-[#c2410c] bg-white/10 hover:bg-white/20 px-3 py-2 rounded flex items-center gap-2 w-fit backdrop-blur-md"
                    >
                      <ExternalLink size={12} /> View Letter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRecords.length === 0 ? (
              <p className="text-[#a0a0a0] font-serif col-span-full text-center mt-10">No audio records archived yet.</p>
            ) : (
              allRecords.map((record, idx) => (
                <div key={idx} className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${record.type === 'music' ? 'bg-[#c2410c]/10' : 'bg-white/5'} rounded-bl-full -z-10 transition-colors`} />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#222] rounded-lg border border-[#333]">
                        {record.type === 'music' ? <Music size={18} className="text-[#c2410c]" /> : <Mic size={18} className="text-white" />}
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#f9f8f6]">
                          {record.type === 'music' ? 'Background Music' : 'Voice Note'}
                        </h3>
                        <p className="text-[10px] text-[#a0a0a0] font-mono">{formatTime(record.letter.deliverAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#111] p-3 rounded-xl border border-[#333] mb-4">
                    <audio controls src={record.url} className={`w-full h-10 ${record.type === 'music' ? 'accent-[#c2410c]' : 'accent-white'}`} />
                  </div>

                  <button 
                    onClick={() => router.push(`/letter/${record.letter.id}`)}
                    className="w-full mt-2 text-[10px] uppercase tracking-widest font-bold text-[#a0a0a0] hover:text-white border border-[#333] hover:border-[#c2410c] hover:bg-[#c2410c]/10 px-3 py-2 rounded flex items-center justify-center gap-2 transition-colors"
                  >
                    <ExternalLink size={12} /> Open Original Letter
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
