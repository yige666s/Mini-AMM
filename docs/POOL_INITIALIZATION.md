# 流动性池初始化指南

本文档说明如何为 Mini-AMM 流动性池添加初始资金。

## 📖 为什么需要初始化池子？

新部署的 AMM 合约虽然已经创建，但池子内**没有任何代币**。这意味着：
- ❌ 用户无法进行代币交换
- ❌ 无法计算价格
- ❌ 无法添加流动性

因此，必须先向池子添加初始流动性，才能开始使用。

---

## 🎯 初始化目标

- ✅ 为池子添加初始的 TKA 和 TKB 代币
- ✅ 建立初始价格比例（通常为 1:1）
- ✅ 确保池子有足够深度供用户交易
- ✅ 铸造初始 LP Token

---

## 方法一：使用自动化脚本（推荐）

这是最简单的方法，适合开发和测试环境。

### 1. 准备环境

确保您已经：
- ✅ 部署了所有合约
- ✅ 配置了环境变量
- ✅ 部署账户有足够的测试 ETH

### 2. 运行初始化脚本

#### 本地网络

```bash
cd contracts
npx hardhat run scripts/initialize-pool.js --network localhost
```

#### Sepolia 测试网

```bash
npx hardhat run scripts/initialize-pool.js --network sepolia
```

### 3. 脚本执行步骤

脚本会自动完成以下操作：

**步骤 1: 铸造测试代币**
```
正在铸造测试代币...
✓ 铸造 100,000 TKA
✓ 铸造 100,000 TKB
```

**步骤 2: 批准合约**
```
正在批准 AMM 合约...
✓ 批准 TKA
✓ 批准 TKB
```

**步骤 3: 添加流动性**
```
正在添加初始流动性...
- 添加 10,000 TKA
- 添加 10,000 TKB
✓ 获得 10,000 LP Token
```

**步骤 4: 验证**
```
验证池子状态...
✓ TKA 储备: 10,000
✓ TKB 储备: 10,000
✓ 总 LP Token: 10,000
✓ 价格: 1 TKA = 1.000 TKB
```

### 4. 检查结果

访问区块链浏览器查看交易：
```
https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

---

## 方法二：手动初始化

如果您想更精确地控制初始化过程，可以手动执行每个步骤。

### 步骤 1: 铸造测试代币

#### 使用 Hardhat Console

```bash
npx hardhat console --network sepolia
```

在控制台中：

```javascript
// 获取合约实例
const tokenAAddress = "0xYOUR_TOKEN_A_ADDRESS"
const tokenBAddress = "0xYOUR_TOKEN_B_ADDRESS"
const ammAddress = "0xYOUR_AMM_ADDRESS"

const TokenA = await ethers.getContractAt("TestToken", tokenAAddress)
const TokenB = await ethers.getContractAt("TestToken", tokenBAddress)
const AMM = await ethers.getContractAt("MiniAMM", ammAddress)

// 铸造代币（假设合约有 mint 函数）
const amount = ethers.utils.parseEther("100000")
await TokenA.mint(await ethers.provider.getSigner().getAddress(), amount)
await TokenB.mint(await ethers.provider.getSigner().getAddress(), amount)

console.log("代币铸造完成")
```

#### 使用 Etherscan

1. 访问 TokenA 合约页面
2. 切换到 "Write Contract" 标签
3. 连接钱包
4. 找到 `mint` 函数
5. 填入参数：
   - `to`: 您的地址
   - `amount`: `100000000000000000000000` (100,000 * 10^18)
6. 点击 "Write" 并确认交易
7. 对 TokenB 重复相同操作

### 步骤 2: 批准 AMM 合约

在 Hardhat Console 或 Etherscan 上：

```javascript
// Hardhat Console
const approveAmount = ethers.utils.parseEther("50000")
await TokenA.approve(ammAddress, approveAmount)
await TokenB.approve(ammAddress, approveAmount)

console.log("批准完成")
```

Etherscan 操作：
1. 访问 TokenA 合约 "Write Contract"
2. 找到 `approve` 函数
3. 填入：
   - `spender`: AMM 合约地址
   - `amount`: `50000000000000000000000`
4. 确认交易
5. 对 TokenB 重复

### 步骤 3: 添加初始流动性

```javascript
// Hardhat Console
const amountA = ethers.utils.parseEther("10000")
const amountB = ethers.utils.parseEther("10000")

const tx = await AMM.addLiquidity(
  amountA,
  amountB,
  0,  // minLiquidity (设为 0 用于初始化)
  Math.floor(Date.now() / 1000) + 60 * 20  // deadline (20 分钟后)
)

await tx.wait()
console.log("初始流动性添加完成")
console.log("交易哈希:", tx.hash)
```

Etherscan 操作：
1. 访问 AMM 合约 "Write Contract"
2. 找到 `addLiquidity` 函数
3. 填入：
   - `amountADesired`: `10000000000000000000000`
   - `amountBDesired`: `10000000000000000000000`
   - `minLiquidity`: `0`
   - `deadline`: 时间戳（当前时间 + 1200 秒）
4. 确认交易

### 步骤 4: 验证初始化

```javascript
// Hardhat Console
const reserves = await AMM.getReserves()
console.log("TKA 储备:", ethers.utils.formatEther(reserves.reserveA))
console.log("TKB 储备:", ethers.utils.formatEther(reserves.reserveB))

const lpBalance = await AMM.balanceOf(await ethers.provider.getSigner().getAddress())
console.log("LP Token 余额:", ethers.utils.formatEther(lpBalance))
```

---

## 方法三：从前端界面初始化

如果前端已部署，您也可以通过界面添加初始流动性。

### 前提条件

1. ✅ 前端应用已部署并可访问
2. ✅ 您的钱包有测试代币
3. ✅ 连接到正确的网络

### 操作步骤

**1. 连接钱包**
- 访问前端应用
- 点击 "Connect Wallet"
- 选择并连接您的钱包

**2. 获取测试代币**

如果还没有代币，需要先铸造：
- 访问合约页面（Etherscan）
- 调用 mint 函数获取代币

**3. 添加流动性**
- 点击导航栏的 "流动性"
- 选择 "添加流动性"
- 输入代币数量（建议至少 1,000）
- 点击 "批准" TKA
- 等待交易确认
- 点击 "批准" TKB
- 等待交易确认
- 点击 "添加流动性"
- 确认交易

**4. 验证结果**
- 查看 "池子" 页面
- 确认储备量已更新
- 检查您的 LP Token 余额

---

## 💰 建议的初始化金额

根据不同场景，建议的初始流动性：

### 开发和演示

```
最小配置：
- 1,000 TKA + 1,000 TKB
- 适合：基本功能测试

推荐配置：
- 10,000 TKA + 10,000 TKB
- 适合：完整功能演示

充足配置：
- 100,000 TKA + 100,000 TKB
- 适合：压力测试和多用户场景
```

### 公开测试网

```
测试配置：
- 50,000 TKA + 50,000 TKB
- 提供合理的交易深度
- 允许多个用户测试

生产模拟：
- 500,000 TKA + 500,000 TKB
- 模拟真实流动性
- 支持大额交易测试
```

### 选择建议

考虑因素：
1. **预期用户数量**：用户越多需要越深的流动性
2. **测试目的**：基本测试 vs 压力测试
3. **价格稳定性**：更深的流动性 = 更稳定的价格
4. **Gas 成本**：更多代币 = 更高初始化成本

---

## 🔍 验证初始化结果

### 1. 检查储备量

**使用 Hardhat:**
```bash
npx hardhat run scripts/check-reserves.js --network sepolia
```

**预期输出:**
```
Mini-AMM Pool Status
====================
TKA Reserve: 10000.0
TKB Reserve: 10000.0
Total LP Supply: 10000.0
Current Price: 1 TKA = 1.000 TKB
```

### 2. 检查合约状态

访问 Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_AMM_ADDRESS
```

查看：
- ✅ "Read Contract" 中的 `getReserves()`
- ✅ "Read Contract" 中的 `totalSupply()`
- ✅ 最近的交易记录

### 3. 检查 LP Token

```javascript
// 查询您的 LP Token 余额
const lpBalance = await AMM.balanceOf("YOUR_ADDRESS")
console.log("LP Token:", ethers.utils.formatEther(lpBalance))
```

### 4. 测试交换功能

尝试小额交换以验证池子工作正常：

```javascript
// 批准少量 TKA
await TokenA.approve(ammAddress, ethers.utils.parseEther("100"))

// 执行交换
await AMM.swapAForB(
  ethers.utils.parseEther("10"),  // 交换 10 TKA
  0,  // 接受任何输出（测试用）
  Math.floor(Date.now() / 1000) + 60 * 20
)
```

预期结果：
- ✅ 交易成功
- ✅ 收到接近 10 TKB（减去 0.3% 手续费）
- ✅ 储备量已更新

---

## ⚠️ 常见问题

### Q1: 交易失败 "Insufficient allowance"

**原因:** 没有批准合约使用代币

**解决:**
```bash
# 批准代币
await TokenA.approve(ammAddress, ethers.utils.parseEther("50000"))
await TokenB.approve(ammAddress, ethers.utils.parseEther("50000"))
```

### Q2: 交易失败 "Insufficient balance"

**原因:** 账户余额不足

**解决:**
```bash
# 检查余额
const balance = await TokenA.balanceOf("YOUR_ADDRESS")
console.log("TKA Balance:", ethers.utils.formatEther(balance))

# 如果不足，铸造更多
await TokenA.mint("YOUR_ADDRESS", ethers.utils.parseEther("100000"))
```

### Q3: 价格比例不对

**原因:** 添加的两种代币数量不相等

**解决:**
- 对于初始化，务必添加相等数量
- 例如：10,000 TKA + 10,000 TKB

### Q4: Gas 费用太高

**原因:** 网络拥堵或添加金额过大

**解决:**
- 选择网络不繁忙时操作
- 减少初始化金额
- 在 hardhat.config.js 中调整 Gas Price

### Q5: 如何重置池子？

如果需要重新初始化：

**选项 1: 移除所有流动性**
```javascript
const lpBalance = await AMM.balanceOf("YOUR_ADDRESS")
await AMM.removeLiquidity(
  lpBalance,
  0,
  0,
  Math.floor(Date.now() / 1000) + 60 * 20
)
```

**选项 2: 重新部署合约**
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 📋 初始化检查清单

完成初始化后，确认：

- [ ] 池子中有 TKA 和 TKB 代币
- [ ] 储备量比例正确（通常 1:1）
- [ ] 已铸造 LP Token
- [ ] 价格计算正确
- [ ] 可以执行小额交换测试
- [ ] 前端显示正确的池子数据
- [ ] Subgraph 已索引初始化事件

---

## 🎯 最佳实践

1. **使用脚本自动化**
   - 减少人为错误
   - 可重复执行
   - 便于测试

2. **保持比例**
   - 初始化时使用 1:1 比例
   - 简化价格计算
   - 便于用户理解

3. **适量添加**
   - 不要过多（浪费 Gas）
   - 不要过少（流动性不足）
   - 根据场景选择合适金额

4. **及时验证**
   - 每步操作后检查结果
   - 确认交易成功
   - 验证状态正确

5. **记录信息**
   - 保存交易哈希
   - 记录添加的数量
   - 备份 LP Token 信息

---

## 📚 相关文档

- [用户使用指南](./USER_GUIDE.md) - 了解如何使用系统
- [测试网部署指南](./TESTNET_DEPLOYMENT.md) - 完整部署流程
- [架构文档](./ARCHITECTURE.md) - 系统设计详解

---

## 🎉 完成！

您已成功初始化流动性池！现在用户可以：
- ✅ 进行代币交换
- ✅ 添加更多流动性
- ✅ 查看池子数据
- ✅ 使用自动复投功能

如有问题，请查阅其他文档或联系维护者。
