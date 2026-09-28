'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getAtmosphereEngine, 
  AtmosphereSoundType, 
  AtmosphereLayers 
} from '@/lib/atmosphereEngine';

export interface AtmospherePreset {
  id: string;
  name: string;
  bengaliName: string;
  icon: string;
  description: string;
  layers: AtmosphereLayers;
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = [
  {
    id: 'rain_window',
    name: 'Windowpane Rain',
    bengaliName: 'কাচের জানালায় বৃষ্টি',
    icon: '🌧️',
    description: 'Authentic gentle rain on glass and distant precipitation',
    layers: { rain: 0.85, fireplace: 0.0, vinyl: 0.20, crickets: 0.0, wind: 0.0, birds: 0.0 },
  },
  {
    id: 'hearth_fire',
    name: 'Hearth Fireplace',
    bengaliName: 'উষ্ণ অগ্নিকুণ্ডের সুর',
    icon: '🔥',
    description: 'Studio-recorded oak wood crackles and popping hearth embers',
    layers: { rain: 0.0, fireplace: 0.90, vinyl: 0.15, crickets: 0.0, wind: 0.0, birds: 0.0 },
  },
  {
    id: 'vintage_gramophone',
    name: 'Gramophone 78 RPM',
    bengaliName: 'ভিন্টেজ গ্রামোফোন ও হিস',
    icon: '📻',
    description: 'Authentic 78 RPM shellac record surface noise & needle clicks',
    layers: { rain: 0.0, fireplace: 0.0, vinyl: 0.85, crickets: 0.0, wind: 0.0, birds: 0.0 },
  },
  {
    id: 'midnight_summer',
    name: 'Midnight Breeze & Crickets',
    bengaliName: 'নিশীথ বাতাস ও ঝিঁঝিঁ',
    icon: '🌙',
    description: 'Soothing summer night crickets and gentle nocturnal wind',
    layers: { rain: 0.0, fireplace: 0.0, vinyl: 0.10, crickets: 0.85, wind: 0.45, birds: 0.0 },
  },
  {
    id: 'cozy_study',
    name: 'Cozy Study Room',
    bengaliName: 'বৃষ্টি ও অগ্নিকুণ্ডের মেলবন্ধন',
    icon: '☕',
    description: 'Rich harmony of soft rainfall, fireside crackles, and vinyl needle',
    layers: { rain: 0.70, fireplace: 0.50, vinyl: 0.30, crickets: 0.0, wind: 0.0, birds: 0.0 },
  },
  {
    id: 'dawn_garden',
    name: 'Dawn Garden & Songbirds',
    bengaliName: 'ভোরের পাখি ও শান্ত হাওয়া',
    icon: '🐦',
    description: 'Gentle morning birdsong and peaceful outdoor breeze',
    layers: { rain: 0.0, fireplace: 0.0, vinyl: 0.0, crickets: 0.0, wind: 0.35, birds: 0.80 },
  },
];

interface AtmosphereContextType {
  isPlaying: boolean;
  masterVolume: number;
  layers: AtmosphereLayers;
  activePresetId: string | null;
  isSoundboardOpen: boolean;
  togglePlay: () => void;
  playPreset: (presetId: string) => void;
  setLayerVolume: (type: AtmosphereSoundType, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  stopAll: () => void;
  setIsSoundboardOpen: (open: boolean) => void;
  openSoundboard: () => void;
  closeSoundboard: () => void;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.75);
  const [layers, setLayersState] = useState<AtmosphereLayers>({
    rain: 0.85,
    fireplace: 0.0,
    vinyl: 0.20,
    crickets: 0.0,
    wind: 0.0,
    birds: 0.0,
  });
  const [activePresetId, setActivePresetId] = useState<string | null>('rain_window');
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('post_heart_atmosphere');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.layers) {
          setLayersState(prev => ({ ...prev, ...parsed.layers }));
        }
        if (typeof parsed.masterVolume === 'number') {
          setMasterVolumeState(parsed.masterVolume);
        }
        if (parsed.activePresetId) {
          setActivePresetId(parsed.activePresetId);
        }
      }
    } catch (e) {}
  }, []);

  // Save preferences
  const savePreferences = (newLayers: AtmosphereLayers, newMaster: number, newPreset: string | null) => {
    try {
      localStorage.setItem('post_heart_atmosphere', JSON.stringify({
        layers: newLayers,
        masterVolume: newMaster,
        activePresetId: newPreset,
      }));
    } catch (e) {}
  };

  const togglePlay = useCallback(() => {
    const engine = getAtmosphereEngine();
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.setMasterVolume(masterVolume);
      engine.setLayers(layers);
      engine.start();
      setIsPlaying(true);
    }
  }, [isPlaying, masterVolume, layers]);

  const playPreset = useCallback((presetId: string) => {
    const preset = ATMOSPHERE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setLayersState(preset.layers);
    savePreferences(preset.layers, masterVolume, presetId);

    const engine = getAtmosphereEngine();
    engine.setMasterVolume(masterVolume);
    engine.setLayers(preset.layers);
    if (!isPlaying) {
      engine.start();
      setIsPlaying(true);
    }
  }, [masterVolume, isPlaying]);

  const setLayerVolume = useCallback((type: AtmosphereSoundType, volume: number) => {
    setLayersState(prev => {
      const next = { ...prev, [type]: volume };
      const engine = getAtmosphereEngine();
      engine.setLayerVolume(type, volume);
      setActivePresetId(null); // Custom blend
      savePreferences(next, masterVolume, null);
      return next;
    });

    if (!isPlaying && volume > 0) {
      const engine = getAtmosphereEngine();
      engine.start();
      setIsPlaying(true);
    }
  }, [masterVolume, isPlaying]);

  const setMasterVolume = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    const engine = getAtmosphereEngine();
    engine.setMasterVolume(volume);
    savePreferences(layers, volume, activePresetId);
  }, [layers, activePresetId]);

  const stopAll = useCallback(() => {
    const engine = getAtmosphereEngine();
    engine.pause();
    setIsPlaying(false);
  }, []);

  const openSoundboard = useCallback(() => setIsSoundboardOpen(true), []);
  const closeSoundboard = useCallback(() => setIsSoundboardOpen(false), []);

  return (
    <AtmosphereContext.Provider
      value={{
        isPlaying,
        masterVolume,
        layers,
        activePresetId,
        isSoundboardOpen,
        togglePlay,
        playPreset,
        setLayerVolume,
        setMasterVolume,
        stopAll,
        setIsSoundboardOpen,
        openSoundboard,
        closeSoundboard,
      }}
    >
      {children}
    </AtmosphereContext.Provider>
  );
}

export function useAtmosphere() {
  const context = useContext(AtmosphereContext);
  if (!context) {
    throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  }
  return context;
}
