'use client'

import { useState } from 'react'
import Navbar from '../components/Navbar'
import { useBotActions, useBotStats, useBotConfig } from '@/lib/hooks/useBotActions'

export default function BotPage() {
  const [filter, setFilter] = useState<'all' | 'compound' | 'rebalance'>('all')
  const { actions, loading } = useBotActions(filter, 10)
  const { stats, loading: statsLoading } = useBotStats()
  const { config, loading: configLoading } = useBotConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar currentPath="/bot" />

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
            <p className="text-sm text-gray-500 mt-2">
              最后活动: {statsLoading || !stats.latestAction ? '...' : 
                (() => {
                  const timeAgo = Math.floor((Date.now() - new Date(stats.latestAction.timestamp).getTime()) / 60000)
                  return timeAgo < 60 
                    ? `${timeAgo} 分钟前` 
                    : timeAgo < 1440 
                      ? `${Math.floor(timeAgo / 60)} 小时前`
                      : `${Math.floor(timeAgo / 1440)} 天前`
                })()
              }
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">总复投次数</h3>
              <div className="text-2xl">♻️</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : stats.compoundCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">自动复投操作</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">总再平衡次数</h3>
              <div className="text-2xl">⚖️</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {statsLoading ? '...' : stats.rebalanceCount}
            </p>
            <p className="text-sm text-gray-500 mt-2">保持价格稳定</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Bot 配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">复投间隔</p>
              <p className="text-lg font-semibold">
                {configLoading ? '...' : `${Math.floor(config.compoundInterval / 60)} 分钟`}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">再平衡间隔</p>
              <p className="text-lg font-semibold">
                {configLoading ? '...' : `${config.rebalanceInterval} 秒`}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">再平衡阈值</p>
              <p className="text-lg font-semibold">
                {configLoading ? '...' : `${(config.rebalanceThreshold * 100).toFixed(1)}%`}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">最大 Gas Price</p>
              <p className="text-lg font-semibold">
                {configLoading ? '...' : `${config.maxGasPrice} Gwei`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">操作历史</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              <button 
                onClick={() => setFilter('compound')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'compound' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                复投
              </button>
              <button 
                onClick={() => setFilter('rebalance')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'rebalance' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                再平衡
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : actions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无操作记录</div>
            ) : (
              actions.map((action) => {
                const isCompound = action.actionType === 'COMPOUND'
                const timeAgo = Math.floor((Date.now() - new Date(action.timestamp).getTime()) / 60000)
                const timeText = timeAgo < 60 
                  ? `${timeAgo} 分钟前` 
                  : timeAgo < 1440 
                    ? `${Math.floor(timeAgo / 60)} 小时前`
                    : `${Math.floor(timeAgo / 1440)} 天前`
                
                const isSuccess = action.status === 'success'
                const amountANum = parseFloat(action.amountA) / 1e18
                const amountBNum = parseFloat(action.amountB) / 1e18

                return (
                  <div key={action.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompound ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <span className={`font-bold ${
                            isCompound ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {isCompound ? '♻️' : '⚖️'}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {isCompound ? '手续费复投' : '价格再平衡'}
                          </p>
                          <p className="text-sm text-gray-500">{timeText}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isSuccess 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isSuccess ? '成功' : '失败'}
                      </span>
                    </div>
                    <div className="ml-13 space-y-1 text-sm">
                      {amountANum > 0 && (
                        <p className="text-gray-600">
                          Token A: {amountANum.toFixed(4)} TKA
                        </p>
                      )}
                      {amountBNum > 0 && (
                        <p className="text-gray-600">
                          Token B: {amountBNum.toFixed(4)} TKB
                        </p>
                      )}
                      {action.direction && (
                        <p className="text-gray-600">
                          方向: {action.direction === 'AtoB' ? 'TKA → TKB' : 'TKB → TKA'}
                        </p>
                      )}
                      {action.gasUsed && (
                        <p className="text-gray-600">
                          Gas 使用: {action.gasUsed.toLocaleString()}
                        </p>
                      )}
                      <p className="text-gray-600">
                        交易哈希:{' '}
                        <a 
                          href={`https://etherscan.io/tx/${action.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline font-mono"
                        >
                          {action.txHash.slice(0, 10)}...{action.txHash.slice(-8)}
                        </a>
                      </p>
                    </div>
                  </div>
                )
              })
            )}
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
                  <span>每 {configLoading ? '...' : Math.floor(config.compoundInterval / 60)} 分钟检查累积的手续费</span>
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
                  <span>每 {configLoading ? '...' : config.rebalanceInterval} 秒监控价格偏差</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">2.</span>
                  <span>当偏差超过 {configLoading ? '...' : (config.rebalanceThreshold * 100).toFixed(1)}% 时触发</span>
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
