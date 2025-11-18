'use client'

import { useMemo } from 'react'
import { ethers, Contract } from 'ethers'
import { useWeb3 } from '../Web3Context'
import { MINI_AMM_ABI, ERC20_ABI, CONTRACTS } from '../contracts'

export const useContracts = () => {
  const { signer, provider } = useWeb3()

  const miniAMM = useMemo(() => {
    if (!CONTRACTS.miniAMM) return null
    const signerOrProvider = signer || provider
    if (!signerOrProvider) return null
    return new Contract(CONTRACTS.miniAMM, MINI_AMM_ABI, signerOrProvider)
  }, [signer, provider])

  const tokenA = useMemo(() => {
    if (!CONTRACTS.tokenA) return null
    const signerOrProvider = signer || provider
    if (!signerOrProvider) return null
    return new Contract(CONTRACTS.tokenA, ERC20_ABI, signerOrProvider)
  }, [signer, provider])

  const tokenB = useMemo(() => {
    if (!CONTRACTS.tokenB) return null
    const signerOrProvider = signer || provider
    if (!signerOrProvider) return null
    return new Contract(CONTRACTS.tokenB, ERC20_ABI, signerOrProvider)
  }, [signer, provider])

  return {
    miniAMM,
    tokenA,
    tokenB,
  }
}
