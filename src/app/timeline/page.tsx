'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Heart, X, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  category: 'trip' | 'date' | 'milestone';
}

export default function MemoryTimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<'trip' | 'date' | 'milestone'>('date');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const defaultMilestones: Milestone[] = [
    {
      id: 'default-timeline-1',
      title: 'Our First Encounter',
      date: 'October 12, 2024',
      location: 'Charming Cafe in the Corner',
      description: 'The day we accidentally ordered the same cup of caramel macchiato and laughed about it for hours. It was raining outside, but everything inside felt warm.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      category: 'date'
    },
    {
      id: 'default-timeline-2',
      title: 'Stargazing at the Ridge',
      date: 'December 21, 2024',
      location: 'Blue Ridge Overlook',
      description: 'We sat on the hood of the car with a thermos of hot cocoa. We saw three shooting stars, and we both made the exact same secret wish.',
      image: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80',
      category: 'trip'
    },
    {
      id: 'default-timeline-3',
      title: 'The Key to the Studio',
      date: 'April 05, 2025',
      location: 'Our Cozy Apartment',
      description: 'Moving in together! Signing the lease and sitting on the floor surrounded by empty boxes, eating cold pizza off of cardboard.',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      category: 'milestone'
    },
    {
      id: 'default-timeline-4',
      title: 'Summer Seaside Getaway',
      date: 'July 18, 2025',
      location: 'Cape May Beachhouse',
      description: 'Waking up at 5:00 AM just to watch the sunrise paint the sky pink. Collectible seashells, salty hair, and endless laughter.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      category: 'trip'
    },
    {
      id: 'default-timeline-5',
      title: 'An Unforgettable Anniversary',
      date: 'October 12, 2025',
      location: 'The Old Greenhouse Restaurant',
      description: 'Celebrating one full year of this beautiful journey. The candlelight reflected in your eyes, and a quiet promise for many years to come.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      category: 'milestone'
    }
  ];

  // Presets for easy image choosing
  const imagePresets = [
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80'
  ];

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/timeline');
        const data = await response.json();
        if (data.success && data.data) {
          setMilestones(data.data.length > 0 ? data.data : defaultMilestones);
        } else {
          setMilestones(defaultMilestones);
        }
      } catch (e) {
        setMilestones(defaultMilestones);
      }
    };
    fetchMilestones();
  }, []);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !description) return;

    const newMilestonePayload = {
      title,
      date,
      location,
      description,
      image: image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      category
    };

    try {
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMilestonePayload)
      });
      const data = await response.json();
      if (data.success) {
        setMilestones([...milestones, data.data]);
      }
    } catch(err) {
      console.error(err);
    }
    
    setIsAddModalOpen(false);
    
    // Clear fields
    setTitle('');
    setDate('');
    setLocation('');
    setDescription('');
    setImage('');
    setCategory('date');
  };

  const handleDeleteMilestone = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory milestone?')) {
      if (!id.startsWith('default-')) {
        await fetch(`/api/timeline?id=${id}`, { method: 'DELETE' });
      }
      const updated = milestones.filter(m => m.id !== id);
      setMilestones(updated);
      setSelectedMilestone(null);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#111111] p-8 lg:p-12 overflow-y-auto no-scrollbar">
      
      {/* Editorial Header */}
      <div className="mb-16 max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333333] pb-6">
        <div>
          <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">Chronological Path</span>
          <h1 className="font-serif text-4xl font-bold text-[#f9f8f6] mt-1">Our Shared Timeline</h1>
          <p className="text-sm text-[#a0a0a0] mt-2">
            A visual journal of our favorite memories, road trips, and milestones over the years.
          </p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#333333] bg-[#1a1a1a] hover:border-[#1a1a1a] text-xs font-serif text-[#f9f8f6] transition-all card-shadow font-bold"
        >
          <Plus size={14} className="text-[#c2410c]" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Vertical Timeline container */}
      <div className="max-w-4xl mx-auto relative pb-24">
        
        {/* The Central Line */}
        <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-[1px] bg-[#e6e4df] -translate-x-1/2 z-0"></div>

        <div className="space-y-12 relative z-10">
          {milestones.length === 0 ? (
            <div className="py-24 text-center bg-[#1a1a1a] border border-[#333333] rounded-lg p-8 card-shadow">
              <span className="font-serif italic text-base text-[#a0a0a0]">No milestones added yet. Click "Add Milestone" to start our timeline.</span>
            </div>
          ) : (
            milestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col md:flex-row items-stretch w-full ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Left/Right Card Spacer for Desktop */}
                  <div className="hidden md:block w-1/2" />

                  {/* Timeline Dot in the center */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center mt-6">
                    <div className="w-8 h-8 rounded-full border border-[#333333] bg-[#111111] flex items-center justify-center shadow-xs">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c2410c]"></div>
                    </div>
                  </div>

                  {/* Milestone Card Content */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedMilestone(milestone)}
                      className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 cursor-pointer card-shadow card-hover-shadow group flex flex-col"
                    >
                      {/* Category & Date */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] tracking-widest text-[#a0a0a0] uppercase font-semibold">
                          {milestone.date}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-serif uppercase tracking-wider ${
                          milestone.category === 'trip' 
                            ? 'bg-emerald-50 text-[#344e41] border border-emerald-100' 
                            : milestone.category === 'date'
                            ? 'bg-[#c2410c]/5 text-[#c2410c] border border-[#c2410c]/10'
                            : 'bg-[#1a1a1a] text-[#a0a0a0] border border-[#333333]'
                        }`}>
                          {milestone.category}
                        </span>
                      </div>

                      {/* Image */}
                      <div className="w-full aspect-[16/10] rounded-md overflow-hidden mb-4 bg-[#1a1a1a] border border-[#333333]/60 relative">
                        <img 
                          src={milestone.image} 
                          alt={milestone.title} 
                          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                          loading="lazy"
                        />
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-xl font-bold text-[#f9f8f6] group-hover:text-[#c2410c] transition-colors mb-1">
                        {milestone.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center space-x-1 text-[#a0a0a0] mb-3">
                        <MapPin size={12} className="opacity-75" />
                        <span className="text-xs font-serif italic">{milestone.location}</span>
                      </div>

                      {/* Snippet */}
                      <p className="text-xs text-[#a0a0a0]/90 leading-relaxed font-sans line-clamp-2">
                        {milestone.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#333333]/60 flex justify-between items-center text-[10px] uppercase tracking-widest font-semibold">
                        <div className="flex items-center text-[#c2410c] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>View details</span>
                          <ChevronRight size={10} className="ml-1" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-6"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1a1a] rounded-lg w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col p-6 border border-[#333333]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 text-[#a0a0a0] hover:text-[#f9f8f6] p-1.5 rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <Plus className="text-[#c2410c] w-5 h-5" />
                <h3 className="font-serif text-[#f9f8f6] text-xl font-bold">Add Memory Milestone</h3>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Milestone Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Our First Encounter"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Date</label>
                    <input
                      type="text"
                      placeholder="e.g. October 12, 2024"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                    />
                  </div>

                  <div>
                    <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                    >
                      <option value="date">Date</option>
                      <option value="trip">Trip</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Cape May Beachhouse"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Image URL</label>
                  <input
                    type="text"
                    placeholder="Paste image link here..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a]"
                  />
                </div>

                {/* Preset suggestions */}
                <div>
                  <label className="block font-serif text-[10px] text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Or Choose preset</label>
                  <div className="flex gap-2">
                    {imagePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImage(preset)}
                        className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${image === preset ? 'border-[#c2410c] scale-105' : 'border-transparent'}`}
                      >
                        <img src={preset} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-serif text-xs text-[#a0a0a0] font-semibold uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    placeholder="Tell the story of this beautiful memory..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full bg-[#fdfbf7] border border-[#333333] rounded-lg p-2.5 text-[#f9f8f6] font-serif text-sm focus:outline-none focus:border-[#1a1a1a] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white py-3 rounded-lg font-serif uppercase tracking-widest text-xs transition-colors shadow-sm font-bold mt-2"
                >
                  Save Milestone
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Detail Lightbox Modal */}
      <AnimatePresence>
        {selectedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMilestone(null)}
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#1a1a1a] rounded-lg w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col border border-[#333333]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMilestone(null)}
                className="absolute top-4 right-4 text-white md:text-[#a0a0a0] hover:text-[#f9f8f6] p-1.5 rounded-full hover:bg-[#1a1a1a] md:hover:bg-[#1a1a1a] transition-colors z-20"
              >
                <X size={18} />
              </button>

              {/* Photo Area */}
              <div className="w-full aspect-[16/9] bg-stone-100 overflow-hidden relative border-b border-[#333333]">
                <img
                  src={selectedMilestone.image}
                  alt={selectedMilestone.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-6 flex items-center space-x-2 text-white">
                  <MapPin size={14} className="text-[#c2410c]" />
                  <span className="font-serif text-xs italic tracking-wider">{selectedMilestone.location}</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-baseline border-b border-[#333333] pb-4 mb-5">
                  <h2 className="font-serif text-2xl font-bold text-[#f9f8f6]">
                    {selectedMilestone.title}
                  </h2>
                  <span className="font-serif text-xs tracking-wider text-[#a0a0a0] uppercase font-semibold">
                    {selectedMilestone.date}
                  </span>
                </div>

                <p className="font-serif text-base text-[#f9f8f6] leading-relaxed select-text selection:bg-[#c2410c]/10">
                  {selectedMilestone.description}
                </p>

                <div className="mt-8 pt-4 border-t border-[#333333]/60 flex justify-between items-center text-[#a0a0a0] text-[10px] uppercase tracking-widest font-semibold">
                  <span>Category: {selectedMilestone.category}</span>
                  
                  <button
                    onClick={() => handleDeleteMilestone(selectedMilestone.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Delete Memory</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
