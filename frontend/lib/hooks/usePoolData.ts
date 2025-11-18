'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useContracts } from './useContracts'

export interface PoolData {
  reserveA: string
  reserveB: string
  feeA: string
  feeB: string
  price: string
  totalSupply: string
}

export const usePoolData = () => {
  const { miniAMM } = useContracts()
  const [poolData, setPoolData] = useState<PoolData>({
    reserveA: '0',
    reserveB: '0',
    feeA: '0',
    feeB: '0',
    price: '1.000',
    totalSupply: '0',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!miniAMM) return

      try {
        setLoading(true)
        const [reserves, fees, totalSupply] = await Promise.all([
          miniAMM.getReserves(),
          miniAMM.getFees(),
          miniAMM.totalSupply(),
        ])

        const reserveA = ethers.formatEther(reserves[0])
        const reserveB = ethers.formatEther(reserves[1])
        const feeA = ethers.formatEther(fees[0])
        const feeB = ethers.formatEther(fees[1])
        const supply = ethers.formatEther(totalSupply)

        const priceValue = parseFloat(reserveA) > 0 
          ? (parseFloat(reserveB) / parseFloat(reserveA)).toFixed(3)
          : '1.000'

        setPoolData({
          reserveA,
          reserveB,
          feeA,
          feeB,
          price: priceValue,
          totalSupply: supply,
        })
      } catch (error) {
        console.error('获取池子数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPoolData()
    const interval = setInterval(fetchPoolData, 10000)
    return () => clearInterval(interval)
  }, [miniAMM])

  return { poolData, loading }
}
