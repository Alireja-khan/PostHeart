'use client'

import { SessionProvider } from 'next-auth/react'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { DialogProvider } from '@/components/DialogProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DialogProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </DialogProvider>
    </SessionProvider>
  )
}

