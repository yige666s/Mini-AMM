# 测试网部署指南

本指南将详细介绍如何将 Mini-AMM 项目部署到以太坊测试网（Sepolia）。

## 📋 目录

1. [准备工作](#准备工作)
2. [环境配置](#环境配置)
3. [部署智能合约](#部署智能合约)
4. [部署 Subgraph](#部署-subgraph)
5. [部署 Bot 服务](#部署-bot-服务)
6. [部署前端应用](#部署前端应用)
7. [验证部署](#验证部署)
8. [常见问题](#常见问题)

---

## 准备工作

### 1. 所需账户和服务

在开始之前，您需要注册以下服务：

#### Infura / Alchemy（RPC 节点服务）

- 访问 [Infura](https://infura.io/) 或 [Alchemy](https://www.alchemy.com/)
- 注册账户并创建新项目
- 获取 Sepolia 测试网的 RPC URL
- 记录您的 API Key

#### The Graph（数据索引服务）

- 访问 [The Graph Studio](https://thegraph.com/studio/)
- 使用 GitHub 账户登录
- 创建新的 Subgraph 项目
- 获取 Deploy Key

#### Vercel / Netlify（前端托管）

- 访问 [Vercel](https://vercel.com/) 或 [Netlify](https://www.netlify.com/)
- 使用 GitHub 账户登录
- 准备部署前端应用

### 2. 获取测试网 ETH

您需要测试网 ETH 来支付 Gas 费用：

**Sepolia 水龙头：**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

**步骤：**
1. 复制您的钱包地址
2. 访问任一水龙头网站
3. 输入地址并请求测试 ETH
4. 等待 1-2 分钟接收

建议至少获取 **0.5 Sepolia ETH**。

### 3. 本地开发工具

确保安装以下工具：

```bash
# Node.js 18+
node --version

# npm 或 yarn
npm --version

# Hardhat（合约开发）
npm install -g hardhat

# The Graph CLI
npm install -g @graphprotocol/graph-cli

# Go 1.21+（Bot 服务）
go version

# Git
git --version
```

---

## 环境配置

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd mini-amm-demo
```

### 2. 配置环境变量

创建并配置各个模块的环境变量：

#### 合约环境变量

```bash
cd contracts
cp .env.example .env
```

编辑 `contracts/.env`：

```env
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# 部署者私钥（不要使用有真实资金的钱包！）
PRIVATE_KEY=your_private_key_here

# Etherscan API Key（用于验证合约）
ETHERSCAN_API_KEY=your_etherscan_api_key
```

#### Bot 环境变量

```bash
cd ../bot
cp .env.example .env
```

# 私钥（Hardhat 默认账户 #0）
PRIVATE_KEY=eb32c62c1cf912cc91083ec8359344d783323b55fea4aabd7cee0f06716e9732

# Subgraph 配置
NEXT_PUBLIC_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/mini-amm-subgraph

# 测试网配置（可选）
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=4D7ASNS1S8ZCZ9HDNA185FI5DQ9J8A1M8H


编辑 `bot/.env`：

```env
# RPC 节点
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
RPC_URL_BACKUP=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Bot 私钥（需要有测试 ETH 支付 Gas）
BOT_PRIVATE_KEY=your_bot_private_key_here

# 合约地址（部署后填入）
AMM_CONTRACT_ADDRESS=0x...

# Bot 配置
COMPOUND_INTERVAL=5m
REBALANCE_INTERVAL=1m
REBALANCE_THRESHOLD=5
MAX_GAS_PRICE=100

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/keeper.log
```

#### 前端环境变量

```bash
cd ../frontend
cp .env.example .env.local
```

编辑 `frontend/.env.local`：

```env
# 网络配置
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia Chain ID

# 合约地址（部署后填入）
NEXT_PUBLIC_AMM_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_B_ADDRESS=0x...
NEXT_PUBLIC_LP_TOKEN_ADDRESS=0x...

# Subgraph API（部署后填入）
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH

# RPC 配置
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# WalletConnect 项目 ID（可选）
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 部署智能合约

### 1. 安装依赖

```bash
cd contracts
npm install
```

### 2. 编译合约

```bash
npx hardhat compile
```

预期输出：
```
Compiled 15 Solidity files successfully
```

### 3. 运行测试（可选）

```bash
npx hardhat test
```

确保所有测试通过。

### 4. 部署到 Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**部署过程：**

1. 部署 TokenA 合约
2. 部署 TokenB 合约
3. 部署 LPToken 合约
4. 部署 MiniAMM 合约
5. 设置合约权限

**记录部署地址：**

部署成功后，您会看到类似输出：

```
Deploying contracts to Sepolia...

TokenA deployed to: 0x1234567890abcdef1234567890abcdef12345678
TokenB deployed to: 0xabcdef1234567890abcdef1234567890abcdef12
LPToken deployed to: 0x567890abcdef1234567890abcdef1234567890ab
MiniAMM deployed to: 0xcdef1234567890abcdef1234567890abcdef1234

Deployment completed!
Transaction hashes:
- TokenA: 0x...
- TokenB: 0x...
- LPToken: 0x...
- MiniAMM: 0x...
```

**请妥善保存这些地址！**

### 5. 验证合约（可选但推荐）

验证合约可以让用户在 Etherscan 上查看源码：

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

例如：

```bash
npx hardhat verify --network sepolia 0x1234... "TokenA" "TKA" 1000000
```

### 6. 初始化池子

为池子添加初始流动性：

```bash
npx hardhat run scripts/initialize-pool.js --network sepolia
```

此脚本会：
1. 给部署者账户铸造测试代币
2. 批准 AMM 合约使用代币
3. 添加初始流动性（例如 10,000 TKA + 10,000 TKB）

**建议初始流动性：**
- 至少 1,000 TKA + 1,000 TKB
- 建议 10,000 TKA + 10,000 TKB
- 确保比例为 1:1

---

## 部署 Subgraph

Subgraph 用于索引链上事件，提供 GraphQL API。

### 1. 安装依赖

```bash
cd ../subgraph
npm install
```

### 2. 更新配置

编辑 `subgraph/subgraph.yaml`：

```yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: MiniAMM
    network: sepolia  # 确保是 sepolia
    source:
      address: "0xYOUR_AMM_CONTRACT_ADDRESS"  # 填入实际地址
      abi: MiniAMM
      startBlock: 5000000  # 填入合约部署的区块号
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Swap
        - Mint
        - Burn
        - BotAction
      abis:
        - name: MiniAMM
          file: ./abis/MiniAMM.json
      eventHandlers:
        - event: Swap(indexed address,uint256,uint256,uint256,uint256)
          handler: handleSwap
        - event: Mint(indexed address,uint256,uint256)
          handler: handleMint
        - event: Burn(indexed address,uint256,uint256,uint256)
          handler: handleBurn
        - event: FeesCollected(uint256,uint256)
          handler: handleFeesCollected
        - event: Rebalance(uint256,uint256,bool)
          handler: handleRebalance
      file: ./src/mapping.ts
```

### 3. 复制合约 ABI

```bash
cp ../contracts/artifacts/contracts/MiniAMM.sol/MiniAMM.json ./abis/
```

### 4. 生成代码

```bash
npm run codegen
```

### 5. 构建 Subgraph

```bash
npm run build
```

### 6. 部署到 The Graph Studio

#### a. 认证

```bash
graph auth 5c906c99056fa1e1799d78de4974f424
```

#### b. 部署

```bash
graph deploy  mini-amm
```

选择版本号（例如：v0.0.1）。

#### c. 等待同步

- 访问 [The Graph Studio](https://thegraph.com/studio/)
- 查看您的 Subgraph 状态
- 等待同步完成（可能需要几分钟）

#### d. 获取查询 URL

同步完成后，您会获得一个查询 URL：
```
https://api.studio.thegraph.com/query/1715621/mini-amm/version/latest
```

**将此 URL 保存到前端环境变量中！**

### 7. 测试 Subgraph

使用 GraphQL Playground 测试查询：

```graphql
query {
  swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
    id
    user
    tokenIn
    amountIn
    amountOut
    timestamp
  }
  poolStats(id: "pool") {
    totalValueLocked
    volume24h
    fees24h
  }
}
```

---

## 部署 Bot 服务

Bot 负责自动复投和再平衡。

### 1. 更新环境变量

编辑 `bot/.env`，填入已部署的合约地址：

```env
AMM_CONTRACT_ADDRESS=0xYOUR_AMM_ADDRESS
```

### 2. 安装依赖

```bash
cd ../bot
go mod download
```

### 3. 构建 Bot

```bash
go build -o keeper-bot
```

### 4. 测试运行

```bash
./keeper-bot
```

检查日志输出：
```
INFO: Keeper bot started
INFO: Connected to Sepolia network
INFO: AMM Contract: 0x...
INFO: Bot Address: 0x...
INFO: Checking fees for compound...
```

### 5. 部署到服务器

#### 使用 systemd（Linux）

创建服务文件 `/etc/systemd/system/mini-amm-bot.service`：

```ini
[Unit]
Description=Mini-AMM Keeper Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/mini-amm-demo/bot
ExecStart=/path/to/mini-amm-demo/bot/keeper-bot
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable mini-amm-bot
sudo systemctl start mini-amm-bot
sudo systemctl status mini-amm-bot
```

#### 使用 Docker

创建 Dockerfile：

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o keeper-bot

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/keeper-bot .
COPY .env .
CMD ["./keeper-bot"]
```

构建并运行：

```bash
docker build -t mini-amm-bot .
docker run -d --name mini-amm-bot --restart unless-stopped mini-amm-bot
```

### 6. 监控 Bot

查看日志：

```bash
# systemd
sudo journalctl -u mini-amm-bot -f

# Docker
docker logs -f mini-amm-bot

# 直接运行
tail -f logs/keeper.log
```

---

## 部署前端应用

### 1. 更新环境变量

确保 `frontend/.env.local` 中所有地址都已正确填写。

### 2. 安装依赖

```bash
cd ../frontend
npm install
```

### 3. 本地测试

```bash
npm run dev
```

访问 http://localhost:3000 测试功能。

### 4. 构建生产版本

```bash
npm run build
```

### 5. 部署到 Vercel

#### a. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### b. 登录

```bash
vercel login
```

#### c. 部署

```bash
vercel --prod
```

按照提示操作：
1. 设置项目名称
2. 选择框架（Next.js）
3. 确认设置
4. 等待部署完成

#### d. 配置环境变量

在 Vercel Dashboard 中：
1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加所有 `NEXT_PUBLIC_*` 变量
4. 重新部署

### 6. 部署到 Netlify（替代方案）

#### a. 构建设置

在 `netlify.toml` 中配置：

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### b. 连接 GitHub

1. 访问 Netlify Dashboard
2. 点击 "New site from Git"
3. 选择您的 GitHub 仓库
4. 配置构建设置
5. 添加环境变量
6. 点击 "Deploy site"

---

## 验证部署

部署完成后，进行完整的功能测试：

### 1. 合约验证

访问 [Sepolia Etherscan](https://sepolia.etherscan.io/)：

```
https://sepolia.etherscan.io/address/YOUR_AMM_ADDRESS
```

检查：
- ✅ 合约已部署
- ✅ 合约已验证（可查看源码）
- ✅ 有初始流动性
- ✅ 有交易记录

### 2. Subgraph 验证

访问 The Graph Studio：
- ✅ Subgraph 已发布
- ✅ 同步状态正常
- ✅ 可以查询数据

测试查询：
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ swaps(first: 1) { id } }"}' \
  YOUR_SUBGRAPH_URL
```

### 3. Bot 验证

检查 Bot 日志：
- ✅ Bot 正在运行
- ✅ 无错误日志
- ✅ 可以看到检查和操作记录

在区块链浏览器查看 Bot 地址：
- ✅ 有交易记录
- ✅ 成功执行 compound 或 rebalance

### 4. 前端验证

访问部署的网站：
- ✅ 网站可以访问
- ✅ 可以连接钱包
- ✅ 可以查看池子数据
- ✅ 可以执行交换
- ✅ 可以添加/移除流动性
- ✅ 可以查看 Bot 记录

### 5. 端到端测试

执行完整流程：

1. **连接钱包**
   ```
   连接 MetaMask → 切换到 Sepolia 网络 → 确认连接
   ```

2. **获取测试代币**
   ```
   访问合约页面 → 调用 mint 函数 → 获取 TKA 和 TKB
   ```

3. **执行交换**
   ```
   访问交换页面 → 输入金额 → 确认交易 → 等待确认
   ```

4. **添加流动性**
   ```
   访问流动性页面 → 输入金额 → 批准代币 → 添加流动性
   ```

5. **查看数据**
   ```
   检查池子页面 → 查看交易记录 → 查看价格图表
   ```

6. **等待 Bot 操作**
   ```
   等待 5 分钟 → 查看 Bot 记录 → 确认自动复投
   ```

---

## 常见问题

### Q1: 部署合约时交易失败

**可能原因：**
- Gas 不足
- 私钥错误
- RPC 节点问题

**解决方法：**
```bash
# 检查余额
npx hardhat run scripts/check-balance.js --network sepolia

# 增加 Gas Limit
# 在 hardhat.config.js 中：
sepolia: {
  gas: 5000000,
  gasPrice: 8000000000  // 8 Gwei
}
```

### Q2: Subgraph 同步失败

**可能原因：**
- 起始区块号错误
- 合约地址错误
- ABI 不匹配

**解决方法：**
1. 检查 subgraph.yaml 中的地址
2. 确认起始区块号正确
3. 重新复制 ABI 文件
4. 重新部署 Subgraph

### Q3: Bot 无法连接到合约

**可能原因：**
- RPC URL 错误
- 合约地址错误
- 私钥权限不足

**解决方法：**
```bash
# 测试 RPC 连接
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  YOUR_RPC_URL

# 检查 Bot 地址权限
npx hardhat run scripts/check-bot-role.js --network sepolia
```

### Q4: 前端无法连接到合约

**可能原因：**
- 网络配置错误
- 合约地址错误
- ABI 文件缺失

**解决方法：**
1. 检查环境变量
2. 确认 Chain ID（Sepolia = 11155111）
3. 重新构建前端
4. 清除浏览器缓存

### Q5: Gas 费用太高

**解决方法：**
- 在网络不拥堵时部署
- 优化合约代码
- 调整 Gas Price
- 使用 L2 测试网（如 Optimism Sepolia）

---

## 部署检查清单

部署前：
- [ ] 所有环境变量已配置
- [ ] 获取足够的测试 ETH
- [ ] 所有依赖已安装
- [ ] 代码已经过测试

部署后：
- [ ] 合约地址已记录
- [ ] 合约已在 Etherscan 验证
- [ ] 初始流动性已添加
- [ ] Subgraph 已部署并同步
- [ ] Bot 服务正常运行
- [ ] 前端应用可访问
- [ ] 所有功能已测试

---

## 监控和维护

### 日常检查

1. **每天检查：**
   - Bot 运行状态
   - 错误日志
   - Gas 余额

2. **每周检查：**
   - 交易统计
   - 用户反馈
   - 性能指标

3. **每月检查：**
   - 安全更新
   - 依赖升级
   - 备份数据

### 监控工具

- **区块链浏览器**: https://sepolia.etherscan.io/
- **The Graph Studio**: https://thegraph.com/studio/
- **Vercel Analytics**: 前端性能监控
- **自定义监控**: 设置告警通知

---

## 下一步

部署完成后，您可以：

1. 📝 编写用户文档
2. 🎓 创建教程视频
3. 🌐 推广您的项目
4. 🔧 收集反馈并改进
5. 🚀 部署到主网（需要审计！）

---

## 🎉 恭喜！

您已成功将 Mini-AMM 部署到测试网！

如有问题，请：
- 查看项目文档
- 访问 GitHub Issues
- 联系项目维护者

---

**重要提醒：**

⚠️ 测试网部署仅用于学习和演示
⚠️ 主网部署前务必进行安全审计
⚠️ 妥善保管所有私钥和敏感信息
⚠️ 定期备份重要数据
