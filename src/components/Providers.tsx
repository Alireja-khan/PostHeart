'use client'

import { SessionProvider } from 'next-auth/react'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { DialogProvider } from '@/components/DialogProvider'
import { AudioProvider } from '@/contexts/AudioContext'
import { AtmosphereProvider } from '@/contexts/AtmosphereContext'
import AtmosphereSoundboardModal from '@/components/AtmosphereSoundboardModal'

import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const savedAccent = localStorage.getItem('post_heart_accent');
      if (savedAccent) {
        const hexMap: Record<string, string> = {
          rust: '#c2410c',
          sage: '#344e41',
          gold: '#d97706',
          charcoal: '#4b5563'
        };
        const hex = hexMap[savedAccent] || '#c2410c';
        document.documentElement.style.setProperty('--color-rust-terracotta', hex);
        document.documentElement.style.setProperty('--accent-color', hex);
      }
    } catch(e) {}

    const origError = console.error;
    console.error = function(...args: any[]) {
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('bis_skin_checked')) {
          return;
        }
      }
      return origError.apply(console, args);
    };
  }, []);

  return (
    <SessionProvider>
      <DialogProvider>
        <NotificationProvider>
          <AudioProvider>
            <AtmosphereProvider>
              {children}
              <AtmosphereSoundboardModal />
            </AtmosphereProvider>
          </AudioProvider>
        </NotificationProvider>
      </DialogProvider>
    </SessionProvider>
  )
}

