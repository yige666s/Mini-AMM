'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Navbar from '../components/Navbar'
import { useWeb3 } from '@/lib/Web3Context'
import { useContracts } from '@/lib/hooks/useContracts'
import { useTokenBalance } from '@/lib/hooks/useTokenBalance'
import { usePoolData } from '@/lib/hooks/usePoolData'
import { useToast } from '@/lib/ToastContext'

export default function SwapPage() {
  const { account, connect } = useWeb3()
  const { miniAMM, tokenA, tokenB } = useContracts()
  const { poolData } = usePoolData()
  const { showToast } = useToast()
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [AtoB, setAtoB] = useState(true)
  const [isSwapping, setIsSwapping] = useState(false)
  const [txHash, setTxHash] = useState('')
  
  const balanceIn = useTokenBalance(AtoB ? 'A' : 'B')
  const balanceOut = useTokenBalance(AtoB ? 'B' : 'A')

  useEffect(() => {
    const calculateAmountOut = async () => {
      if (!miniAMM || !amountIn || parseFloat(amountIn) <= 0) {
        setAmountOut('')
        return
      }

      try {
        const amountInWei = ethers.parseEther(amountIn)
        const amountOutWei = await miniAMM.getAmountOut(amountInWei, AtoB)
        setAmountOut(ethers.formatEther(amountOutWei))
      } catch (error) {
        console.error('计算输出数量失败:', error)
        setAmountOut('')
      }
    }

    const timer = setTimeout(calculateAmountOut, 500)
    return () => clearTimeout(timer)
  }, [amountIn, AtoB, miniAMM])

  const handleSwap = async () => {
    if (!account) {
      await connect()
      return
    }

    if (!miniAMM || !tokenA || !tokenB || !amountIn || parseFloat(amountIn) <= 0) {
      showToast('请输入有效的交换数量', 'warning')
      return
    }

    try {
      setIsSwapping(true)
      setTxHash('')

      const amountInWei = ethers.parseEther(amountIn)
      const tokenToApprove = AtoB ? tokenA : tokenB

      const allowance = await tokenToApprove.allowance(account, await miniAMM.getAddress())
      
      if (allowance < amountInWei) {
        showToast('正在授权代币...', 'info')
        const approveTx = await tokenToApprove.approve(await miniAMM.getAddress(), ethers.MaxUint256)
        await approveTx.wait()
        showToast('代币授权成功', 'success')
      }

      showToast('正在执行交换...', 'info')
      const swapTx = await miniAMM.swap(amountInWei, AtoB)
      const receipt = await swapTx.wait()
      
      setTxHash(receipt.hash)
      setAmountIn('')
      setAmountOut('')
      showToast('交换成功!', 'success')
    } catch (error: any) {
      console.error('交换失败:', error)
      showToast(error.message || '交换失败，请重试', 'error')
    } finally {
      setIsSwapping(false)
    }
  }

  const switchDirection = () => {
    setAtoB(!AtoB)
    setAmountIn('')
    setAmountOut('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar currentPath="/swap" />

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
                  余额: {balanceIn.loading ? '...' : balanceIn.balance}
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
                    placeholder="0.0"
                    className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-900"
                    readOnly
                  />
                  <div className="bg-white rounded-lg px-4 py-2 font-semibold">
                    {AtoB ? 'TKB' : 'TKA'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  余额: {balanceOut.loading ? '...' : balanceOut.balance}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">价格</span>
                <span className="font-semibold text-gray-900">1 TKA = <span className="text-indigo-600">{poolData.price}</span> TKB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">滑点容差</span>
                <span className="font-semibold text-gray-900"><span className="text-indigo-600">0.5</span>%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">流动性提供商费用</span>
                <span className="font-semibold text-gray-900"><span className="text-indigo-600">0.3</span>%</span>
              </div>
            </div>

            <button
              onClick={handleSwap}
              disabled={isSwapping || !amountIn || parseFloat(amountIn) <= 0}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {!account ? '连接钱包' : isSwapping ? '交换中...' : '交换'}
            </button>
          </div>

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
                <p className="font-semibold mb-1">提示</p>
                <p>每笔交易收取 0.3% 的手续费，这些手续费会被自动复投回流动性池。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">池子储备</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Token A (TKA)</span>
              <span className="font-semibold text-indigo-600">{parseFloat(poolData.reserveA).toFixed(2)} TKA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token B (TKB)</span>
              <span className="font-semibold text-indigo-600">{parseFloat(poolData.reserveB).toFixed(2)} TKB</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
