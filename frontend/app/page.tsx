'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Mini-AMM</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/swap" className="text-gray-700 hover:text-indigo-600">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            欢迎来到 Mini-AMM
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            去中心化交易池 + 自动复投 Bot 综合演示
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">代币交换</h3>
            <p className="text-gray-600 mb-4">
              基于 x*y=k 恒定乘积做市商模型的去中心化交易
            </p>
            <Link
              href="/swap"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              开始交换
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-4">💧</div>
            <h3 className="text-xl font-semibold mb-2">提供流动性</h3>
            <p className="text-gray-600 mb-4">
              添加流动性获得 LP Token，赚取交易手续费
            </p>
            <Link
              href="/liquidity"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              管理流动性
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">自动复投</h3>
            <p className="text-gray-600 mb-4">
              Bot 自动将手续费复投回流动性池，提高收益
            </p>
            <Link
              href="/bot"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              查看 Bot
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6">核心功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">✅ 去中心化交易池</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>添加/移除流动性</li>
                <li>代币交换（TokenA ⇄ TokenB）</li>
                <li>0.3% 交易手续费</li>
                <li>Uniswap V2 AMM 模型</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🤖 自动化机器人</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>每 5 分钟自动复投手续费</li>
                <li>价格偏离时自动再平衡</li>
                <li>多节点 RPC 故障转移</li>
                <li>Gas 优化策略</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">📊 数据索引</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>实时索引链上事件</li>
                <li>GraphQL 查询接口</li>
                <li>历史数据分析</li>
                <li>时间序列图表</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🎨 现代化界面</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Next.js + React</li>
                <li>Wagmi + RainbowKit</li>
                <li>响应式设计</li>
                <li>实时数据更新</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">技术栈</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold mb-2">智能合约</h4>
              <p className="text-sm opacity-90">Solidity</p>
              <p className="text-sm opacity-90">Hardhat</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">数据索引</h4>
              <p className="text-sm opacity-90">The Graph</p>
              <p className="text-sm opacity-90">GraphQL</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">后端 Bot</h4>
              <p className="text-sm opacity-90">Go</p>
              <p className="text-sm opacity-90">go-ethereum</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">前端</h4>
              <p className="text-sm opacity-90">Next.js</p>
              <p className="text-sm opacity-90">Wagmi</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Mini-AMM Demo Project - 展示完整的 Web3 DeFi 协议</p>
        </div>
      </footer>
    </div>
  )
}
