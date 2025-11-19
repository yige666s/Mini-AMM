'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Navbar from '../components/Navbar'
import { useWeb3 } from '@/lib/Web3Context'
import { useContracts } from '@/lib/hooks/useContracts'
import { useTokenBalance } from '@/lib/hooks/useTokenBalance'
import { usePoolData } from '@/lib/hooks/usePoolData'
import { useToast } from '@/lib/ToastContext'

export default function LiquidityPage() {
  const { account, connect } = useWeb3()
  const { miniAMM, tokenA, tokenB } = useContracts()
  const { poolData } = usePoolData()
  const { showToast } = useToast()
  const [tab, setTab] = useState<'add' | 'remove'>('add')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [lpAmount, setLpAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [lpBalance, setLpBalance] = useState('0.00')

  const balanceA = useTokenBalance('A')
  const balanceB = useTokenBalance('B')

  const refreshLpBalance = async () => {
    if (miniAMM && account) {
      try {
        const balance = await miniAMM.balanceOf(account)
        setLpBalance(ethers.formatEther(balance))
      } catch (error) {
        console.error('获取 LP 余额失败:', error)
      }
    }
  }

  useEffect(() => {
    refreshLpBalance()
  }, [miniAMM, account])

  const handleAddLiquidity = async () => {
    if (!account) {
      await connect()
      return
    }

    if (!miniAMM || !tokenA || !tokenB || !amountA || !amountB) {
      showToast('请输入有效的数量', 'warning')
      return
    }

    try {
      setIsProcessing(true)
      setTxHash('')

      const amountAWei = ethers.parseEther(amountA)
      const amountBWei = ethers.parseEther(amountB)

      const [allowanceA, allowanceB] = await Promise.all([
        tokenA.allowance(account, await miniAMM.getAddress()),
        tokenB.allowance(account, await miniAMM.getAddress()),
      ])

      if (allowanceA < amountAWei) {
        showToast('正在授权 Token A...', 'info')
        const approveTx = await tokenA.approve(await miniAMM.getAddress(), ethers.MaxUint256)
        await approveTx.wait()
      }

      if (allowanceB < amountBWei) {
        showToast('正在授权 Token B...', 'info')
        const approveTx = await tokenB.approve(await miniAMM.getAddress(), ethers.MaxUint256)
        await approveTx.wait()
      }

      showToast('正在添加流动性...', 'info')
      const addLiqTx = await miniAMM.addLiquidity(amountAWei, amountBWei)
      const receipt = await addLiqTx.wait()

      setTxHash(receipt.hash)
      setAmountA('')
      setAmountB('')
      showToast('添加流动性成功!', 'success')
      refreshLpBalance()
    } catch (error: any) {
      console.error('添加流动性失败:', error)
      showToast(error.message || '添加流动性失败，请重试', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!account) {
      await connect()
      return
    }

    if (!miniAMM || !lpAmount) {
      showToast('请输入有效的 LP Token 数量', 'warning')
      return
    }

    try {
      setIsProcessing(true)
      setTxHash('')

      showToast('正在移除流动性...', 'info')
      const lpAmountWei = ethers.parseEther(lpAmount)
      const removeLiqTx = await miniAMM.removeLiquidity(lpAmountWei)
      const receipt = await removeLiqTx.wait()

      setTxHash(receipt.hash)
      setLpAmount('')
      showToast('移除流动性成功!', 'success')
      refreshLpBalance()
    } catch (error: any) {
      console.error('移除流动性失败:', error)
      showToast(error.message || '移除流动性失败，请重试', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const setLpPercentage = (percentage: number) => {
    if (!miniAMM || !account) return
    
    miniAMM.balanceOf(account).then((balance: bigint) => {
      const amount = (balance * BigInt(percentage)) / BigInt(100)
      setLpAmount(ethers.formatEther(amount))
    }).catch(console.error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar currentPath="/liquidity" />

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
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: {balanceA.loading ? '...' : balanceA.balance} TKA
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
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: {balanceB.loading ? '...' : balanceB.balance} TKB
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前价格</span>
                  <span className="font-semibold text-gray-900">1 TKA = <span className="text-indigo-600">{poolData.price}</span> TKB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总 LP Token</span>
                  <span className="font-semibold text-indigo-600">{parseFloat(poolData.totalSupply).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleAddLiquidity}
                disabled={isProcessing || !amountA || !amountB}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {!account ? '连接钱包' : isProcessing ? '处理中...' : '添加流动性'}
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
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                  />
                  <div className="text-sm text-gray-500 mt-2">
                    余额: {lpBalance} MINI-LP
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setLpPercentage(25)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  25%
                </button>
                <button 
                  onClick={() => setLpPercentage(50)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  50%
                </button>
                <button 
                  onClick={() => setLpPercentage(75)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  75%
                </button>
                <button 
                  onClick={() => setLpPercentage(100)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  100%
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前价格</span>
                  <span className="font-semibold text-gray-900">1 TKA = <span className="text-indigo-600">{poolData.price}</span> TKB</span>
                </div>
              </div>

              <button
                onClick={handleRemoveLiquidity}
                disabled={isProcessing || !lpAmount}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {!account ? '连接钱包' : isProcessing ? '处理中...' : '移除流动性'}
              </button>
            </div>
          )}

          {txHash && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                交易成功! 哈希: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
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
      </main>
    </div>
  )
}
