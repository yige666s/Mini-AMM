# 部署指南

本文档详细说明如何部署 Mini-AMM 项目的各个组件。

## 📋 前置要求

- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- Git

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd mini-amm-demo
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

### 3. 启动基础设施

```bash
# 启动 Hardhat 本地节点、Graph Node、IPFS、PostgreSQL
docker-compose up -d hardhat graph-node ipfs postgres

# 查看日志
docker-compose logs -f hardhat
```

### 4. 部署智能合约

```bash
cd contracts

# 安装依赖
npm install

# 部署合约到本地网络
npx hardhat run scripts/deploy.js --network localhost

# 记录输出的合约地址
# Token A: 0x...
# Token B: 0x...
# MiniAMM: 0x...
```

### 5. 更新配置

将部署的合约地址更新到 `.env` 文件：

```bash
CONTRACT_ADDRESS=0x... # MiniAMM 合约地址
NEXT_PUBLIC_MINI_AMM_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
```

### 6. 部署 Subgraph

```bash
cd ../subgraph

# 安装依赖
npm install

# 更新 subgraph.yaml 中的合约地址
# 修改 address 字段为部署的 MiniAMM 合约地址

# 生成代码
npm run codegen

# 构建
npm run build

# 创建 Subgraph
npm run create-local

# 部署
npm run deploy-local
```

### 7. 启动 Bot

```bash
# 重启 Bot 服务以加载新的合约地址
docker-compose restart bot

# 查看 Bot 日志
docker-compose logs -f bot
```

### 8. 启动前端

```bash
docker-compose up -d frontend

# 访问前端
open http://localhost:3000
```

## 🧪 验证部署

### 检查各个服务

```bash
# 检查所有服务状态
docker-compose ps

# 应该看到以下服务都在运行：
# - hardhat (端口 8545)
# - graph-node (端口 8000, 8001, 8020)
# - ipfs (端口 5001)
# - postgres (端口 5432)
# - bot (后台运行)
# - frontend (端口 3000)
```

### 测试合约

```bash
cd contracts

# 运行测试
npx hardhat test

# 检查合约状态
npx hardhat console --network localhost
```

```javascript
// 在 Hardhat 控制台中
const MiniAMM = await ethers.getContractFactory("MiniAMM")
const miniAMM = await MiniAMM.attach("0x...") // 替换为实际地址
const reserves = await miniAMM.getReserves()
console.log("Reserve A:", reserves[0].toString())
console.log("Reserve B:", reserves[1].toString())
```

### 测试 Subgraph

访问 GraphQL Playground：http://localhost:8001/subgraphs/name/mini-amm-subgraph

运行查询：

```graphql
{
  pool(id: "1") {
    id
    reserveA
    reserveB
    price
    totalLiquidity
  }
  swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    user
    amountIn
    amountOut
    timestamp
  }
}
```

### 测试前端

1. 访问 http://localhost:3000
2. 连接钱包（使用 Hardhat 本地账户）
3. 尝试 Swap 功能
4. 查看交易是否成功

## 📦 测试网部署

### 部署到 Sepolia

1. 准备测试网账户和 ETH

```bash
# 在 .env 中配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x... # 你的私钥
```

2. 部署合约

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

3. 验证合约

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

4. 部署 Subgraph 到 The Graph

```bash
cd ../subgraph

# 更新 subgraph.yaml
# - network: localhost -> sepolia
# - address: 更新为 Sepolia 合约地址
# - startBlock: 设置为部署区块

# 部署到 The Graph Studio
graph auth --studio YOUR_DEPLOY_KEY
graph deploy --studio mini-amm-subgraph
```

5. 配置 Bot

```bash
# 更新 bot/.env
RPC_ENDPOINT=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x... # Sepolia 合约地址
CHAIN_ID=11155111

# 运行 Bot
cd ../bot
go run .
```

## 🔧 故障排除

### Hardhat 节点无法启动

```bash
# 清理并重启
docker-compose down
rm -rf data/
docker-compose up -d hardhat
```

### Graph Node 同步失败

```bash
# 检查日志
docker-compose logs graph-node

# 重新部署 Subgraph
cd subgraph
npm run remove-local
npm run create-local
npm run deploy-local
```

### Bot 无法连接合约

```bash
# 检查配置
docker-compose exec bot env | grep CONTRACT_ADDRESS

# 检查 RPC 连接
docker-compose exec bot sh -c "wget -O- http://hardhat:8545"

# 重启 Bot
docker-compose restart bot
```

### 前端无法连接

```bash
# 检查环境变量
docker-compose exec frontend env | grep NEXT_PUBLIC

# 重新构建
docker-compose down frontend
docker-compose up -d frontend
```

## 📊 监控和日志

### 查看所有日志

```bash
docker-compose logs -f
```

### 查看特定服务日志

```bash
docker-compose logs -f hardhat
docker-compose logs -f graph-node
docker-compose logs -f bot
docker-compose logs -f frontend
```

### 监控 Bot 活动

```bash
# 实时查看 Bot 操作
docker-compose logs -f bot | grep "复投\|再平衡"
```

## 🔒 生产环境注意事项

1. **私钥安全**
   - 永远不要提交私钥到 Git
   - 使用环境变量或密钥管理服务
   - 生产环境使用硬件钱包

2. **RPC 节点**
   - 使用可靠的 RPC 提供商（Infura, Alchemy）
   - 配置多个备用节点
   - 实现请求限流

3. **Gas 优化**
   - 监控 Gas 价格
   - 设置合理的 Gas 限制
   - 使用 EIP-1559

4. **监控和告警**
   - 设置 Bot 健康检查
   - 监控交易失败
   - 配置告警通知

5. **数据备份**
   - 定期备份数据库
   - 备份 Subgraph 数据
   - 保存部署记录

## 📝 部署检查清单

- [ ] 环境变量已正确配置
- [ ] 所有服务都在运行
- [ ] 合约已成功部署
- [ ] Subgraph 已同步
- [ ] Bot 正常运行
- [ ] 前端可以访问
- [ ] 测试交易成功
- [ ] 日志正常输出
- [ ] 备份已配置

---

如有问题，请查看项目 [Issues](https://github.com/your-repo/issues) 或提交新的 Issue。
