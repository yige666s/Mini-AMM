'use client'

import Link from 'next/link'
import { Coins } from 'lucide-react'
import ConnectButton from './ConnectButton'

interface NavbarProps {
  currentPath?: string
}

export default function Navbar({ currentPath = '/' }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                <Coins className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Mini-AMM
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`${
                currentPath === '/' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500'
              } transition-colors`}
            >
              首页
            </Link>
            <Link 
              href="/swap" 
              className={`${
                currentPath === '/swap' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500'
              } transition-colors`}
            >
              交换
            </Link>
            <Link 
              href="/liquidity" 
              className={`${
                currentPath === '/liquidity' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500'
              } transition-colors`}
            >
              流动性
            </Link>
            <Link 
              href="/pool" 
              className={`${
                currentPath === '/pool' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500'
              } transition-colors`}
            >
              池子
            </Link>
            <Link 
              href="/bot" 
              className={`${
                currentPath === '/bot' 
                  ? 'text-blue-500 font-semibold' 
                  : 'text-gray-700 hover:text-blue-500'
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
