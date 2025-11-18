'use client'

import * as React from 'react'
import { Web3Provider } from '../lib/Web3Context'
import { ToastProvider } from '../lib/ToastContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </Web3Provider>
  )
}
