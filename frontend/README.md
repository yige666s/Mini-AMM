# Mini-AMM Frontend

基于 React、Next.js 13+ 和 ethers.js v6 构建的去中心化交易前端。

## 技术栈

- **React 18** - UI 框架
- **Next.js 14** - React 应用框架（App Router）
- **ethers.js v6** - 以太坊 JavaScript 库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **urql + GraphQL** - The Graph 数据查询

## 项目结构

```
frontend/
├── app/                      # Next.js App Router 页面
│   ├── components/          # React 组件
│   │   ├── Navbar.tsx      # 导航栏
│   │   └── ConnectButton.tsx # 钱包连接按钮
│   ├── swap/               # 交换页面
│   ├── liquidity/          # 流动性管理页面
│   ├── pool/               # 池子信息页面
│   ├── bot/                # Bot 记录页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── providers.tsx       # Context Providers
│   └── globals.css         # 全局样式
├── lib/                     # 工具库
│   ├── Web3Context.tsx     # Web3 状态管理
│   ├── contracts.ts        # 合约 ABI 和地址
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useContracts.ts    # 合约实例 Hook
│   │   ├── useTokenBalance.ts # 代币余额 Hook
│   │   └── usePoolData.ts     # 池子数据 Hook
│   └── types/              # TypeScript 类型定义
│       └── ethereum.d.ts   # window.ethereum 类型
└── public/                  # 静态资源
```

## 主要功能

### 1. 钱包连接
- 通过 MetaMask 连接钱包
- 自动检测网络切换和账户变更
- 显示账户信息和余额

### 2. 代币交换
- 支持 TKA ⇄ TKB 交换
- 实时计算输出数量
- 显示当前价格和滑点
- 自动处理代币授权

### 3. 流动性管理
- 添加流动性获得 LP Token
- 移除流动性取回代币
- 实时显示池子份额
- 快捷选择移除比例（25%、50%、75%、100%）

### 4. 池子信息
- 实时显示 TVL
- 查看储备量和价格
- 累积手续费统计
- LP Token 供应量

### 5. Bot 记录
- 查看自动复投记录
- 查看再平衡记录
- Bot 运行状态监控
- 历史操作记录

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- MetaMask 浏览器扩展

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_MINI_AMM_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
NEXT_PUBLIC_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/mini-amm
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```

## Web3 集成

### 使用 Web3Context

```typescript
import { useWeb3 } from '@/lib/Web3Context'

function MyComponent() {
  const { account, connect, disconnect, signer } = useWeb3()
  
  if (!account) {
    return <button onClick={connect}>连接钱包</button>
  }
  
  return <div>已连接: {account}</div>
}
```

### 使用合约 Hooks

```typescript
import { useContracts } from '@/lib/hooks/useContracts'
import { useTokenBalance } from '@/lib/hooks/useTokenBalance'
import { usePoolData } from '@/lib/hooks/usePoolData'

function MyComponent() {
  const { miniAMM, tokenA, tokenB } = useContracts()
  const { balance } = useTokenBalance('A')
  const { poolData } = usePoolData()
  
  // 使用合约实例进行交易
  // ...
}
```

### 合约交互示例

```typescript
// Swap
const amountInWei = ethers.parseEther(amountIn)
const swapTx = await miniAMM.swap(amountInWei, true)
await swapTx.wait()

// Add Liquidity
const amountAWei = ethers.parseEther(amountA)
const amountBWei = ethers.parseEther(amountB)
const addLiqTx = await miniAMM.addLiquidity(amountAWei, amountBWei)
await addLiqTx.wait()

// Remove Liquidity
const lpAmountWei = ethers.parseEther(lpAmount)
const removeLiqTx = await miniAMM.removeLiquidity(lpAmountWei)
await removeLiqTx.wait()
```

## 支持的网络

- **Ethereum Mainnet** (chainId: 1)
- **Sepolia Testnet** (chainId: 11155111)
- **Hardhat Local** (chainId: 31337)

## 开发指南

### 添加新页面

1. 在 `app/` 目录创建新文件夹
2. 添加 `page.tsx` 文件
3. 使用 `'use client'` 指令（如果需要客户端交互）
4. 在 Navbar 组件添加导航链接

### 添加新的合约交互

1. 在 `lib/contracts.ts` 添加 ABI
2. 在 `lib/hooks/` 创建自定义 Hook
3. 在组件中使用 Hook

### 样式指南

- 使用 Tailwind CSS 类
- 主色调：`indigo-600`
- 次色调：`purple-600`
- 保持中文用户界面
- 确保数字有良好对比度

## 常见问题

### MetaMask 连接失败
确保已安装 MetaMask 扩展并解锁钱包。

### 交易失败
检查：
1. 账户余额是否足够
2. 代币是否已授权
3. Gas 费用是否足够
4. 网络是否正确

### 数据不更新
- 池子数据每 10 秒自动刷新
- 余额数据每 10 秒自动刷新
- 手动刷新页面可立即更新

## 相关文档

- [Ethers.js 迁移指南](./ETHERS_MIGRATION.md)
- [Next.js 文档](https://nextjs.org/docs)
- [ethers.js 文档](https://docs.ethers.org/v6/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

## License

MIT
