# Mini-AMM + 自动复投 Bot 综合 Demo 项目

🚀 一个完整的 Web3 DeFi 协议演示项目，展示从链上合约到链下服务再到前端应用的完整技术栈。

## 📋 项目简介

本项目实现了一个迷你版的自动做市商（AMM）协议，包含：

- 🔄 **Mini-AMM 去中心化交易池**：基于 x*y=k 恒定乘积做市商模型
- 🤖 **自动复投 Bot**：链下 Keeper 自动将手续费复投回流动性池
- 📊 **Subgraph 数据索引**：实时索引链上事件，提供 GraphQL API
- 🎨 **现代化前端**：Next.js + Wagmi 构建的用户界面
- 🐳 **Docker 一键部署**：完整的开发环境配置

## 🏗️ 系统架构

```
┌───────────────────────────┐
│     前端 (Next.js)        │
│  Swap UI / LP / Charts    │
└──────────────▲────────────┘
               │ GraphQL
┌──────────────┴────────────┐
│   The Graph Subgraph      │
│ Index: Swap/Mint/Burn/Bot │
└──────────────▲────────────┘
               │ Events
┌──────────────┴────────────┐
│    Solidity AMM 合约       │
│  x*y=k, Fee, LP token     │
└──────────────▲────────────┘
               │ RPC+WS
┌──────────────┴────────────┐
│   Go 后端 Keeper Bot       │
│ 定时复投、rebalance、监控  │
└────────────────────────────┘
```

## 🎯 核心功能

### 1. 去中心化交易池 (Mini-AMM)

- ✅ 添加流动性（Add Liquidity）
- ✅ 移除流动性（Remove Liquidity）
- ✅ 代币交换（Swap TokenA ⇄ TokenB）
- ✅ 0.3% 交易手续费
- ✅ 遵循 Uniswap V2 AMM 模型：`x * y = k`

### 2. 自动复投机制

- 🤖 每笔 swap 手续费存储在合约中
- 🤖 Bot 每 5 分钟自动复投累积的手续费
- 🤖 按最优比例重新注入流动性
- 🤖 支持配置 RPC 节点、重试机制、Gas 策略

### 3. 自动再平衡（Rebalance）

- 📈 监控价格偏差
- 📈 当价格偏离超过 5% 时自动调整
- 📈 执行小额 swap 恢复平衡

### 4. 数据索引层

- 📊 订阅所有合约事件（Swap, Mint, Burn, FeesCollected, Rebalance）
- 📊 提供 GraphQL 查询接口
- 📊 支持历史数据分析

### 5. 用户界面

- 🎨 Swap 交易界面（实时价格预估）
- 🎨 流动性管理
- 🎨 实时池子数据展示
- 🎨 Bot 操作记录
- 🎨 历史图表分析

## 📂 项目结构

```
.
├── contracts/              # Solidity 智能合约
│   ├── MiniAMM.sol        # 主 AMM 合约
│   ├── LPToken.sol        # LP Token 合约
│   └── interfaces/        # 接口定义
├── subgraph/              # The Graph 数据索引
│   ├── schema.graphql     # GraphQL Schema
│   ├── subgraph.yaml      # Subgraph 配置
│   └── src/               # Mapping 处理逻辑
├── bot/                   # Go Keeper Bot
│   ├── main.go           # 入口文件
│   ├── config.go         # 配置管理
│   ├── compound.go       # 自动复投逻辑
│   ├── rebalance.go      # 再平衡逻辑
│   └── ...
├── frontend/              # Next.js 前端应用
│   ├── app/              # App Router 页面
│   ├── components/       # React 组件
│   └── lib/              # 工具函数
├── docker-compose.yml     # Docker 编排配置
└── README.md             # 项目文档
```

## 🚀 快速开始

### 前置要求

- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- Foundry (Solidity 开发)

### 使用 Docker Compose 启动

```bash
# 克隆项目
git clone <repository-url>
cd mini-amm-demo

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 服务访问地址

- 前端应用: http://localhost:3000
- Graph Node: http://localhost:8000
- Graph Node GraphQL: http://localhost:8001
- Bot 服务: 后台运行
- Hardhat Node: http://localhost:8545

## 🔧 开发指南

### 合约开发

```bash
cd contracts

# 安装依赖
npm install

# 编译合约
npx hardhat compile

# 运行测试
npx hardhat test

# 部署合约（本地）
npx hardhat run scripts/deploy.js --network localhost

# 部署合约（测试网）
npx hardhat run scripts/deploy.js --network sepolia
```

### Subgraph 开发

```bash
cd subgraph

# 安装依赖
npm install

# 生成代码
npm run codegen

# 构建 Subgraph
npm run build

# 部署到本地 Graph Node
npm run create-local
npm run deploy-local
```

### Bot 开发

```bash
cd bot

# 安装依赖
go mod download

# 运行 Bot
go run main.go

# 编译
go build -o keeper-bot

# 运行配置
cp .env.example .env
# 编辑 .env 配置文件
./keeper-bot
```

### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

## 📝 核心概念

### AMM 定价公式

```
x * y = k

其中：
- x: TokenA 储备量
- y: TokenB 储备量
- k: 恒定乘积

输出量计算（含 0.3% 手续费）：
amountOut = (reserveOut * amountIn * 997) / (reserveIn * 1000 + amountIn * 997)
```

### 自动复投逻辑

```
1. Bot 获取累积的 feeA 和 feeB
2. 根据当前储备量计算最优比例
3. 调用 addLiquidity() 将手续费重新注入流动性池
4. 触发事件，Subgraph 索引记录
```

### 再平衡机制

```
1. 计算当前价格: price = reserveB / reserveA
2. 如果 |price - price0| > threshold:
   - Bot 执行小额 swap 调整池子
   - 使价格回归目标区间
```

## 🔒 安全性考虑

- ✅ 重入保护（ReentrancyGuard）
- ✅ 输入验证（检查数量 > 0）
- ✅ 储备量检查（防止超出限制）
- ✅ Bot 权限控制（onlyBot modifier）
- ✅ Gas 限制（防止攻击）
- ✅ 滑点保护（前端实现）

## 🧪 测试

```bash
# 合约测试
cd contracts
npx hardhat test

# Bot 测试
cd bot
go test ./...

# 前端测试
cd frontend
npm run test

# E2E 测试
npm run test:e2e
```

## 📊 监控和日志

### Bot 日志

Bot 会记录所有操作到日志文件：

```bash
tail -f bot/logs/keeper.log
```

### 合约事件

通过 Subgraph 查询所有链上事件：

```graphql
query {
  swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    user
    amountIn
    amountOut
    timestamp
  }
  botActions(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    action
    amountA
    amountB
    timestamp
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

本项目参考了以下优秀项目：

- [Uniswap V2](https://github.com/Uniswap/v2-core)
- [The Graph](https://thegraph.com/)
- [Wagmi](https://wagmi.sh/)
- [Foundry](https://github.com/foundry-rs/foundry)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
