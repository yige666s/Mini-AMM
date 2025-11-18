'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../Web3Context'
import { useContracts } from './useContracts'

export const useTokenBalance = (tokenType: 'A' | 'B') => {
  const { account } = useWeb3()
  const { tokenA, tokenB } = useContracts()
  const [balance, setBalance] = useState<string>('0.00')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) {
        setBalance('0.00')
        return
      }

      const token = tokenType === 'A' ? tokenA : tokenB
      if (!token) return

      try {
        setLoading(true)
        const bal = await token.balanceOf(account)
        setBalance(ethers.formatEther(bal))
      } catch (error) {
        console.error('获取余额失败:', error)
        setBalance('0.00')
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [account, tokenA, tokenB, tokenType])

  return { balance, loading }
}
