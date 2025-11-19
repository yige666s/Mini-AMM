'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  TrendingUp, 
  Droplet, 
  Bot, 
  Zap, 
  Shield, 
  Database, 
  BarChart3, 
  ChevronDown, 
  ChevronRight,
  ArrowRight,
  Coins,
  RefreshCw,
  Activity
} from 'lucide-react'
import Navbar from './components/Navbar'

interface Feature {
  id: string
  title: string
  description: string
  icon: any
  category: string
  benefits: string[]
  link: string
  buttonText: string
  gradient: string
  borderColor: string
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const features: Feature[] = [
    {
      id: 'swap',
      title: '代币交换',
      description: '基于恒定乘积算法（x*y=k）的自动做市商，快速便捷地交换您的数字资产',
      icon: TrendingUp,
      category: 'trading',
      benefits: [
        '低手续费 - 仅收取 0.3% 交易费用',
        '即时成交 - 无需等待订单匹配',
        '透明定价 - 基于数学公式的公平定价',
        '无滑点保护 - 自动计算最优交易路径'
      ],
      link: '/swap',
      buttonText: '开始交换',
      gradient: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'liquidity',
      title: '流动性提供',
      description: '存入您的资产到流动性池，赚取持续的交易手续费收益',
      icon: Droplet,
      category: 'liquidity',
      benefits: [
        '被动收益 - 每笔交易赚取 0.3% 手续费',
        'LP 代币 - 获得流动性凭证代币',
        '灵活存取 - 随时添加或移除流动性',
        '收益可视化 - 实时查看您的收益统计'
      ],
      link: '/liquidity',
      buttonText: '管理流动性',
      gradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      id: 'bot',
      title: '自动复投机器人',
      description: '智能机器人自动将累积的手续费收益再投资，实现复利增长',
      icon: Bot,
      category: 'automation',
      benefits: [
        '自动复投 - 定期将手续费重新注入流动性',
        '智能触发 - 当手续费达到阈值时自动执行',
        '复利增长 - 让您的资产持续增长',
        '完整记录 - 查看所有复投操作历史'
      ],
      link: '/bot',
      buttonText: '查看机器人',
      gradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'rebalance',
      title: '自动再平衡',
      description: '智能监控价格偏差，自动调整池子储备量，保持价格稳定',
      icon: RefreshCw,
      category: 'automation',
      benefits: [
        '价格稳定 - 自动修正价格偏差',
        '智能监控 - 实时检测储备比例',
        '自动执行 - 无需人工干预',
        '降低风险 - 减少无常损失'
      ],
      link: '/pool',
      buttonText: '查看池子',
      gradient: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30'
    },
    {
      id: 'pool',
      title: '池子状态监控',
      description: '实时查看流动性池的储备量、价格、手续费收入等关键指标',
      icon: Database,
      category: 'analytics',
      benefits: [
        '实时数据 - 查看当前储备量和价格',
        '历史图表 - 价格走势可视化',
        '交易记录 - 完整的交易历史',
        '收益统计 - 手续费收入追踪'
      ],
      link: '/pool',
      buttonText: '查看详情',
      gradient: 'from-teal-500/10 to-cyan-500/10',
      borderColor: 'border-teal-500/30'
    },
    {
      id: 'subgraph',
      title: 'The Graph 数据索引',
      description: '使用 The Graph 协议索引所有链上事件，提供快速的历史数据查询',
      icon: BarChart3,
      category: 'analytics',
      benefits: [
        '快速查询 - 毫秒级数据检索',
        '完整历史 - 所有链上事件记录',
        '实时同步 - 自动更新最新数据',
        'GraphQL API - 灵活的数据查询'
      ],
      link: '/pool',
      buttonText: '查看数据',
      gradient: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/30'
    }
  ]

  const categories = [
    { id: 'all', name: '全部功能', icon: Activity },
    { id: 'trading', name: '交易', icon: TrendingUp },
    { id: 'liquidity', name: '流动性', icon: Droplet },
    { id: 'automation', name: '自动化', icon: Bot },
    { id: 'analytics', name: '数据分析', icon: BarChart3 }
  ]

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredFeatures = features.filter(feature => {
    const matchSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = category === 'all' || feature.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentPath="/" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-30 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 rounded-2xl">
                <Coins className="text-white" size={48} />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Mini-AMM 智能交易平台
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            简单、安全、自动化的去中心化交易协议
          </p>
          <p className="text-sm text-gray-400">
            基于恒定乘积算法（x*y=k）+ 自动复投 + The Graph 数据索引
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索功能或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    category === cat.id
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Icon size={18} />
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <Zap className="text-blue-400" size={24} />
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">实时</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">0.3%</div>
            <div className="text-sm text-gray-300">交易手续费</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <Shield className="text-green-400" size={24} />
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">安全</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">100%</div>
            <div className="text-sm text-gray-300">去中心化</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <Bot className="text-purple-400" size={24} />
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">自动</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-1">24/7</div>
            <div className="text-sm text-gray-300">机器人运行</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="text-yellow-400" size={24} />
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">透明</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">{filteredFeatures.length}</div>
            <div className="text-sm text-gray-300">核心功能</div>
          </div>
        </div>

        {/* Main Content - Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredFeatures.map(feature => {
            const Icon = feature.icon
            const isExpanded = expandedCards[feature.id]
            
            return (
              <div
                key={feature.id}
                className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`bg-gradient-to-br ${feature.gradient} p-3 rounded-lg border ${feature.borderColor}`}>
                      <Icon className="text-blue-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <button
                    onClick={() => toggleCard(feature.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 leading-relaxed">{feature.description}</p>

                {/* Benefits - Expandable */}
                {isExpanded && (
                  <div className="mb-4 space-y-2 animate-fade-in">
                    <div className="text-sm font-semibold text-gray-400 mb-2">💡 核心优势：</div>
                    {feature.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm text-gray-300">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Link
                  href={feature.link}
                  className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all hover:shadow-lg group"
                >
                  <span>{feature.buttonText}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Tips Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3 rounded-lg border border-indigo-500/30">
              <Zap className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">快速开始</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-3xl mb-3">🔗</div>
              <h4 className="font-semibold text-lg mb-2 text-white">1. 连接钱包</h4>
              <p className="text-sm text-gray-400">点击右上角按钮连接您的 MetaMask 钱包</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-3xl mb-3">💰</div>
              <h4 className="font-semibold text-lg mb-2 text-white">2. 获取代币</h4>
              <p className="text-sm text-gray-400">准备 Token A 和 Token B 用于交易或提供流动性</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold text-lg mb-2 text-white">3. 开始使用</h4>
              <p className="text-sm text-gray-400">交换代币或提供流动性，享受自动复投收益</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📚</div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">了解更多</h4>
                <p className="text-sm text-gray-300">
                  Mini-AMM 采用恒定乘积做市商（CPMM）算法，每笔交易收取 0.3% 手续费分配给流动性提供者。
                  智能机器人会自动将累积的手续费再投资到流动性池，实现复利增长。
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800/50 backdrop-blur mt-12 py-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-2 rounded-lg">
                <Coins className="text-white" size={24} />
              </div>
              <div>
                <div className="text-white font-bold">Mini-AMM</div>
                <div className="text-sm text-gray-400">智能交易平台</div>
              </div>
            </div>
            <div className="text-center text-gray-400 text-sm">
              <p>简单、安全、智能的去中心化交易协议</p>
            </div>
            <div className="flex space-x-4 text-gray-400 text-sm">
              <span className="flex items-center space-x-1">
                <Shield size={16} />
                <span>100% 去中心化</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap size={16} />
                <span>自动化运营</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
