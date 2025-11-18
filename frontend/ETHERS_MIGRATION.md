# Ethers.js 迁移指南

本项目已从 Wagmi/RainbowKit 迁移到 ethers.js v6。

## 主要变更

### 1. 依赖变更

**移除的依赖：**
- wagmi
- viem
- @rainbow-me/rainbowkit
- @tanstack/react-query

**新增的依赖：**
- ethers@^6.9.0

### 2. Web3 集成架构

#### Web3Context (`lib/Web3Context.tsx`)
使用 React Context API 管理钱包连接状态：
- `provider`: ethers BrowserProvider 实例
- `signer`: JsonRpcSigner 实例
- `account`: 当前连接的账户地址
- `chainId`: 当前网络 ID
- `connect()`: 连接 MetaMask 钱包
- `disconnect()`: 断开钱包连接

#### 使用示例：
```typescript
import { useWeb3 } from '@/lib/Web3Context'

function MyComponent() {
  const { account, connect, signer } = useWeb3()
  
  // 连接钱包
  if (!account) {
    await connect()
  }
  
  // 使用 signer 进行交易
  // ...
}
```

### 3. 自定义 Hooks

#### useContracts
获取合约实例的 hook：
```typescript
import { useContracts } from '@/lib/hooks/useContracts'

const { miniAMM, tokenA, tokenB } = useContracts()
```

#### useTokenBalance
获取代币余额的 hook：
```typescript
import { useTokenBalance } from '@/lib/hooks/useTokenBalance'

const { balance, loading } = useTokenBalance('A') // 或 'B'
```

#### usePoolData
获取流动性池数据的 hook：
```typescript
import { usePoolData } from '@/lib/hooks/usePoolData'

const { poolData, loading } = usePoolData()
// poolData: { reserveA, reserveB, feeA, feeB, price, totalSupply }
```

### 4. ConnectButton 组件

自定义的钱包连接按钮，替代 RainbowKit 的 ConnectButton：
- 显示连接/断开状态
- 显示账户地址
- 显示当前网络
- 复制地址功能
- 下拉菜单

### 5. 合约交互示例

#### Swap (交换代币)
```typescript
const handleSwap = async () => {
  const amountInWei = ethers.parseEther(amountIn)
  
  // 1. 批准代币
  const allowance = await tokenA.allowance(account, await miniAMM.getAddress())
  if (allowance < amountInWei) {
    const approveTx = await tokenA.approve(await miniAMM.getAddress(), ethers.MaxUint256)
    await approveTx.wait()
  }
  
  // 2. 执行 swap
  const swapTx = await miniAMM.swap(amountInWei, true)
  const receipt = await swapTx.wait()
}
```

#### Add Liquidity (添加流动性)
```typescript
const handleAddLiquidity = async () => {
  const amountAWei = ethers.parseEther(amountA)
  const amountBWei = ethers.parseEther(amountB)
  
  // 1. 批准两个代币
  const [allowanceA, allowanceB] = await Promise.all([
    tokenA.allowance(account, await miniAMM.getAddress()),
    tokenB.allowance(account, await miniAMM.getAddress()),
  ])
  
  if (allowanceA < amountAWei) {
    await (await tokenA.approve(await miniAMM.getAddress(), ethers.MaxUint256)).wait()
  }
  
  if (allowanceB < amountBWei) {
    await (await tokenB.approve(await miniAMM.getAddress(), ethers.MaxUint256)).wait()
  }
  
  // 2. 添加流动性
  const tx = await miniAMM.addLiquidity(amountAWei, amountBWei)
  await tx.wait()
}
```

#### Remove Liquidity (移除流动性)
```typescript
const handleRemoveLiquidity = async () => {
  const lpAmountWei = ethers.parseEther(lpAmount)
  
  const tx = await miniAMM.removeLiquidity(lpAmountWei)
  await tx.wait()
}
```

### 6. 环境变量

在 `.env.local` 中设置合约地址：
```
NEXT_PUBLIC_MINI_AMM_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
```

### 7. 支持的网络

- Ethereum Mainnet (chainId: 1)
- Sepolia Testnet (chainId: 11155111)
- Hardhat Local (chainId: 31337)

### 8. 开发和构建

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 注意事项

1. **MetaMask 必需**：用户需要安装 MetaMask 浏览器扩展
2. **网络切换**：切换网络时页面会自动刷新
3. **账户切换**：账户切换会自动更新状态
4. **错误处理**：所有合约交互都包含错误处理和用户友好的错误提示
5. **交易确认**：所有交易都会等待区块确认

## 迁移优势

1. **更轻量**：移除了大量依赖，减小了打包体积
2. **更直接**：直接使用 ethers.js，更灵活的合约交互
3. **更简单**：减少了配置和抽象层
4. **更可控**：完全自定义的钱包连接和状态管理
