'use client';

/**
 * AtmosphereEngine - Studio-Grade Real Audio & Hybrid Ambient Sound Engine
 * 
 * Uses authentic, studio-recorded, high-definition audio loops hosted in /sounds/atmosphere/:
 * - rain_window.ogg & rain.mp3: Real binaural rain on glass windowpane & rainfall
 * - fire.ogg & fireplace.mp3: Real crackling oak fireplace logs & snapping embers
 * - vinyl.mp3: Authentic 78 RPM turntable surface needle crackle & dust pops
 * - crickets.ogg: Serene summer night crickets recording
 * - wind.ogg: Gentle nocturnal wind breeze through trees
 * - birds.ogg: Calming morning songbirds
 * 
 * Features:
 * - HTML5 Audio + Web Audio API Gain Nodes for real-time smooth faders & master volume
 * - Zero external CDN dependencies, instant local loading, seamless looping
 * - Battery-friendly: pauses inactive audio elements
 */

export type AtmosphereSoundType = 'rain' | 'fireplace' | 'vinyl' | 'crickets' | 'wind' | 'birds';

export interface AtmosphereLayers {
  rain: number;
  fireplace: number;
  vinyl: number;
  crickets: number;
  wind: number;
  birds: number;
}

const SOUND_SOURCES: Record<AtmosphereSoundType, string> = {
  rain: '/sounds/atmosphere/rain.mp3',
  fireplace: '/sounds/atmosphere/fire.ogg',
  vinyl: '/sounds/atmosphere/vinyl.mp3',
  crickets: '/sounds/atmosphere/crickets.ogg',
  wind: '/sounds/atmosphere/wind.ogg',
  birds: '/sounds/atmosphere/birds.ogg',
};

class AtmosphereAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;

  // Audio elements for each layer
  private audioElements: Partial<Record<AtmosphereSoundType, HTMLAudioElement>> = {};
  private gainNodes: Partial<Record<AtmosphereSoundType, GainNode>> = {};
  private sourceNodes: Partial<Record<AtmosphereSoundType, MediaElementAudioSourceNode>> = {};

  // Master and individual layer volumes
  private masterVolume = 0.75;
  private layerVolumes: AtmosphereLayers = {
    rain: 0.85,
    fireplace: 0.0,
    vinyl: 0.25,
    crickets: 0.0,
    wind: 0.0,
    birds: 0.0,
  };

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (this.masterGain) return;

    try {
      const ctx = this.getContext();
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, ctx.currentTime);
      this.masterGain.connect(ctx.destination);

      // Initialize all sound layers
      (Object.keys(SOUND_SOURCES) as AtmosphereSoundType[]).forEach((type) => {
        const audio = new Audio(SOUND_SOURCES[type]);
        audio.loop = true;
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';

        this.audioElements[type] = audio;

        try {
          const source = ctx.createMediaElementSource(audio);
          const gain = ctx.createGain();
          const vol = this.layerVolumes[type] || 0;
          gain.gain.setValueAtTime(vol, ctx.currentTime);

          source.connect(gain);
          gain.connect(this.masterGain!);

          this.sourceNodes[type] = source;
          this.gainNodes[type] = gain;
        } catch (e) {
          // If media element source fails (e.g. mobile security restriction), fallback to element volume
          audio.volume = (this.layerVolumes[type] || 0) * this.masterVolume;
        }
      });
    } catch (e) {
      console.warn('Atmosphere Web Audio initialization:', e);
    }
  }

  public start() {
    this.init();
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    this.isRunning = true;

    if (this.masterGain && ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, ctx.currentTime, 0.1);
    }

    // Play all active audio layers
    (Object.keys(this.layerVolumes) as AtmosphereSoundType[]).forEach((type) => {
      const vol = this.layerVolumes[type];
      const audio = this.audioElements[type];
      if (audio && vol > 0.01) {
        audio.play().catch(() => {});
      }
    });
  }

  public pause() {
    this.isRunning = false;
    const ctx = this.ctx;
    if (this.masterGain && ctx) {
      this.masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    }

    // Pause all playing audio elements after a short fade
    setTimeout(() => {
      if (!this.isRunning) {
        Object.values(this.audioElements).forEach((audio) => {
          if (audio) {
            audio.pause();
          }
        });
      }
    }, 120);
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    const ctx = this.ctx;
    if (ctx && this.masterGain && this.isRunning) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, ctx.currentTime, 0.05);
    }

    // Direct audio element volume fallback
    Object.keys(this.layerVolumes).forEach((key) => {
      const type = key as AtmosphereSoundType;
      const audio = this.audioElements[type];
      if (audio && !this.gainNodes[type]) {
        audio.volume = this.layerVolumes[type] * this.masterVolume;
      }
    });
  }

  public setLayerVolume(type: AtmosphereSoundType, vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.layerVolumes[type] = clamped;

    const ctx = this.ctx;
    const gainNode = this.gainNodes[type];
    const audio = this.audioElements[type];

    if (ctx && gainNode) {
      gainNode.gain.setTargetAtTime(clamped, ctx.currentTime, 0.05);
    } else if (audio) {
      audio.volume = clamped * this.masterVolume;
    }

    // Manage play/pause state of the element
    if (audio) {
      if (this.isRunning && clamped > 0.01) {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
      } else if (clamped <= 0.01) {
        audio.pause();
      }
    }
  }

  public setLayers(layers: AtmosphereLayers) {
    (Object.keys(layers) as AtmosphereSoundType[]).forEach((type) => {
      this.setLayerVolume(type, layers[type] || 0);
    });
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      masterVolume: this.masterVolume,
      layers: { ...this.layerVolumes },
    };
  }

  public destroy() {
    this.pause();
    Object.values(this.audioElements).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    });
    this.audioElements = {};
    this.gainNodes = {};
    this.sourceNodes = {};
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

// Singleton audio engine instance
let engineInstance: AtmosphereAudioEngine | null = null;

export function getAtmosphereEngine(): AtmosphereAudioEngine {
  if (typeof window === 'undefined') {
    return {} as AtmosphereAudioEngine;
  }
  if (!engineInstance) {
    engineInstance = new AtmosphereAudioEngine();
  }
  return engineInstance;
}
