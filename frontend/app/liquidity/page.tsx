'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function LiquidityPage() {
  const [tab, setTab] = useState<'add' | 'remove'>('add')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpAmount, setLpAmount] = useState('')

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
              <Link href="/swap" className="text-gray-700 hover:text-indigo-600">
                交换
              </Link>
              <Link href="/liquidity" className="text-indigo-600 font-semibold">
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
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('add')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tab === 'add'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              添加流动性
            </button>
            <button
              onClick={() => setTab('remove')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                tab === 'remove'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              移除流动性
            </button>
          </div>

          {tab === 'add' ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">添加流动性</h2>
              <p className="text-gray-600">
                添加代币以获得 LP Token，赚取交易手续费
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token A (TKA)
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <input
                    type="text"
                    value={amountA}
                    onChange={(e) => setAmountA(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: 0.00 TKA
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-3xl text-gray-400">+</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token B (TKB)
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <input
                    type="text"
                    value={amountB}
                    onChange={(e) => setAmountB(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: 0.00 TKB
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前价格</span>
                  <span className="font-medium">1 TKA = 1.000 TKB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">池子份额</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预计获得 LP Token</span>
                  <span className="font-medium">0.00</span>
                </div>
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition">
                添加流动性
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">移除流动性</h2>
              <p className="text-gray-600">
                销毁 LP Token 以取回你的代币
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LP Token 数量
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <input
                    type="text"
                    value={lpAmount}
                    onChange={(e) => setLpAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: 0.00 MINI-LP
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  25%
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  50%
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  75%
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  100%
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">将获得 TKA</span>
                  <span className="font-medium">0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">将获得 TKB</span>
                  <span className="font-medium">0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前价格</span>
                  <span className="font-medium">1 TKA = 1.000 TKB</span>
                </div>
              </div>

              <button className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition">
                移除流动性
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">收益说明</p>
                <p>
                  作为流动性提供者，你将获得 0.3% 的交易手续费。
                  这些手续费会被 Bot 自动复投，增加你的 LP Token 价值。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">你的流动性头寸</h3>
          <div className="text-sm text-gray-500 text-center py-8">
            暂无流动性头寸
          </div>
        </div>
      </main>
    </div>
  )
}
