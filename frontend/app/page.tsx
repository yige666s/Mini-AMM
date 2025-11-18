'use client'

import Link from 'next/link'
import Navbar from './components/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar currentPath="/" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            欢迎来到 Mini-AMM
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            简单、安全、自动化的数字资产交易平台
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="text-3xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-2">代币交换</h3>
            <p className="text-gray-600 mb-4">
              快速、便捷地交换您的数字资产，享受低手续费交易
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
              存入您的资产，赚取持续的交易手续费收益
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
              智能机器人自动将收益再投资，让您的资产持续增长
            </p>
            <Link
              href="/bot"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              查看记录
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-6">平台特色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">✅ 灵活交易</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>随时添加或取出资金</li>
                <li>支持多种代币交换</li>
                <li>仅收取 0.3% 低手续费</li>
                <li>公平透明的定价机制</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🤖 智能自动化</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>自动将收益再投资</li>
                <li>智能价格平衡</li>
                <li>7×24 小时不间断运行</li>
                <li>无需人工操作</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">📊 实时透明</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>实时查看池子状态</li>
                <li>完整的交易历史记录</li>
                <li>清晰的收益统计</li>
                <li>直观的数据图表</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🎨 简单易用</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>友好的用户界面</li>
                <li>一键连接钱包</li>
                <li>支持移动端访问</li>
                <li>实时数据同步</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Mini-AMM - 简单、安全、智能的数字资产交易平台</p>
        </div>
      </footer>
    </div>
  )
}
