'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function SwapPage() {
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [AtoB, setAtoB] = useState(true)

  const handleSwap = () => {
    console.log('Swap:', { amountIn, amountOut, AtoB })
  }

  const switchDirection = () => {
    setAtoB(!AtoB)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                Mini-AMM
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/swap" className="text-indigo-600 font-semibold">
                交换
              </Link>
              <Link href="/liquidity" className="text-gray-700 hover:text-indigo-600">
                流动性
              </Link>
              <Link href="/pool" className="text-gray-700 hover:text-indigo-600">
                池子
              </Link>
              <Link href="/bot" className="text-gray-700 hover:text-indigo-600">
                Bot 记录
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold mb-6">交换代币</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                从
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                  />
                  <div className="bg-white rounded-lg px-4 py-2 font-semibold">
                    {AtoB ? 'TKA' : 'TKB'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  余额: 0.00
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={switchDirection}
                className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition"
              >
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                到
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <input
                    type="text"
                    value={amountOut}
                    onChange={(e) => setAmountOut(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                    readOnly
                  />
                  <div className="bg-white rounded-lg px-4 py-2 font-semibold">
                    {AtoB ? 'TKB' : 'TKA'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  余额: 0.00
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">价格</span>
                <span className="font-medium">1 TKA = 1.000 TKB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">滑点容差</span>
                <span className="font-medium">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">流动性提供商费用</span>
                <span className="font-medium">0.3%</span>
              </div>
            </div>

            <button
              onClick={handleSwap}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              交换
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">提示</p>
                <p>每笔交易收取 0.3% 的手续费，这些手续费会被自动复投回流动性池。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">最近交易</h3>
          <div className="text-sm text-gray-500 text-center py-8">
            暂无交易记录
          </div>
        </div>
      </main>
    </div>
  )
}
