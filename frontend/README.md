# Mini-AMM 前端应用

基于 Next.js 14 的现代化 Web3 前端应用。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **React**: React 18
- **Web3 库**: Wagmi + Viem
- **钱包**: RainbowKit
- **UI**: TailwindCSS
- **状态管理**: TanStack Query
- **图表**: Recharts
- **GraphQL**: urql

## 功能页面

### 首页 (/)
- 项目介绍
- 功能概览
- 快速导航

### 交换页面 (/swap)
- 代币交换界面
- 实时价格预估
- 滑点设置
- 交易历史

### 流动性页面 (/liquidity)
- 添加流动性
- 移除流动性
- LP Token 管理
- 收益展示

### 池子页面 (/pool)
- TVL 统计
- 交易量分析
- 储备量展示
- 价格图表
- 流动性提供者信息

### Bot 页面 (/bot)
- Bot 状态监控
- 操作历史记录
- 配置信息
- 统计数据

## 安装

```bash
npm install
```

## 配置

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_MINI_AMM_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
NEXT_PUBLIC_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/mini-amm-subgraph
```

## 开发

```bash
npm run dev
```

访问: http://localhost:3000

## 构建

```bash
npm run build
```

## 启动生产服务

```bash
npm start
```

## 项目结构

```
frontend/
├── app/                    # App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── providers.tsx      # Provider 配置
│   ├── globals.css        # 全局样式
│   ├── swap/              # 交换页面
│   ├── liquidity/         # 流动性页面
│   ├── pool/              # 池子页面
│   └── bot/               # Bot 页面
├── components/            # React 组件
├── lib/                   # 工具函数和配置
│   ├── wagmi.ts          # Wagmi 配置
│   └── contracts.ts      # 合约 ABI 和地址
├── public/               # 静态资源
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 核心库使用

### Wagmi - Web3 React Hooks

```typescript
import { useReadContract, useWriteContract } from 'wagmi'

// 读取合约数据
const { data: reserves } = useReadContract({
  address: CONTRACTS.miniAMM,
  abi: MINI_AMM_ABI,
  functionName: 'getReserves'
})

// 写入合约
const { writeContract } = useWriteContract()
await writeContract({
  address: CONTRACTS.miniAMM,
  abi: MINI_AMM_ABI,
  functionName: 'swap',
  args: [amountIn, true]
})
```

### RainbowKit - 钱包连接

```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit'

<ConnectButton />
```

### TanStack Query - 数据缓存

```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['pool'],
  queryFn: fetchPoolData
})
```

## 钱包配置

支持的钱包:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet

### 添加本地网络到 MetaMask

- Network Name: Hardhat Local
- RPC URL: http://localhost:8545
- Chain ID: 31337
- Currency Symbol: ETH

### 导入测试账户

Hardhat 账户 #0:
```
私钥: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 样式系统

使用 TailwindCSS 实用优先的 CSS 框架。

### 颜色系统

```javascript
// tailwind.config.js
colors: {
  primary: {
    500: '#0ea5e9',  // 主色
    600: '#0284c7',  // hover 色
  }
}
```

### 响应式设计

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 内容 */}
</div>
```

## GraphQL 查询

### 查询池子数据

```typescript
const POOL_QUERY = gql`
  query {
    pool(id: "1") {
      reserveA
      reserveB
      price
      totalLiquidity
    }
  }
`
```

### 查询交换历史

```typescript
const SWAPS_QUERY = gql`
  query {
    swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
      user
      amountIn
      amountOut
      timestamp
    }
  }
`
```

## 性能优化

### 代码分割

使用 Next.js 动态导入:

```typescript
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/Chart'), {
  ssr: false
})
```

### 图片优化

```typescript
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
/>
```

### React Query 缓存

```typescript
const { data } = useQuery({
  queryKey: ['reserves'],
  queryFn: fetchReserves,
  staleTime: 5000,  // 5 秒内不重新请求
  refetchInterval: 10000  // 每 10 秒自动刷新
})
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 连接到 Vercel
3. 配置环境变量
4. 自动部署

### Docker 部署

```bash
docker build -t mini-amm-frontend .
docker run -p 3000:3000 mini-amm-frontend
```

## 故障排除

### 钱包连接失败

1. 确保安装了 MetaMask
2. 检查网络配置
3. 刷新页面重试

### 合约调用失败

1. 检查合约地址配置
2. 确保钱包已授权
3. 检查账户余额

### 数据不更新

1. 检查 Subgraph 是否运行
2. 清除浏览器缓存
3. 刷新页面

## 测试

```bash
# 运行测试
npm run test

# E2E 测试
npm run test:e2e
```

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## License

MIT

## 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Wagmi 文档](https://wagmi.sh/)
- [RainbowKit 文档](https://www.rainbowkit.com/docs)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
