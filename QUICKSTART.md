# 🚀 快速开始指南

5 分钟内启动 Mini-AMM 完整系统！

## 📦 前置要求

确保已安装：
- Docker & Docker Compose
- Git

## 🎯 快速部署步骤

### 1️⃣ 克隆项目

```bash
git clone <repository-url>
cd mini-amm-demo
```

### 2️⃣ 复制环境变量

```bash
cp .env.example .env
```

### 3️⃣ 启动所有服务

```bash
# 启动 Hardhat 本地节点和基础设施
docker-compose up -d hardhat ipfs postgres graph-node

# 等待服务初始化（约 30 秒）
sleep 30
```

### 4️⃣ 部署智能合约

```bash
# 进入合约目录
cd contracts

# 安装依赖并部署（在容器中执行）
docker-compose exec hardhat sh -c "npm install && npx hardhat run scripts/deploy.js --network localhost"

# 或者在本地执行
npm install
npx hardhat run scripts/deploy.js --network localhost
```

**记录输出的合约地址：**
```
Token A 部署到: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Token B 部署到: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
MiniAMM 部署到: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 5️⃣ 更新环境变量

编辑 `.env` 文件，填入刚才部署的合约地址：

```bash
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_MINI_AMM_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_TOKEN_A_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_TOKEN_B_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 6️⃣ 配置并部署 Subgraph

```bash
cd ../subgraph

# 更新 subgraph.yaml 中的合约地址
# 将 address 字段改为 MiniAMM 的地址

# 安装依赖
npm install

# 生成代码和构建
npm run codegen
npm run build

# 部署到本地 Graph Node
npm run create-local
npm run deploy-local
```

### 7️⃣ 启动 Bot 和前端

```bash
cd ..

# 启动 Bot 和前端服务
docker-compose up -d bot frontend

# 查看 Bot 日志
docker-compose logs -f bot
```

### 8️⃣ 访问前端

打开浏览器访问：**http://localhost:4000**

## 🎉 完成！

现在你可以：

- 💱 **交换代币** - 访问 `/swap` 页面
- 💧 **管理流动性** - 访问 `/liquidity` 页面
- 📊 **查看池子数据** - 访问 `/pool` 页面
- 🤖 **查看 Bot 记录** - 访问 `/bot` 页面

## 🔍 验证系统运行

### 检查服务状态

```bash
docker-compose ps
```

应该看到所有服务都在运行：
- ✅ hardhat (端口 8545)
- ✅ graph-node (端口 8000, 8001)
- ✅ ipfs (端口 5001)
- ✅ postgres (端口 5432)
- ✅ bot (后台运行)
- ✅ frontend (端口 4000)

### 测试 GraphQL 查询

访问：http://localhost:8001/subgraphs/name/mini-amm-subgraph

运行查询：

```graphql
{
  pool(id: "1") {
    id
    reserveA
    reserveB
    price
  }
}
```

### 查看 Bot 日志

```bash
docker-compose logs -f bot | grep "复投\|再平衡"
```

## 🧪 测试交易

### 使用 Hardhat 控制台

```bash
cd contracts
npx hardhat console --network localhost
```

```javascript
// 获取合约实例
const MiniAMM = await ethers.getContractFactory("MiniAMM")
const miniAMM = await MiniAMM.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0")

// 查询储备量
const reserves = await miniAMM.getReserves()
console.log("Reserve A:", ethers.formatEther(reserves[0]))
console.log("Reserve B:", ethers.formatEther(reserves[1]))

// 查询价格
const price = await miniAMM.getPrice()
console.log("Price:", ethers.formatEther(price))
```

### 使用前端

1. 访问 http://localhost:3000/swap
2. 点击 "Connect Wallet"
3. 选择 "Localhost 8545"
4. 选择账户
5. 输入交换数量
6. 点击 "Swap"

## 🛠️ 常用命令

### 查看日志

```bash
# 所有服务
docker-compose logs -f

# 特定服务
docker-compose logs -f hardhat
docker-compose logs -f bot
docker-compose logs -f frontend
```

### 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart bot
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并清理数据
docker-compose down -v
rm -rf data/
```

### 重新部署

```bash
# 1. 停止服务
docker-compose down

# 2. 清理数据
rm -rf data/

# 3. 重新启动
docker-compose up -d

# 4. 重新部署合约
cd contracts
npx hardhat run scripts/deploy.js --network localhost

# 5. 更新 .env 和 subgraph.yaml

# 6. 重新部署 Subgraph
cd ../subgraph
npm run remove-local
npm run create-local
npm run deploy-local
```

## 🐛 故障排除

### 问题：Hardhat 节点启动失败

```bash
docker-compose down
docker-compose up -d hardhat
docker-compose logs -f hardhat
```

### 问题：Graph Node 无法连接 Hardhat

```bash
# 检查网络连接
docker-compose exec graph-node ping hardhat

# 重启 Graph Node
docker-compose restart graph-node
```

### 问题：Bot 无法找到合约

```bash
# 检查环境变量
docker-compose exec bot env | grep CONTRACT_ADDRESS

# 确保 .env 中配置正确
# 重启 Bot
docker-compose restart bot
```

### 问题：前端无法连接钱包

1. 确保 MetaMask 已连接到 Localhost 8545
2. 导入 Hardhat 测试账户
   - 私钥：`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. 刷新页面

## 📚 下一步

- 📖 阅读 [完整文档](./README.md)
- 🏗️ 查看 [架构设计](./docs/ARCHITECTURE.md)
- 🚀 学习 [部署指南](./docs/DEPLOYMENT.md)
- 💻 探索 [源代码](./contracts/MiniAMM.sol)

## 💡 提示

- 使用 Hardhat 账户 #0 作为 Bot 账户
- 其他账户可用于测试交易
- Bot 每 5 分钟执行一次复投
- 价格偏离 5% 时触发再平衡

---

🎊 **恭喜！你已经成功启动了完整的 Mini-AMM 系统！**

有问题？查看 [FAQ](./docs/FAQ.md) 或提交 [Issue](https://github.com/your-repo/issues)
