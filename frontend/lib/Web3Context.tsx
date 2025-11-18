'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers'

interface Web3ContextType {
  provider: BrowserProvider | null
  signer: JsonRpcSigner | null
  account: string | null
  chainId: number | null
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null)
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16))
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('请先安装 MetaMask!')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)

      const provider = new ethers.BrowserProvider(window.ethereum)
      
      const accounts = await provider.send('eth_requestAccounts', [])
      
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAccount(accounts[0])
      setChainId(Number(network.chainId))
    } catch (err: any) {
      console.error('连接钱包失败:', err)
      setError(err.message || '连接钱包失败')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setError(null)
  }

  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}
