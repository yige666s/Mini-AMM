'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'

export default function PoolPage() {
  const [chartDuration, setChartDuration] = useState('24H')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar currentPath="/pool" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">流动性池信息</h1>
          <p className="text-gray-600">查看 TKA/TKB 流动性池的实时数据和历史统计</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">总锁定价值 (TVL)</h3>
              <div className="text-2xl">💰</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">$20,000</p>
            <p className="text-sm text-green-600 mt-2">+5.2% 24h</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">24h 交易量</h3>
              <div className="text-2xl">📊</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">$1,234</p>
            <p className="text-sm text-gray-500 mt-2">15 笔交易</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">24h 手续费</h3>
              <div className="text-2xl">💵</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">$3.70</p>
            <p className="text-sm text-gray-500 mt-2">0.3% 费率</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">池子储备量</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                    A
                  </div>
                  <div>
                    <p className="font-semibold">Token A (TKA)</p>
                    <p className="text-sm text-gray-500">10,000 TKA</p>
                  </div>
                </div>
                <p className="text-lg font-bold">$10,000</p>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                    B
                  </div>
                  <div>
                    <p className="font-semibold">Token B (TKB)</p>
                    <p className="text-sm text-gray-500">10,000 TKB</p>
                  </div>
                </div>
                <p className="text-lg font-bold">$10,000</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">当前价格</span>
                <span className="font-semibold">1 TKA = 1.000 TKB</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">流动性提供者</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">总 LP Token</span>
                <span className="font-semibold">9,000 MINI-LP</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">LP 持有人</span>
                <span className="font-semibold">5 人</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">累积手续费 (A)</span>
                <span className="font-semibold">3.5 TKA</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">累积手续费 (B)</span>
                <span className="font-semibold">3.5 TKB</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-800">
                  <p className="font-semibold">自动复投已启用</p>
                  <p className="text-xs mt-1">Bot 会每 5 分钟自动将手续费复投回池子</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">价格历史</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setChartDuration('24H')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartDuration === '24H' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                24H
              </button>
              <button 
                onClick={() => setChartDuration('7D')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartDuration === '7D' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                7D
              </button>
              <button 
                onClick={() => setChartDuration('30D')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  chartDuration === '30D' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30D
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-400">价格图表 - {chartDuration}</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">最近交易</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-600 border-b">
                  <th className="pb-3 font-medium">时间</th>
                  <th className="pb-3 font-medium">类型</th>
                  <th className="pb-3 font-medium">输入金额</th>
                  <th className="pb-3 font-medium">输出金额</th>
                  <th className="pb-3 font-medium">账户</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b">
                  <td className="py-3 text-gray-500" colSpan={5}>
                    <div className="text-center py-8">暂无交易记录</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
