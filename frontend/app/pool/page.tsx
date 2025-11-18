'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import { usePoolData } from '@/lib/hooks/usePoolData'
import { useSwapHistory, usePriceHistory } from '@/lib/hooks/useSubgraphData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PoolPage() {
  const [chartDuration, setChartDuration] = useState<'24H' | '7D' | '30D'>('24H')
  const { poolData, loading } = usePoolData()
  const { swaps, loading: swapsLoading } = useSwapHistory(10)
  const { priceData, loading: priceLoading } = usePriceHistory(chartDuration)

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
            <p className="text-3xl font-bold text-gray-900">
              ${loading ? '...' : (parseFloat(poolData.reserveA) + parseFloat(poolData.reserveB)).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">实时数据</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">当前价格</h3>
              <div className="text-2xl">📊</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : poolData.price}
            </p>
            <p className="text-sm text-gray-500 mt-2">1 TKA = {poolData.price} TKB</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">累积手续费</h3>
              <div className="text-2xl">💵</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : parseFloat(poolData.feeA).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-2">TKA 手续费</p>
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
                    <p className="text-sm text-gray-500">
                      {loading ? '...' : parseFloat(poolData.reserveA).toFixed(2)} TKA
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-indigo-600">
                  ${loading ? '...' : parseFloat(poolData.reserveA).toFixed(2)}
                </p>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                    B
                  </div>
                  <div>
                    <p className="font-semibold">Token B (TKB)</p>
                    <p className="text-sm text-gray-500">
                      {loading ? '...' : parseFloat(poolData.reserveB).toFixed(2)} TKB
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  ${loading ? '...' : parseFloat(poolData.reserveB).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">当前价格</span>
                <span className="font-semibold">1 TKA = {poolData.price} TKB</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">流动性提供者</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">总 LP Token</span>
                <span className="font-semibold text-indigo-600">
                  {loading ? '...' : parseFloat(poolData.totalSupply).toFixed(2)} MINI-LP
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">累积手续费 (A)</span>
                <span className="font-semibold text-indigo-600">
                  {loading ? '...' : parseFloat(poolData.feeA).toFixed(2)} TKA
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">累积手续费 (B)</span>
                <span className="font-semibold text-indigo-600">
                  {loading ? '...' : parseFloat(poolData.feeB).toFixed(2)} TKB
                </span>
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
          <div className="h-64">
            {priceLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">加载中...</p>
              </div>
            ) : priceData.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">暂无价格数据</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(timestamp) => {
                      const date = new Date(timestamp)
                      return chartDuration === '24H' 
                        ? date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
                        : date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => value.toFixed(4)}
                  />
                  <Tooltip 
                    labelFormatter={(timestamp) => new Date(timestamp).toLocaleString('zh-CN')}
                    formatter={(value: number) => [value.toFixed(4), 'TKB/TKA']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
                {swapsLoading ? (
                  <tr className="border-b">
                    <td className="py-3 text-gray-500 text-center" colSpan={5}>
                      加载中...
                    </td>
                  </tr>
                ) : swaps.length === 0 ? (
                  <tr className="border-b">
                    <td className="py-3 text-gray-500 text-center" colSpan={5}>
                      暂无交易记录
                    </td>
                  </tr>
                ) : (
                  swaps.map((swap) => (
                    <tr key={swap.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 text-gray-700">
                        {new Date(parseInt(swap.timestamp) * 1000).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          swap.AtoB 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {swap.AtoB ? 'TKA → TKB' : 'TKB → TKA'}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700">
                        {parseFloat(swap.amountIn).toFixed(4)} {swap.AtoB ? 'TKA' : 'TKB'}
                      </td>
                      <td className="py-3 text-gray-700">
                        {parseFloat(swap.amountOut).toFixed(4)} {swap.AtoB ? 'TKB' : 'TKA'}
                      </td>
                      <td className="py-3 text-gray-700 font-mono text-xs">
                        {swap.user.slice(0, 6)}...{swap.user.slice(-4)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
