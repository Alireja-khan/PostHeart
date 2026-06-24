'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, Trash2, Heart, Star, Sparkles, Smile, RefreshCw, X } from 'lucide-react';

interface CorkboardItem {
  id: string;
  type: 'polaroid' | 'sticky' | 'sticker' | 'tape';
  x: number;
  y: number;
  rotation: number;
  content?: string;
  image?: string;
  color?: string; // For sticky notes/tape
}

export default function CoupleSpacePage() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CorkboardItem[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Camera fields
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Sticky Note fields
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('#ffffff'); // Default: pure white/bone card

  // Presets for quick photo selections
  const photoPresets = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80'
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/corkboard');
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setItems(data.data);
        } else {
          initializeDefaultItems();
        }
      } catch (err) {
        initializeDefaultItems();
      }
    };
    fetchItems();
  }, []);

  // Save to database whenever items change structurally
  const saveItems = async (newItems: CorkboardItem[]) => {
    setItems(newItems);
    try {
      await fetch('/api/corkboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems)
      });
    } catch(err) {
      console.error('Failed to sync board', err);
    }
  };

  function initializeDefaultItems() {
    const defaults: CorkboardItem[] = [
      {
        id: 'default-1',
        type: 'polaroid',
        x: 80,
        y: 140,
        rotation: -2,
        image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
        content: 'Weekend Wanderlust ♥'
      },
      {
        id: 'default-2',
        type: 'sticky',
        x: 420,
        y: 110,
        rotation: 3,
        color: '#fdfbf7', // warm cream
        content: 'Remember to pick up flowers for dinner tonight!'
      },
      {
        id: 'default-3',
        type: 'sticker',
        x: 320,
        y: 260,
        rotation: 8,
        color: 'heart'
      },
      {
        id: 'default-4',
        type: 'tape',
        x: 180,
        y: 115,
        rotation: -5,
        color: 'rgba(194, 65, 12, 0.25)' // terracotta translucent tape
      }
    ];
    saveItems(defaults);
  };

  // Handle drag positioning updates
  const handleDragEnd = (id: string, info: any) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    
    const updated = items.map(item => {
      if (item.id === id) {
        // Calculate new coordinates relative to the board bounds
        const newX = Math.min(Math.max(item.x + info.offset.x, 0), rect.width - 240);
        const newY = Math.min(Math.max(item.y + info.offset.y, 0), rect.height - 240);
        return { ...item, x: newX, y: newY };
      }
      return item;
    });
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  };

  const handlePrintPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    const newItem: CorkboardItem = {
      id: `polaroid-${Date.now()}`,
      type: 'polaroid',
      x: 100 + Math.random() * 50,
      y: 120 + Math.random() * 50,
      rotation: (Math.random() * 6) - 3,
      image: photoUrl,
      content: photoCaption || 'Candid moment...'
    };

    saveItems([...items, newItem]);
    setIsCameraModalOpen(false);
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleAddSticky = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent) return;

    const newItem: CorkboardItem = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: 150 + Math.random() * 50,
      y: 150 + Math.random() * 50,
      rotation: (Math.random() * 6) - 3,
      color: noteColor,
      content: noteContent
    };

    saveItems([...items, newItem]);
    setIsNoteModalOpen(false);
    setNoteContent('');
  };

  const addSticker = (stickerType: string) => {
    const newItem: CorkboardItem = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: 200 + Math.random() * 100,
      y: 180 + Math.random() * 100,
      rotation: (Math.random() * 12) - 6,
      color: stickerType
    };
    saveItems([...items, newItem]);
  };

  const addWashiTape = () => {
    const tapeColors = ['rgba(194, 65, 12, 0.25)', 'rgba(52, 78, 65, 0.25)', 'rgba(112, 112, 112, 0.25)'];
    const selectedColor = tapeColors[Math.floor(Math.random() * tapeColors.length)];

    const newItem: CorkboardItem = {
      id: `tape-${Date.now()}`,
      type: 'tape',
      x: 250 + Math.random() * 80,
      y: 120 + Math.random() * 80,
      rotation: (Math.random() * 10) - 5,
      color: selectedColor
    };
    saveItems([...items, newItem]);
  };

  const clearBoard = () => {
    if (confirm('Are you sure you want to clear the board?')) {
      saveItems([]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#111111] relative select-none overflow-hidden">
      
      {/* Editorial Header & Action bar */}
      <div className="p-8 border-b border-[#333333] flex flex-col md:flex-row md:items-center justify-between gap-6 z-20 bg-[#1a1a1a] shadow-xs">
        <div>
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Shared Canvas</span>
          <h1 className="font-serif text-3xl font-bold text-[#f9f8f6] mt-1">Couple Board</h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Pin notes, print polaroids, add tapes and stickers. Drag items around to design our joint memory space.
          </p>
        </div>
        
        {/* Collaborative Actions */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setIsCameraModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] bg-[#1a1a1a] hover:border-[#1a1a1a] text-xs font-serif text-[#f9f8f6] transition-all card-shadow"
          >
            <Camera size={13} className="text-[#c2410c]" />
            <span>Add Polaroid</span>
          </button>
          <button 
            onClick={() => setIsNoteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] bg-[#1a1a1a] hover:border-[#1a1a1a] text-xs font-serif text-[#f9f8f6] transition-all card-shadow"
          >
            <Plus size={13} className="text-[#344e41]" />
            <span>Add Note</span>
          </button>
          <button 
            onClick={addWashiTape}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] bg-[#1a1a1a] hover:border-[#1a1a1a] text-xs font-serif text-[#f9f8f6] transition-all card-shadow"
          >
            <span>Washi Tape</span>
          </button>
          <button 
            onClick={clearBoard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-600 text-xs font-serif text-red-600 hover:bg-red-50/50 transition-all shadow-xs"
          >
            <Trash2 size={12} />
            <span>Clear Board</span>
          </button>
        </div>
      </div>

      {/* Floating Sticker Palette */}
      <div className="absolute right-6 top-36 z-20 bg-[#1a1a1a] border border-[#333333] p-3 rounded-lg shadow-lg flex flex-col items-center gap-3.5">
        <span className="text-[8px] font-serif text-[#a0a0a0] uppercase tracking-wider font-semibold">Stickers</span>
        <button onClick={() => addSticker('heart')} className="text-[#c2410c] hover:scale-110 transition-transform"><Heart size={18} fill="currentColor" className="opacity-80" /></button>
        <button onClick={() => addSticker('star')} className="text-yellow-600 hover:scale-110 transition-transform"><Star size={18} fill="currentColor" className="opacity-85" /></button>
        <button onClick={() => addSticker('sparkle')} className="text-[#344e41] hover:scale-110 transition-transform"><Sparkles size={18} className="opacity-80" /></button>
        <button onClick={() => addSticker('smile')} className="text-stone-700 hover:scale-110 transition-transform"><Smile size={18} className="opacity-80" /></button>
      </div>

      {/* Main Corkboard Workspace Area with Minimal Grid pattern */}
      <div 
        ref={boardRef}
        className="flex-1 w-full h-full relative p-8 overflow-hidden z-10"
        style={{
          backgroundColor: '#f9f8f6',
          backgroundImage: 'radial-gradient(#e6e4df 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      >
        <AnimatePresence>
          {items.map((item) => {
            return (
              <motion.div
                key={item.id}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragConstraints={boardRef}
                onDragEnd={(e, info) => handleDragEnd(item.id, info)}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: item.rotation,
                  x: item.x,
                  y: item.y
                }}
                exit={{ scale: 0, opacity: 0 }}
                whileDrag={{ scale: 1.02, zIndex: 100, cursor: 'grabbing' }}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{
                  transformOrigin: 'center center'
                }}
              >
                
                {/* Visual rendering based on item type */}
                {item.type === 'polaroid' && (
                  <div className="bg-[#1a1a1a] p-3 pb-8 border border-[#333333] rounded-lg w-52 shadow-md relative group">
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white p-1 rounded-full hover:scale-105"
                    >
                      <X size={10} />
                    </button>
                    
                    {/* Modern Polaroid Pin Replacement (subtle dot anchor) */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border border-[#333333] rounded-full shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#c2410c] rounded-full"></div>
                    </div>
                    
                    <div className="w-full aspect-square bg-[#1a1a1a] overflow-hidden border border-[#333333]/60 rounded-md">
                      <img 
                        src={item.image} 
                        alt="Pinned Memory" 
                        className="w-full h-full object-cover pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-300" 
                      />
                    </div>
                    <div className="mt-3 font-serif text-sm font-bold text-[#f9f8f6] text-center leading-none px-1 truncate">
                      {item.content}
                    </div>
                  </div>
                )}

                {item.type === 'sticky' && (
                  <div 
                    className="p-4 w-44 aspect-square shadow-sm relative group border border-[#333333] rounded-lg flex flex-col justify-between"
                    style={{ 
                      backgroundColor: item.color || '#ffffff'
                    }}
                  >
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-100 text-[#a0a0a0] hover:text-[#f9f8f6] p-0.5 rounded-full border border-[#333333]"
                    >
                      <X size={10} />
                    </button>
                    
                    {/* Minimal Pin dot */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1a1a1a] border border-[#333333] rounded-full shadow-xs flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[#344e41] rounded-full"></div>
                    </div>

                    <p className="font-serif text-xs text-[#f9f8f6] leading-relaxed flex-1 select-text selection:bg-[#c2410c]/10 break-words mt-1">
                      {item.content}
                    </p>
                    
                    <div className="text-[7px] font-mono text-[#a0a0a0]/60 tracking-wider text-right mt-2 uppercase pointer-events-none font-semibold">
                      Private Note
                    </div>
                  </div>
                )}

                {item.type === 'sticker' && (
                  <div className="relative group p-2">
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white p-0.5 rounded-full z-10"
                    >
                      <X size={8} />
                    </button>
                    {item.color === 'heart' && <Heart size={28} fill="#c2410c" className="text-[#c2410c] drop-shadow-xs" />}
                    {item.color === 'star' && <Star size={28} fill="#ca8a04" className="text-[#ca8a04] drop-shadow-xs" />}
                    {item.color === 'sparkle' && <Sparkles size={28} className="text-[#344e41] drop-shadow-xs" />}
                    {item.color === 'smile' && <Smile size={28} fill="#707070" className="text-[#f9f8f6] drop-shadow-xs" />}
                  </div>
                )}

                {item.type === 'tape' && (
                  <div className="relative group">
                    <button 
                      onClick={() => deleteItem(item.id)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white p-0.5 rounded-full z-10"
                    >
                      <X size={8} />
                    </button>
                    <div 
                      className="w-24 h-5 border-y border-dashed border-white/20 shadow-xs"
                      style={{ backgroundColor: item.color || 'rgba(112, 112, 112, 0.2)' }}
                    ></div>
                  </div>
                )}

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Polaroid Print Camera Modal */}
      <AnimatePresence>
        {isCameraModalOpen && (
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
                onClick={() => setIsCameraModalOpen(false)}
                className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6]"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <Camera className="text-[#c2410c] w-5 h-5" />
                <h3 className="font-serif text-[#f9f8f6] text-xl font-bold">Print a Polaroid</h3>
              </div>

              <form onSubmit={handlePrintPhoto} className="space-y-4">
                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-2">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="Paste image link here..." 
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                {/* Preset suggestions */}
                <div>
                  <label className="block font-serif text-[10px] text-[#a0a0a0] font-semibold uppercase tracking-wider mb-2">Or Choose preset</label>
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
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-2">Caption Note</label>
                  <input 
                    type="text" 
                    placeholder="Write a sweet label..." 
                    maxLength={30}
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-3 rounded-lg font-serif uppercase tracking-widest text-xs transition-colors shadow-sm mt-2 font-bold"
                >
                  Print Photo
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Note Modal */}
      <AnimatePresence>
        {isNoteModalOpen && (
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
                onClick={() => setIsNoteModalOpen(false)}
                className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6]"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <Plus className="text-[#344e41] w-5 h-5" />
                <h3 className="font-serif text-[#f9f8f6] text-xl font-bold">Write Sticky Note</h3>
              </div>

              <form onSubmit={handleAddSticky} className="space-y-4">
                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-2">Note Message</label>
                  <textarea 
                    placeholder="Type your message..." 
                    maxLength={100}
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
                  />
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-2">Card Theme</label>
                  <div className="flex gap-4">
                    {[
                      { color: '#ffffff', name: 'White' },
                      { color: '#fdfbf7', name: 'Alabaster' },
                      { color: '#f5efe6', name: 'Cream' },
                      { color: '#e8ece9', name: 'Sage tint' }
                    ].map((theme) => (
                      <button
                        key={theme.color}
                        type="button"
                        onClick={() => setNoteColor(theme.color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${noteColor === theme.color ? 'border-[#1a1a1a] scale-105 shadow-md' : 'border-[#333333]'}`}
                        style={{ backgroundColor: theme.color }}
                        title={theme.name}
                      />
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-3 rounded-lg font-serif uppercase tracking-widest text-xs transition-colors shadow-sm mt-2 font-bold"
                >
                  Pin Note
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
