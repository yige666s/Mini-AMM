'use client'

import { useState, useEffect } from 'react'

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'http://localhost:8000/subgraphs/name/mini-amm'

interface Swap {
  id: string
  timestamp: string
  user: string
  amountIn: string
  amountOut: string
  AtoB: boolean
}

interface BotAction {
  id: string
  timestamp: string
  actionType: 'COMPOUND' | 'REBALANCE'
  amountA: string
  amountB: string
  txHash: string
  direction?: string
  priceDeviation?: string
}

export function useSwapHistory(limit: number = 20) {
  const [swaps, setSwaps] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setLoading(true)
        const query = `
          {
            swaps(first: ${limit}, orderBy: timestamp, orderDirection: desc) {
              id
              timestamp
              user
              amountIn
              amountOut
              AtoB
            }
          }
        `
        
        const response = await fetch(SUBGRAPH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch swaps')
        }

        const result = await response.json()
        setSwaps(result.data?.swaps || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching swaps:', err)
        setError(err.message)
        setSwaps([])
      } finally {
        setLoading(false)
      }
    }

    fetchSwaps()
    const interval = setInterval(fetchSwaps, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [limit])

  return { swaps, loading, error }
}

export function useBotHistory(filter: 'all' | 'compound' | 'rebalance' = 'all', limit: number = 20) {
  const [actions, setActions] = useState<BotAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBotActions = async () => {
      try {
        setLoading(true)
        
        let whereClause = ''
        if (filter === 'compound') {
          whereClause = '(where: { actionType: "COMPOUND" })'
        } else if (filter === 'rebalance') {
          whereClause = '(where: { actionType: "REBALANCE" })'
        }
        
        const query = `
          {
            botActions${whereClause}(first: ${limit}, orderBy: timestamp, orderDirection: desc) {
              id
              timestamp
              actionType
              amountA
              amountB
              txHash
            }
          }
        `
        
        const response = await fetch(SUBGRAPH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch bot actions')
        }

        const result = await response.json()
        setActions(result.data?.botActions || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching bot actions:', err)
        setError(err.message)
        setActions([])
      } finally {
        setLoading(false)
      }
    }

    fetchBotActions()
    const interval = setInterval(fetchBotActions, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [filter, limit])

  return { actions, loading, error }
}

export function usePriceHistory(duration: '24H' | '7D' | '30D' = '24H') {
  const [priceData, setPriceData] = useState<Array<{ timestamp: number; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        setLoading(true)
        
        // 计算时间范围
        const now = Math.floor(Date.now() / 1000)
        let startTime = now
        switch (duration) {
          case '24H':
            startTime = now - 24 * 60 * 60
            break
          case '7D':
            startTime = now - 7 * 24 * 60 * 60
            break
          case '30D':
            startTime = now - 30 * 24 * 60 * 60
            break
        }
        
        const query = `
          {
            swaps(
              where: { timestamp_gte: "${startTime}" }
              orderBy: timestamp
              orderDirection: asc
              first: 1000
            ) {
              timestamp
              amountIn
              amountOut
              AtoB
            }
          }
        `
        
        const response = await fetch(SUBGRAPH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch price history')
        }

        const result = await response.json()
        const swaps = result.data?.swaps || []
        
        // 计算每笔交易的价格
        const prices = swaps.map((swap: any) => ({
          timestamp: parseInt(swap.timestamp) * 1000, // 转换为毫秒
          price: swap.AtoB 
            ? parseFloat(swap.amountOut) / parseFloat(swap.amountIn)
            : parseFloat(swap.amountIn) / parseFloat(swap.amountOut)
        }))
        
        setPriceData(prices)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching price history:', err)
        setError(err.message)
        setPriceData([])
      } finally {
        setLoading(false)
      }
    }

    fetchPriceHistory()
    const interval = setInterval(fetchPriceHistory, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [duration])

  return { priceData, loading, error }
}
