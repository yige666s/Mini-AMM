import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { hardhat, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Mini-AMM',
  projectId: 'YOUR_PROJECT_ID',
  chains: [hardhat, sepolia],
  ssr: true,
})
