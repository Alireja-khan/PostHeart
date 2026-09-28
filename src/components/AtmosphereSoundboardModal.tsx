'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Flame, 
  Disc, 
  Moon, 
  Wind, 
  Bird,
  Sliders, 
  Sparkles,
  Check
} from 'lucide-react';
import { useAtmosphere, ATMOSPHERE_PRESETS } from '@/contexts/AtmosphereContext';

export default function AtmosphereSoundboardModal() {
  const {
    isPlaying,
    masterVolume,
    layers,
    activePresetId,
    isSoundboardOpen,
    togglePlay,
    playPreset,
    setLayerVolume,
    setMasterVolume,
    closeSoundboard
  } = useAtmosphere();

  if (!isSoundboardOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
        onClick={closeSoundboard}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#16120e] border border-[#3d2f21] rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(194,65,12,0.12)] overflow-hidden max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Vintage Washi Tape Top Accent */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#e8dcbe]/25 border-x border-[#c2b295]/40 backdrop-blur-xs -rotate-1 pointer-events-none shadow-xs" />

          {/* Modal Header */}
          <div className="flex items-start justify-between mb-5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#241a12] border border-[#4a3828] flex items-center justify-center text-[#c2410c] shadow-inner shrink-0">
                <Sparkles size={20} className={isPlaying ? 'animate-spin-slow' : ''} style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#fae1b8] flex items-center gap-2">
                  Atmosphere Engine
                  <span className="text-[10px] font-mono font-normal text-[#c5a059] px-2 py-0.5 rounded-full bg-[#241a12] border border-[#3d2f21]">
                    HD STUDIO AUDIO
                  </span>
                </h3>
                <p className="text-xs text-[#a89b88] font-serif mt-0.5">
                  বাস্তব স্টুডিও রেকর্ডিং — বৃষ্টি, অগ্নিকুণ্ড, গ্রামোফোন ভিনাইল ও নিশীথ হাওয়া
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSoundboard}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a89b88] hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Master Play / Pause Header Banner */}
          <div className="flex items-center justify-between bg-[#1f1711] border border-[#3d2f21] rounded-2xl p-3.5 sm:p-4 mb-5 shadow-inner shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                  isPlaying 
                    ? 'bg-[#c2410c] hover:bg-[#ea580c] text-white shadow-[0_0_20px_rgba(194,65,12,0.4)] scale-105' 
                    : 'bg-[#2a1e15] hover:bg-[#38281c] text-[#fae1b8] border border-[#4a3828]'
                }`}
                title={isPlaying ? 'Pause Atmosphere' : 'Start Atmosphere'}
              >
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
              </button>

              <div>
                <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#c5a059] font-semibold block">
                  {isPlaying ? 'Studio Atmosphere Active • আবহ চলমান' : 'Atmosphere Paused • আবহ বন্ধ'}
                </span>
                <span className="text-[11px] sm:text-xs text-[#dcd1c4] font-serif">
                  {isPlaying ? 'Real acoustic recordings blending with your thoughts.' : 'Tap play to immerse in authentic room ambience.'}
                </span>
              </div>
            </div>

            {/* Soundwave Visualizer Indicator */}
            {isPlaying && (
              <div className="flex items-end gap-1 h-5 sm:h-6 pr-1 sm:pr-2">
                {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h * 40}%`, `${h * 100}%`, `${h * 30}%`] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + i * 0.15,
                      ease: 'easeInOut'
                    }}
                    className="w-1 bg-[#c2410c] rounded-full"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Sound Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
            
            {/* Section 1: Atmosphere Presets */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a89b88]">
                  Atmospheric Presets • পরিবেশ নির্বাচন
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ATMOSPHERE_PRESETS.map((preset) => {
                  const isActive = activePresetId === preset.id && isPlaying;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => playPreset(preset.id)}
                      className={`relative p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive 
                          ? 'bg-[#281d14] border-[#c2410c] shadow-[0_4px_16px_rgba(194,65,12,0.25)]' 
                          : 'bg-[#1a140f] border-[#382b1d] hover:bg-[#221a13] hover:border-[#4a3828]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{preset.icon}</span>
                        {isActive && (
                          <div className="w-4 h-4 rounded-full bg-[#c2410c] flex items-center justify-center text-white">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-xs font-serif font-bold leading-tight ${isActive ? 'text-[#fae1b8]' : 'text-[#dcd1c4]'}`}>
                          {preset.name}
                        </h4>
                        <p className="text-[10px] font-serif text-[#a89b88] mt-0.5 truncate">
                          {preset.bengaliName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Studio Audio Mixer (6 Layer Faders) */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#a89b88] flex items-center gap-1.5">
                  <Sliders size={12} />
                  Studio Acoustic Mixer • সুরের মিশ্রণ
                </span>
                <span className="text-[9px] font-mono text-[#c5a059]">
                  Real-time Faders
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#1a140f] border border-[#382b1d] rounded-2xl p-3.5">
                
                {/* 1. Rain Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#38bdf8] shrink-0" title="Studio Rain">
                    <CloudRain size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Window Rain (বৃষ্টি)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.rain || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.rain || 0}
                      onChange={(e) => setLayerVolume('rain', parseFloat(e.target.value))}
                      className="w-full accent-[#38bdf8] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. Fireplace Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#f97316] shrink-0" title="Oak Fireplace">
                    <Flame size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Fireplace (অগ্নিকুণ্ড)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.fireplace || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.fireplace || 0}
                      onChange={(e) => setLayerVolume('fireplace', parseFloat(e.target.value))}
                      className="w-full accent-[#f97316] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 3. Vinyl Crackle Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#c5a059] shrink-0" title="Gramophone 78 RPM Vinyl">
                    <Disc size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Gramophone (ভিনাইল)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.vinyl || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.vinyl || 0}
                      onChange={(e) => setLayerVolume('vinyl', parseFloat(e.target.value))}
                      className="w-full accent-[#c5a059] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Night Crickets Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#a78bfa] shrink-0" title="Summer Night Crickets">
                    <Moon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Crickets (ঝিঁঝিঁ পোকা)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.crickets || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.crickets || 0}
                      onChange={(e) => setLayerVolume('crickets', parseFloat(e.target.value))}
                      className="w-full accent-[#a78bfa] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 5. Wind Breeze Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#67e8f9] shrink-0" title="Gentle Wind Breeze">
                    <Wind size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Night Wind (শান্ত বাতাস)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.wind || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.wind || 0}
                      onChange={(e) => setLayerVolume('wind', parseFloat(e.target.value))}
                      className="w-full accent-[#67e8f9] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 6. Songbirds Slider */}
                <div className="flex items-center gap-2.5 bg-[#16120e] p-2 rounded-xl border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-[#241a12] border border-[#3d2f21] flex items-center justify-center text-[#4ade80] shrink-0" title="Morning Songbirds">
                    <Bird size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] font-serif text-[#dcd1c4] mb-1">
                      <span className="truncate">Dawn Birds (পাখির ডাক)</span>
                      <span className="font-mono text-[#a89b88] ml-1">{Math.round((layers.birds || 0) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={layers.birds || 0}
                      onChange={(e) => setLayerVolume('birds', parseFloat(e.target.value))}
                      className="w-full accent-[#4ade80] h-1.5 bg-[#2a1e15] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Master Volume Footer */}
          <div className="flex items-center justify-between gap-4 pt-3.5 mt-3 border-t border-[#3d2f21] shrink-0">
            <div className="flex items-center gap-2 text-xs font-serif text-[#a89b88]">
              {masterVolume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>Master Ambience:</span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-[210px]">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full accent-[#c2410c] h-1.5 bg-[#241a12] rounded-lg cursor-pointer"
              />
              <span className="font-mono text-[11px] text-[#c5a059] w-8 text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
