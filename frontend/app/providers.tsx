'use client'

import * as React from 'react'
import { Web3Provider } from '../lib/Web3Context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      {children}
    </Web3Provider>
  )
}
