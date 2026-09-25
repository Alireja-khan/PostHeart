'use client'

import { SessionProvider } from 'next-auth/react'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { DialogProvider } from '@/components/DialogProvider'
import { AudioProvider } from '@/contexts/AudioContext'

import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
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
            {children}
          </AudioProvider>
        </NotificationProvider>
      </DialogProvider>
    </SessionProvider>
  )
}

