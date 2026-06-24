'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Music, Lock, RefreshCw, Layers, Heart, ArrowRight, Plus, Trash2, X } from 'lucide-react';

interface PolaroidItem {
  id: string;
  image: string;
  title: string;
  note: string;
}

interface TicketItem {
  id: string;
  title: string;
  date: string;
  seat: string;
  memo: string;
}

export default function KeepsakeBoxPage() {
  const [activeTab, setActiveTab] = useState<'letters' | 'photos' | 'playlist' | 'keepsakes'>('letters');
  const [deliveredLetters, setDeliveredLetters] = useState<any[]>([]);

  // Keepsake state lists
  const [polaroids, setPolaroids] = useState<PolaroidItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Polaroid form fields
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoNote, setPhotoNote] = useState('');

  // Ticket form fields
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDate, setTicketDate] = useState('');
  const [ticketSeat, setTicketSeat] = useState('');
  const [ticketMemo, setTicketMemo] = useState('');

  // Cassette Tape Player State
  const [isCassetteInserted, setIsCassetteInserted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Polaroid State
  const [polaroidIndex, setPolaroidIndex] = useState(0);
  const [isPolaroidFlipped, setIsPolaroidFlipped] = useState(false);

  // Locket State
  const [isLocketOpen, setIsLocketOpen] = useState(false);

  const defaultPolaroids: PolaroidItem[] = [
    {
      id: 'default-photo-1',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
      title: 'Warm Hugs in Winter',
      note: 'Remember how cold it was this day? We shared one oversized scarf and drank coffee until our fingers thawed.'
    },
    {
      id: 'default-photo-2',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      title: 'Your Radiant Smile',
      note: 'Captured this candid moment when you weren\'t looking. You were laughing at some silly joke I made. It\'s my favorite photo.'
    },
    {
      id: 'default-photo-3',
      image: 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80',
      title: 'Running in the Rain',
      note: 'We got completely caught in a sudden downpour, soaked from head to toe, running down 5th Avenue giggling like kids.'
    }
  ];

  const defaultTickets: TicketItem[] = [
    { 
      id: 'default-ticket-1',
      title: 'Acoustic Nights Concert', 
      date: 'Nov 14, 2024', 
      seat: 'Row G, Seat 12', 
      memo: 'You sang along to every single song, even the ones you didn\'t know.' 
    },
    { 
      id: 'default-ticket-2',
      title: 'The Vintage Cinema - "Casablanca"', 
      date: 'Feb 14, 2025', 
      seat: 'Balcony, Seats 4 & 5', 
      memo: 'Sharing a giant tub of buttered popcorn in the back row.' 
    }
  ];

  const photoPresets = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keepsakesRes = await fetch('/api/keepsakes');
        const keepsakesData = await keepsakesRes.json();
        if (keepsakesData.success && keepsakesData.data) {
          const fetchedPolaroids = keepsakesData.data.filter((k: any) => k.type === 'polaroid');
          const fetchedTickets = keepsakesData.data.filter((k: any) => k.type === 'ticket');
          setPolaroids(fetchedPolaroids.length > 0 ? fetchedPolaroids : defaultPolaroids);
          setTickets(fetchedTickets.length > 0 ? fetchedTickets : defaultTickets);
        } else {
          setPolaroids(defaultPolaroids);
          setTickets(defaultTickets);
        }

        const lettersRes = await fetch('/api/letters');
        const lettersData = await lettersRes.json();
        if (lettersData.success && lettersData.data) {
          const delivered = lettersData.data.filter((l: any) => {
            const deliverTime = new Date(l.deliverAt || l.createdAt).getTime();
            return deliverTime <= Date.now();
          });
          setDeliveredLetters(delivered);
        }
      } catch (err) {
        setPolaroids(defaultPolaroids);
        setTickets(defaultTickets);
      }
    };
    fetchData();
  }, []);

  const savePhotos = (newPhotos: PolaroidItem[]) => {
    setPolaroids(newPhotos);
    localStorage.setItem('dear_you_vault_photos', JSON.stringify(newPhotos));
  };

  const saveTickets = (newTickets: TicketItem[]) => {
    setTickets(newTickets);
    localStorage.setItem('dear_you_vault_tickets', JSON.stringify(newTickets));
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle || !photoNote) return;

    const payload = {
      type: 'polaroid',
      image: photoUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
      title: photoTitle,
      note: photoNote
    };

    try {
      const res = await fetch('/api/keepsakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setPolaroids([...polaroids, data.data]);
        setPolaroidIndex(polaroids.length);
      }
    } catch(err) {}

    setIsPhotoModalOpen(false);
    setPhotoUrl('');
    setPhotoTitle('');
    setPhotoNote('');
    setIsPolaroidFlipped(false);
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Are you sure you want to delete this Polaroid memory?')) {
      if (!id.startsWith('default-')) {
        await fetch(`/api/keepsakes?id=${id}`, { method: 'DELETE' });
      }
      const updated = polaroids.filter(p => p.id !== id);
      setPolaroids(updated);
      setPolaroidIndex(0);
      setIsPolaroidFlipped(false);
    }
  };

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDate || !ticketSeat || !ticketMemo) return;

    const payload = {
      type: 'ticket',
      title: ticketTitle,
      date: ticketDate,
      seat: ticketSeat,
      memo: ticketMemo
    };

    try {
      const res = await fetch('/api/keepsakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTickets([...tickets, data.data]);
      }
    } catch(err) {}

    setIsTicketModalOpen(false);
    setTicketTitle('');
    setTicketDate('');
    setTicketSeat('');
    setTicketMemo('');
  };

  const handleDeleteTicket = async (id: string) => {
    if (confirm('Are you sure you want to discard this ticket stub?')) {
      if (!id.startsWith('default-')) {
        await fetch(`/api/keepsakes?id=${id}`, { method: 'DELETE' });
      }
      const updated = tickets.filter(t => t.id !== id);
      setTickets(updated);
    }
  };

  const handleCassetteClick = () => {
    if (!isCassetteInserted) {
      setIsCassetteInserted(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }, 600);
    }
  };

  const handleCassetteControl = (action: 'play' | 'pause' | 'stop' | 'eject') => {
    if (!audioRef.current) return;

    if (action === 'play') {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (action === 'pause') {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (action === 'stop') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else if (action === 'eject') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsCassetteInserted(false);
    }
  };

  const nextPolaroid = () => {
    setIsPolaroidFlipped(false);
    setTimeout(() => {
      setPolaroidIndex((prev) => (prev + 1) % polaroids.length);
    }, 150);
  };

  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12 overflow-y-auto no-scrollbar">
      
      {/* Hidden audio element for cassette player */}
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" 
        loop
      />

      {/* Editorial Header */}
      <div className="mb-12 max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333333] pb-6">
        <div>
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Private Archive</span>
          <h1 className="font-serif text-4xl font-bold text-[#f9f8f6] mt-1">Keepsake Box</h1>
          <p className="text-sm text-[#a0a0a0] mt-2">
            A minimalist digital chest enclosing physical stubs, favorite photographs, and private mixtapes.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#fdfbf7] border border-[#333333] rounded-lg p-1 self-start md:self-auto shadow-xs">
          <button 
            onClick={() => setActiveTab('letters')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-serif text-xs transition-all ${
              activeTab === 'letters' 
                ? 'bg-[#1a1a1a] text-[#f9f8f6] shadow-sm font-semibold' 
                : 'text-[#a0a0a0] hover:text-[#f9f8f6]'
            }`}
          >
            <Heart size={13} />
            <span>Letters</span>
          </button>
          <button 
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-serif text-xs transition-all ${
              activeTab === 'photos' 
                ? 'bg-[#1a1a1a] text-[#f9f8f6] shadow-sm font-semibold' 
                : 'text-[#a0a0a0] hover:text-[#f9f8f6]'
            }`}
          >
            <Layers size={13} />
            <span>Photographs</span>
          </button>
          <button 
            onClick={() => setActiveTab('playlist')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-serif text-xs transition-all ${
              activeTab === 'playlist' 
                ? 'bg-[#1a1a1a] text-[#f9f8f6] shadow-sm font-semibold' 
                : 'text-[#a0a0a0] hover:text-[#f9f8f6]'
            }`}
          >
            <Music size={13} />
            <span>Tape Deck</span>
          </button>
          <button 
            onClick={() => setActiveTab('keepsakes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-serif text-xs transition-all ${
              activeTab === 'keepsakes' 
                ? 'bg-[#1a1a1a] text-[#f9f8f6] shadow-sm font-semibold' 
                : 'text-[#a0a0a0] hover:text-[#f9f8f6]'
            }`}
          >
            <Lock size={13} />
            <span>Chamber</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-[55vh]">
        <AnimatePresence mode="wait">
          
          {/* TAB 0: DELIVERED LETTERS */}
          {activeTab === 'letters' && (
            <motion.div
              key="letters"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6 w-full"
            >
              {deliveredLetters.length === 0 ? (
                <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#333333] rounded-lg p-12 text-center card-shadow">
                  <p className="font-serif italic text-[#a0a0a0]">No letters have arrived yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                  {deliveredLetters.map(letter => (
                    <div key={letter.id} className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 shadow-sm card-shadow relative group">
                      <div className="absolute top-0 right-10 w-4 h-8 bg-[#c2410c] opacity-10"></div>
                      <div className="text-[10px] uppercase tracking-widest text-[#a0a0a0] mb-4 border-b border-[#333333] pb-2">
                        From {letter.sender?.name || 'Sender'}
                      </div>
                      <p className="font-serif text-[#f9f8f6] text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">
                        {letter.content}
                      </p>
                      <div className="text-right text-[10px] text-[#a0a0a0] font-mono">
                        Delivered: {new Date(letter.deliverAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 1: PHOTOGRAPH GALLERY */}
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6"
            >
              <div className="w-full max-w-sm flex flex-col items-center">
                
                {polaroids.length === 0 ? (
                  <div className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg p-12 text-center card-shadow">
                    <p className="font-serif italic text-[#a0a0a0] mb-4">No photograph memories saved.</p>
                    <button 
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="border border-[#333333] hover:border-[#1a1a1a] px-4 py-2 rounded-lg font-serif text-xs text-[#f9f8f6] bg-[#1a1a1a] transition-colors shadow-xs font-bold"
                    >
                      Add Photo Memory
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 3D Flippable Polaroid Photo Card (Clean Modern Variant) */}
                    <div 
                      className="relative w-80 aspect-[4/5] cursor-pointer"
                      style={{ perspective: '1000px' }}
                      onClick={() => setIsPolaroidFlipped(!isPolaroidFlipped)}
                    >
                      <motion.div 
                        animate={{ rotateY: isPolaroidFlipped ? 180 : 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        
                        {/* Front of Polaroid */}
                        <div 
                          className="absolute inset-0 bg-[#1a1a1a] p-5 pb-16 border border-[#333333] rounded-lg flex flex-col justify-between card-shadow"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className="w-full h-full bg-[#1a1a1a] overflow-hidden border border-[#333333]/60 rounded-md relative group">
                            <img 
                              src={polaroids[polaroidIndex]?.image} 
                              alt="Polaroid Memory" 
                              className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/10 via-transparent pointer-events-none" />
                          </div>
                          <div className="text-center font-serif text-lg font-bold text-[#f9f8f6] mt-4 leading-none truncate">
                            {polaroids[polaroidIndex]?.title}
                          </div>
                        </div>

                        {/* Back of Polaroid (Handwritten text) */}
                        <div 
                          className="absolute inset-0 bg-[#1a1a1a] p-8 border border-[#333333] rounded-lg flex flex-col justify-between card-shadow"
                          style={{ 
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                        >
                          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#333333] p-6 rounded-md bg-[#fdfbf7]">
                            <span className="text-[9px] tracking-widest text-[#a0a0a0] uppercase font-semibold mb-3">Written Memory</span>
                            <p className="font-serif italic text-base text-[#f9f8f6] text-center leading-relaxed">
                              "{polaroids[polaroidIndex]?.note}"
                            </p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(polaroids[polaroidIndex].id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider"
                            >
                              <Trash2 size={12} />
                              <span>Discard</span>
                            </button>
                            <span className="font-serif text-[10px] text-[#a0a0a0]/60 tracking-wider text-right uppercase">
                              Dear You Archive • Vol.{polaroidIndex + 1}
                            </span>
                          </div>
                        </div>

                      </motion.div>
                    </div>

                    {/* Flip & Next Controls */}
                    <div className="mt-8 flex gap-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPolaroidFlipped(!isPolaroidFlipped);
                        }}
                        className="flex items-center gap-1.5 border border-[#333333] hover:border-[#1a1a1a] px-4 py-2 rounded-lg font-serif text-xs text-[#f9f8f6] bg-[#1a1a1a] transition-colors card-shadow"
                      >
                        <RefreshCw size={13} className="text-[#c2410c]" />
                        <span>Flip Photo</span>
                      </button>
                      
                      {polaroids.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            nextPolaroid();
                          }}
                          className="flex items-center gap-1.5 border border-[#333333] hover:border-[#1a1a1a] px-4 py-2 rounded-lg font-serif text-xs text-[#f9f8f6] bg-[#1a1a1a] transition-colors card-shadow"
                        >
                          <span>Next Slide</span>
                          <ArrowRight size={13} />
                        </button>
                      )}

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPhotoModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 border border-[#333333] hover:border-[#1a1a1a] px-4 py-2 rounded-lg font-serif text-xs text-[#f9f8f6] bg-[#1a1a1a] hover:bg-[#333] text-white transition-colors card-shadow font-bold"
                      >
                        <Plus size={13} />
                        <span>New Photo</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: ACOUSTIC PLAYLIST */}
          {activeTab === 'playlist' && (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6"
            >
              <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333333] p-8 rounded-lg card-shadow flex flex-col md:flex-row items-center gap-8">
                
                {/* Cassette Tape (Clean Vector Card) */}
                <div className="flex flex-col items-center">
                  <motion.div
                    onClick={handleCassetteClick}
                    animate={isCassetteInserted ? { 
                      y: 20, 
                      scale: 0.85, 
                      opacity: 0.6,
                      pointerEvents: 'none'
                    } : { 
                      y: 0, 
                      scale: 1, 
                      opacity: 1 
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-48 h-32 bg-[#1a1a1a] border border-[#333333] rounded-lg p-3 flex flex-col justify-between card-shadow cursor-pointer hover:border-[#1a1a1a] transition-all group"
                  >
                    <div className="flex-1 bg-[#1a1a1a] border border-[#333333]/60 rounded-md flex flex-col justify-between p-2 shadow-xs">
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#a0a0a0]">
                        <span>A-Side</span>
                        <span>L-45</span>
                      </div>
                      
                      <div className="flex justify-around items-center my-1">
                        <div className="w-6 h-6 rounded-full bg-stone-100 border border-[#333333] flex items-center justify-center shadow-inner">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-stone-100 border border-[#333333] flex items-center justify-center shadow-inner">
                          <div className="w-2 h-2 bg-stone-400 rounded-full"></div>
                        </div>
                      </div>

                      <div className="text-center font-serif text-xs font-bold text-[#f9f8f6] py-0.5 truncate border-t border-[#333333]/60">
                        ♥ Shared Acoustic Playlist ♥
                      </div>
                    </div>
                  </motion.div>
                  {!isCassetteInserted && (
                    <span className="text-[9px] tracking-widest text-[#a0a0a0] uppercase font-semibold mt-3 animate-pulse">
                      Click cassette to insert
                    </span>
                  )}
                </div>

                {/* Cassette Tape Deck Player */}
                <div className="w-56 flex-1 flex flex-col justify-between min-h-48 border-l border-[#333333]/60 pl-0 md:pl-8 mt-6 md:mt-0">
                  <div>
                    <span className="text-[9px] font-mono text-[#a0a0a0] tracking-widest block uppercase">Acoustic Player</span>
                    <h3 className="font-serif text-lg font-bold text-[#f9f8f6] mt-1">Our Mixtape</h3>
                  </div>

                  {/* Tape slot window */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-md h-24 my-4 flex items-center justify-center overflow-hidden relative shadow-inner">
                    {isCassetteInserted ? (
                      <div className="w-full h-full flex flex-col justify-center items-center p-3">
                        <div className="flex justify-around items-center w-full px-4 mb-2">
                          <motion.div 
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={isPlaying ? { repeat: Infinity, duration: 4, ease: 'linear' } : {}}
                            className="w-5 h-5 rounded-full border border-dashed border-[#c2410c] flex items-center justify-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c2410c]"></div>
                          </motion.div>
                          <motion.div 
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={isPlaying ? { repeat: Infinity, duration: 4, ease: 'linear' } : {}}
                            className="w-5 h-5 rounded-full border border-dashed border-[#c2410c] flex items-center justify-center"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c2410c]"></div>
                          </motion.div>
                        </div>
                        
                        {/* Muted Animated Waves */}
                        <div className="flex items-end gap-0.5 h-4">
                          {[60, 30, 80, 45, 90, 20, 60, 40].map((height, i) => (
                            <motion.div
                              key={i}
                              animate={isPlaying ? { height: [`10%`, `${height}%`, `10%`] } : { height: '10%' }}
                              transition={{ repeat: Infinity, duration: 0.8 + i * 0.1, ease: 'easeInOut' }}
                              className="w-1 bg-[#344e41] rounded-t-xs"
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="font-serif text-[10px] text-[#a0a0a0]/60 italic uppercase tracking-wider">
                        Insert Tape Above
                      </span>
                    )}
                  </div>

                  {/* Play controls */}
                  <div className="flex justify-between items-center gap-2">
                    <button 
                      onClick={() => handleCassetteControl('play')}
                      disabled={!isCassetteInserted || isPlaying}
                      className="flex-1 flex justify-center py-2 rounded-lg bg-[#1a1a1a] border border-[#333333] text-[#a0a0a0] hover:text-[#f9f8f6] hover:border-[#1a1a1a] disabled:opacity-30 transition-colors shadow-xs"
                    >
                      <Play size={12} className="fill-current" />
                    </button>
                    <button 
                      onClick={() => handleCassetteControl('pause')}
                      disabled={!isCassetteInserted || !isPlaying}
                      className="flex-1 flex justify-center py-2 rounded-lg bg-[#1a1a1a] border border-[#333333] text-[#a0a0a0] hover:text-[#f9f8f6] hover:border-[#1a1a1a] disabled:opacity-30 transition-colors shadow-xs"
                    >
                      <Pause size={12} className="fill-current" />
                    </button>
                    <button 
                      onClick={() => handleCassetteControl('eject')}
                      disabled={!isCassetteInserted}
                      className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#333333] text-[9px] font-serif text-[#a0a0a0] hover:text-[#f9f8f6] hover:border-[#1a1a1a] disabled:opacity-30 transition-colors shadow-xs uppercase tracking-wider font-semibold"
                    >
                      Eject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: THE KEEPSAKE CHAMBER (Locket & Tickets) */}
          {activeTab === 'keepsakes' && (
            <motion.div
              key="keepsakes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center py-6 gap-12"
            >
              {/* Modern Minimal Locket */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold mb-4">
                  Interactive Keepsake
                </span>
                
                <div 
                  className="relative w-44 h-40 cursor-pointer flex items-center justify-center"
                  onClick={() => setIsLocketOpen(!isLocketOpen)}
                  style={{ perspective: '1000px' }}
                >
                  <div className="relative w-full h-full flex justify-center items-center">
                    
                    {/* Left Half of Locket */}
                    <motion.div
                      animate={{ 
                        rotateY: isLocketOpen ? -145 : 0,
                        x: isLocketOpen ? -40 : 0
                      }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-6 w-16 h-28 bg-[#fdfbf7] border-2 border-r-0 border-[#333333] origin-right shadow-md flex items-center justify-end overflow-hidden"
                      style={{ 
                        borderRadius: '100px 0 0 100px', 
                        transformStyle: 'preserve-3d', 
                        backfaceVisibility: 'hidden',
                        zIndex: 10
                      }}
                    >
                      <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center bg-[#1a1a1a] mr-1.5">
                        <Heart size={14} className="text-[#c2410c] fill-[#c2410c]/20" />
                      </div>
                    </motion.div>

                    {/* Right Half of Locket */}
                    <motion.div
                      animate={{ 
                        rotateY: isLocketOpen ? 145 : 0,
                        x: isLocketOpen ? 40 : 0
                      }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-6 w-16 h-28 bg-[#fdfbf7] border-2 border-l-0 border-[#333333] origin-left shadow-md flex items-center justify-start overflow-hidden"
                      style={{ 
                        borderRadius: '0 100px 100px 0', 
                        transformStyle: 'preserve-3d', 
                        backfaceVisibility: 'hidden',
                        zIndex: 10
                      }}
                    >
                      <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center bg-[#1a1a1a] ml-1.5">
                        <Heart size={14} className="text-[#c2410c] fill-[#c2410c]/20" />
                      </div>
                    </motion.div>

                    {/* Inside Photos */}
                    <div className="absolute inset-0 flex justify-center items-center space-x-1.5 z-0">
                      <div className="w-16 h-24 bg-stone-100 rounded-l-full overflow-hidden border border-[#333333] shadow-inner">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                          alt="Partner 1" 
                          className="w-full h-full object-cover grayscale opacity-90" 
                        />
                      </div>
                      <div className="w-16 h-24 bg-stone-100 rounded-r-full overflow-hidden border border-[#333333] shadow-inner">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" 
                          alt="Partner 2" 
                          className="w-full h-full object-cover grayscale opacity-90" 
                        />
                      </div>
                    </div>

                  </div>
                </div>
                <span className="text-[9px] tracking-widest text-[#a0a0a0]/60 uppercase font-semibold mt-2">
                  {isLocketOpen ? 'Click to close' : 'Click to open locket'}
                </span>
              </div>

              {/* Minimal Ticket Stubs Grid */}
              <div className="w-full flex flex-col space-y-4">
                <div className="flex justify-between items-center border-b border-[#333333]/60 pb-3">
                  <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">
                    Ticket Stubs Archive
                  </span>
                  
                  <button
                    onClick={() => setIsTicketModalOpen(true)}
                    className="flex items-center gap-1 text-[10px] text-[#c2410c] hover:text-[#a5360a] font-serif uppercase tracking-widest font-bold"
                  >
                    <Plus size={12} />
                    <span>Add Ticket</span>
                  </button>
                </div>
                
                {tickets.length === 0 ? (
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-10 text-center card-shadow">
                    <p className="font-serif italic text-xs text-[#a0a0a0]">No ticket stubs recorded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {tickets.map((t) => (
                      <div 
                        key={t.id}
                        className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-5 flex flex-col justify-between relative overflow-hidden card-shadow group hover:border-[#1a1a1a] transition-all"
                      >
                        {/* Clean ticket dashed dividers */}
                        <div className="absolute right-14 top-0 bottom-0 border-l border-dashed border-[#333333]"></div>
                        <div className="absolute right-[50px] -top-2 w-3.5 h-3.5 bg-[#111111] rounded-full border border-[#333333]"></div>
                        <div className="absolute right-[50px] -bottom-2 w-3.5 h-3.5 bg-[#111111] rounded-full border border-[#333333]"></div>

                        {/* Delete/Discard ticket */}
                        <button
                          onClick={() => handleDeleteTicket(t.id)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-100 border border-[#333333] text-red-600 hover:bg-red-50 p-1 rounded-full"
                          title="Tear ticket stub"
                        >
                          <X size={10} />
                        </button>

                        <div className="pr-16">
                          <span className="font-serif text-[9px] text-[#a0a0a0] tracking-wider block uppercase mb-1">{t.date}</span>
                          <h4 className="font-serif text-base font-bold text-[#f9f8f6] mb-2 pr-2">{t.title}</h4>
                          <p className="font-serif text-xs text-[#a0a0a0] italic">"{t.memo}"</p>
                        </div>

                        <div className="absolute right-0 top-0 bottom-0 w-14 flex flex-col justify-center items-center font-mono text-[9px] text-[#a0a0a0]/50 rotate-90 tracking-widest uppercase font-semibold">
                          {t.seat}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Add Photo Memory Modal */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#1a1a1a] border border-[#333333] p-6 rounded-lg w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsPhotoModalOpen(false)}
                className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6]"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Plus className="text-[#c2410c] w-5 h-5" />
                <h3 className="font-serif text-[#f9f8f6] text-xl font-bold">Add Photo Memory</h3>
              </div>

              <form onSubmit={handleAddPhoto} className="space-y-4">
                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Photo Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Walking in Central Park"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste image link here..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                {/* presets */}
                <div>
                  <label className="block font-serif text-[10px] text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Or Choose preset</label>
                  <div className="flex gap-2">
                    {photoPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset)}
                        className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${photoUrl === preset ? 'border-[#c2410c] scale-105' : 'border-transparent'}`}
                      >
                        <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Memory Description</label>
                  <textarea
                    placeholder="Write a private note describing this memory..."
                    value={photoNote}
                    onChange={(e) => setPhotoNote(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-3 rounded-lg font-serif uppercase tracking-widest text-xs transition-colors shadow-sm font-bold mt-2"
                >
                  Save Photo
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Ticket Stub Modal */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#1a1a1a] border border-[#333333] p-6 rounded-lg w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6]"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Plus className="text-[#c2410c] w-5 h-5" />
                <h3 className="font-serif text-[#f9f8f6] text-xl font-bold">Add Ticket Stub</h3>
              </div>

              <form onSubmit={handleAddTicket} className="space-y-4">
                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Event/Movie Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Coldplay Live Concert"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Nov 14, 2024"
                      value={ticketDate}
                      onChange={(e) => setTicketDate(e.target.value)}
                      required
                      className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>

                  <div>
                    <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Seat / Code</label>
                    <input
                      type="text"
                      placeholder="e.g. Row G, Seat 12"
                      value={ticketSeat}
                      onChange={(e) => setTicketSeat(e.target.value)}
                      required
                      className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Memo / Secret Note</label>
                  <textarea
                    placeholder="Write a sweet memory from this event..."
                    value={ticketMemo}
                    onChange={(e) => setTicketMemo(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-3 rounded-lg font-serif uppercase tracking-widest text-xs transition-colors shadow-sm font-bold mt-2"
                >
                  Save Ticket Stub
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
