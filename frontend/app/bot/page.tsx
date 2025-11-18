'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function BotPage() {
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
              <Link href="/liquidity" className="text-gray-700 hover:text-indigo-600">
                流动性
              </Link>
              <Link href="/pool" className="text-gray-700 hover:text-indigo-600">
                池子
              </Link>
              <Link href="/bot" className="text-indigo-600 font-semibold">
                Bot 记录
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Keeper Bot 操作记录</h1>
          <p className="text-gray-600">查看自动复投和再平衡的历史记录</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Bot 状态</h3>
              <div className="text-2xl">🤖</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold text-green-600">运行中</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">最后活动: 2 分钟前</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">总复投次数</h3>
              <div className="text-2xl">♻️</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">24</p>
            <p className="text-sm text-gray-500 mt-2">累计复投价值 $120</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">总再平衡次数</h3>
              <div className="text-2xl">⚖️</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500 mt-2">保持价格稳定</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Bot 配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">复投间隔</p>
              <p className="text-lg font-semibold">5 分钟</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">再平衡间隔</p>
              <p className="text-lg font-semibold">1 分钟</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">再平衡阈值</p>
              <p className="text-lg font-semibold">5%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">最大 Gas Price</p>
              <p className="text-lg font-semibold">100 Gwei</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">操作历史</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md">全部</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                复投
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                再平衡
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">♻️</span>
                  </div>
                  <div>
                    <p className="font-semibold">手续费复投</p>
                    <p className="text-sm text-gray-500">2 分钟前</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  成功
                </span>
              </div>
              <div className="ml-13 space-y-1 text-sm">
                <p className="text-gray-600">Token A: 5.2 TKA</p>
                <p className="text-gray-600">Token B: 5.2 TKB</p>
                <p className="text-gray-600">
                  交易哈希:{' '}
                  <a href="#" className="text-indigo-600 hover:underline">
                    0x1234...5678
                  </a>
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">⚖️</span>
                  </div>
                  <div>
                    <p className="font-semibold">价格再平衡</p>
                    <p className="text-sm text-gray-500">15 分钟前</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  成功
                </span>
              </div>
              <div className="ml-13 space-y-1 text-sm">
                <p className="text-gray-600">方向: TKA → TKB</p>
                <p className="text-gray-600">数量: 100 TKA</p>
                <p className="text-gray-600">价格偏差: 6.2%</p>
                <p className="text-gray-600">
                  交易哈希:{' '}
                  <a href="#" className="text-indigo-600 hover:underline">
                    0xabcd...ef01
                  </a>
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">♻️</span>
                  </div>
                  <div>
                    <p className="font-semibold">手续费复投</p>
                    <p className="text-sm text-gray-500">20 分钟前</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  成功
                </span>
              </div>
              <div className="ml-13 space-y-1 text-sm">
                <p className="text-gray-600">Token A: 4.8 TKA</p>
                <p className="text-gray-600">Token B: 4.8 TKB</p>
                <p className="text-gray-600">
                  交易哈希:{' '}
                  <a href="#" className="text-indigo-600 hover:underline">
                    0x2345...6789
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              加载更多
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 border border-indigo-100">
          <h3 className="text-lg font-semibold mb-4 text-indigo-900">Bot 工作原理</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">🔄 自动复投</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">1.</span>
                  <span>每 5 分钟检查累积的手续费</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">2.</span>
                  <span>计算最优复投比例</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">3.</span>
                  <span>将手续费重新注入流动性池</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">4.</span>
                  <span>增加 LP Token 价值</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-indigo-800 mb-2">⚖️ 自动再平衡</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">1.</span>
                  <span>每 1 分钟监控价格偏差</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">2.</span>
                  <span>当偏差超过 5% 时触发</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">3.</span>
                  <span>执行小额 swap 调整比例</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">4.</span>
                  <span>使价格回归目标区间</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
