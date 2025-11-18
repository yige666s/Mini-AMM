'use client'

import { useWeb3 } from '@/lib/Web3Context'
import { useState, useRef, useEffect } from 'react'

export default function ConnectButton() {
  const { account, isConnecting, connect, disconnect, chainId } = useWeb3()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (id: number | null) => {
    switch (id) {
      case 1:
        return 'Ethereum'
      case 11155111:
        return 'Sepolia'
      case 31337:
        return 'Hardhat'
      default:
        return 'Unknown'
    }
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      alert('地址已复制到剪贴板')
    }
  }

  if (!account) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isConnecting ? '连接中...' : '连接钱包'}
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>{formatAddress(account)}</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-1">已连接网络</p>
            <p className="text-sm font-semibold">{getChainName(chainId)}</p>
          </div>
          
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-500 mb-1">钱包地址</p>
            <p className="text-sm font-mono">{formatAddress(account)}</p>
          </div>

          <button
            onClick={copyAddress}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition"
          >
            复制地址
          </button>

          <button
            onClick={() => {
              disconnect()
              setShowMenu(false)
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 transition"
          >
            断开连接
          </button>
        </div>
      )}
    </div>
  )
}
