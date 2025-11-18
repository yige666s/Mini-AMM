'use client'

import Link from 'next/link'
import ConnectButton from './ConnectButton'

interface NavbarProps {
  currentPath?: string
}

export default function Navbar({ currentPath = '/' }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              Mini-AMM
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/swap" 
              className={`${
                currentPath === '/swap' 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors`}
            >
              交换
            </Link>
            <Link 
              href="/liquidity" 
              className={`${
                currentPath === '/liquidity' 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors`}
            >
              流动性
            </Link>
            <Link 
              href="/pool" 
              className={`${
                currentPath === '/pool' 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors`}
            >
              池子
            </Link>
            <Link 
              href="/bot" 
              className={`${
                currentPath === '/bot' 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors`}
            >
              Bot 记录
            </Link>
          </div>
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
