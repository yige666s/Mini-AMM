'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:8080'

export interface BotAction {
  id: number
  timestamp: string
  actionType: 'COMPOUND' | 'REBALANCE'
  amountA: string
  amountB: string
  txHash: string
  direction?: string
  status: string
  gasUsed?: number
  createdAt: string
}

export interface BotStats {
  compoundCount: number
  rebalanceCount: number
  latestAction: BotAction | null
}

export function useBotActions(filter: 'all' | 'compound' | 'rebalance' = 'all', limit: number = 10) {
  const [actions, setActions] = useState<BotAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true)
        
        let url = `${API_URL}/api/bot-actions?limit=${limit}`
        if (filter === 'compound') {
          url += '&type=COMPOUND'
        } else if (filter === 'rebalance') {
          url += '&type=REBALANCE'
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch bot actions')
        }

        const result = await response.json()
        setActions(result.data || [])
        setError(null)
      } catch (err: any) {
        console.error('Error fetching bot actions:', err)
        setError(err.message)
        setActions([])
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
    const interval = setInterval(fetchActions, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [filter, limit])

  return { actions, loading, error }
}

export interface BotConfig {
  compoundInterval: number
  rebalanceInterval: number
  rebalanceThreshold: number
  gasLimit: number
  maxGasPrice: number
  retryAttempts: number
  retryDelay: number
  chainId: number
}

export function useBotStats() {
  const [stats, setStats] = useState<BotStats>({
    compoundCount: 0,
    rebalanceCount: 0,
    latestAction: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_URL}/api/bot-stats`)
        if (!response.ok) {
          throw new Error('Failed to fetch bot stats')
        }

        const result = await response.json()
        setStats({
          compoundCount: result.compoundCount || 0,
          rebalanceCount: result.rebalanceCount || 0,
          latestAction: result.latestAction || null,
        })
        setError(null)
      } catch (err: any) {
        console.error('Error fetching bot stats:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000) // 每10秒刷新一次
    return () => clearInterval(interval)
  }, [])

  return { stats, loading, error }
}

export function useBotConfig() {
  const [config, setConfig] = useState<BotConfig>({
    compoundInterval: 300,
    rebalanceInterval: 60,
    rebalanceThreshold: 0.05,
    gasLimit: 300000,
    maxGasPrice: 100,
    retryAttempts: 3,
    retryDelay: 5,
    chainId: 31337,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_URL}/api/bot-config`)
        if (!response.ok) {
          throw new Error('Failed to fetch bot config')
        }

        const result = await response.json()
        setConfig(result.config || config)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching bot config:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
    const interval = setInterval(fetchConfig, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [])

  return { config, loading, error }
}
