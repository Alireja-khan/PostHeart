'use client'

import { SessionProvider } from 'next-auth/react'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { DialogProvider } from '@/components/DialogProvider'
import { AudioProvider } from '@/contexts/AudioContext'

export function Providers({ children }: { children: React.ReactNode }) {
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

