# Mini-AMM Keeper Bot

Go 语言编写的链下自动化服务，负责自动复投手续费和价格再平衡。

## 功能

- 🔄 **自动复投**: 每 5 分钟将累积的手续费复投回流动性池
- ⚖️ **自动再平衡**: 当价格偏离超过 5% 时自动调整
- 🔌 **RPC 故障转移**: 支持多个备用 RPC 节点
- ⚙️ **灵活配置**: 通过环境变量配置所有参数
- 📝 **详细日志**: 完整的操作日志记录

## 安装

```bash
go mod download
```

## 配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# RPC 配置
RPC_ENDPOINT=http://localhost:8545
CHAIN_ID=31337

# 合约地址
CONTRACT_ADDRESS=0x...

# 私钥
PRIVATE_KEY=0x...

# 复投配置（秒）
COMPOUND_INTERVAL=300

# 再平衡配置
REBALANCE_INTERVAL=60
REBALANCE_THRESHOLD=0.05

# Gas 配置
GAS_LIMIT=300000
MAX_GAS_PRICE=100

# 重试配置
RETRY_ATTEMPTS=3
RETRY_DELAY=5
```

## 运行

### 开发模式

```bash
go run .
```

### 编译运行

```bash
# 编译
go build -o keeper-bot

# 运行
./keeper-bot
```

### Docker 运行

```bash
docker-compose up -d bot
```

## 架构

```
main.go           - 入口文件，初始化服务
config.go         - 配置加载和管理
rpc.go            - RPC 连接管理
compound.go       - 自动复投服务
rebalance.go      - 自动再平衡服务
tx.go             - 交易签名和发送
contract.go       - 合约接口定义
```

## 工作流程

### 自动复投流程

1. 定时器触发（每 5 分钟）
2. 查询累积的手续费
3. 检查是否达到最小阈值
4. 计算最优复投比例
5. 调用 `compoundFees()` 执行复投
6. 等待交易确认
7. 记录操作日志

### 再平衡流程

1. 定时器触发（每 1 分钟）
2. 查询当前价格
3. 计算与初始价格的偏差
4. 如果偏差 > 5%，执行再平衡
5. 调用 `rebalance()` 执行小额 swap
6. 等待交易确认
7. 更新初始价格基准

## 日志

Bot 会输出详细的操作日志：

```
INFO[2024-01-01 00:00:00] 🚀 Mini-AMM Keeper Bot 启动中...
INFO[2024-01-01 00:00:00] ✅ RPC 连接成功
INFO[2024-01-01 00:00:00] Bot 账户地址: 0x...
INFO[2024-01-01 00:00:00] 账户余额: 1000.000000 ETH
INFO[2024-01-01 00:00:00] 自动复投服务已启动
INFO[2024-01-01 00:00:00] 自动再平衡服务已启动
INFO[2024-01-01 00:00:00] ✅ Keeper Bot 运行中...
```

## 监控

### 查看日志

```bash
# Docker
docker-compose logs -f bot

# 本地
go run . | tee bot.log
```

### 健康检查

Bot 会定期输出状态信息，确保正常运行。

## 安全注意事项

1. **私钥管理**
   - 永远不要提交私钥到 Git
   - 使用环境变量或密钥管理服务
   - 生产环境使用硬件钱包或 KMS

2. **Gas 管理**
   - 设置合理的 Gas Limit
   - 配置 Max Gas Price 避免过高费用
   - 监控 Gas 消耗

3. **RPC 可靠性**
   - 配置多个备用 RPC 节点
   - 监控 RPC 连接状态
   - 实现故障自动切换

## 故障排除

### 连接失败

```
Error: dial tcp: lookup localhost: no such host
```

**解决方案**: 检查 RPC_ENDPOINT 配置是否正确。

### 交易失败

```
Error: execution reverted: Only bot
```

**解决方案**: 确保 Bot 账户地址与合约中设置的 bot 地址一致。

### Gas 不足

```
Error: insufficient funds for gas * price + value
```

**解决方案**: 给 Bot 账户充值 ETH。

## 测试

```bash
go test ./...
```

## 更多信息

查看项目主文档: [../README.md](../README.md)
