# API 文档

## 智能合约 API

### MiniAMM 合约

#### 读取函数

##### getReserves()

获取当前池子储备量。

```solidity
function getReserves() external view returns (uint256, uint256)
```

**返回值:**
- `uint256` - Token A 储备量
- `uint256` - Token B 储备量

**示例:**
```javascript
const reserves = await miniAMM.getReserves();
console.log("Reserve A:", reserves[0].toString());
console.log("Reserve B:", reserves[1].toString());
```

---

##### getFees()

获取累积的手续费。

```solidity
function getFees() external view returns (uint256, uint256)
```

**返回值:**
- `uint256` - 累积的 Token A 手续费
- `uint256` - 累积的 Token B 手续费

---

##### getPrice()

获取当前价格 (reserveB / reserveA)。

```solidity
function getPrice() external view returns (uint256)
```

**返回值:**
- `uint256` - 当前价格 (18 位小数)

---

##### getAmountOut()

预估输出数量。

```solidity
function getAmountOut(uint256 amountIn, bool AtoB) external view returns (uint256)
```

**参数:**
- `amountIn` - 输入数量
- `AtoB` - 方向 (true: A→B, false: B→A)

**返回值:**
- `uint256` - 预估输出数量

---

#### 写入函数

##### addLiquidity()

添加流动性。

```solidity
function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256 liquidity)
```

**参数:**
- `amountA` - Token A 数量
- `amountB` - Token B 数量

**返回值:**
- `liquidity` - 获得的 LP Token 数量

**事件:**
```solidity
event Mint(
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity,
    uint256 timestamp
)
```

**前置条件:**
- 已授权合约使用 Token A 和 Token B
- 数量大于 0

**示例:**
```javascript
// 授权
await tokenA.approve(miniAMMAddress, amountA);
await tokenB.approve(miniAMMAddress, amountB);

// 添加流动性
const tx = await miniAMM.addLiquidity(amountA, amountB);
const receipt = await tx.wait();
```

---

##### removeLiquidity()

移除流动性。

```solidity
function removeLiquidity(uint256 liquidity) external returns (uint256 amountA, uint256 amountB)
```

**参数:**
- `liquidity` - LP Token 数量

**返回值:**
- `amountA` - 获得的 Token A 数量
- `amountB` - 获得的 Token B 数量

**事件:**
```solidity
event Burn(
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity,
    uint256 timestamp
)
```

---

##### swap()

交换代币。

```solidity
function swap(uint256 amountIn, bool AtoB) external returns (uint256 amountOut)
```

**参数:**
- `amountIn` - 输入数量
- `AtoB` - 交换方向 (true: A→B, false: B→A)

**返回值:**
- `amountOut` - 输出数量

**事件:**
```solidity
event Swap(
    address indexed user,
    uint256 amountIn,
    uint256 amountOut,
    bool AtoB,
    uint256 timestamp
)
```

**手续费:** 0.3% (997/1000)

**示例:**
```javascript
// 授权输入代币
await tokenA.approve(miniAMMAddress, amountIn);

// 执行交换
const tx = await miniAMM.swap(amountIn, true); // A → B
const receipt = await tx.wait();
```

---

##### compoundFees() (仅 Bot)

复投累积的手续费。

```solidity
function compoundFees() external onlyBot returns (uint256 liquidity)
```

**返回值:**
- `liquidity` - 铸造的 LP Token 数量

**权限:** 仅 Bot 地址可调用

**事件:**
```solidity
event FeeCollected(uint256 feeA, uint256 feeB, uint256 timestamp)
event Mint(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)
```

---

##### rebalance() (仅 Bot)

执行价格再平衡。

```solidity
function rebalance(uint256 amountIn, bool AtoB) external onlyBot returns (uint256 amountOut)
```

**参数:**
- `amountIn` - 输入数量
- `AtoB` - 方向

**返回值:**
- `amountOut` - 输出数量

**权限:** 仅 Bot 地址可调用

**事件:**
```solidity
event Rebalance(uint256 amountIn, uint256 amountOut, bool AtoB, uint256 timestamp)
```

---

## Subgraph GraphQL API

### 查询端点

```
http://localhost:8001/subgraphs/name/mini-amm-subgraph
```

### Schema

#### Pool

```graphql
type Pool {
  id: ID!
  tokenA: Bytes!
  tokenB: Bytes!
  reserveA: BigInt!
  reserveB: BigInt!
  price: BigDecimal!
  totalLiquidity: BigInt!
  feeA: BigInt!
  feeB: BigInt!
  swapCount: BigInt!
  updatedAt: BigInt!
}
```

**查询示例:**
```graphql
{
  pool(id: "1") {
    reserveA
    reserveB
    price
    totalLiquidity
  }
}
```

---

#### Swap

```graphql
type Swap {
  id: ID!
  pool: Pool!
  user: Bytes!
  amountIn: BigInt!
  amountOut: BigInt!
  AtoB: Boolean!
  timestamp: BigInt!
  transactionHash: Bytes!
}
```

**查询示例:**
```graphql
{
  swaps(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    user
    amountIn
    amountOut
    timestamp
  }
}
```

---

#### BotAction

```graphql
type BotAction {
  id: ID!
  pool: Pool!
  action: String!  # "COMPOUND" 或 "REBALANCE"
  amountA: BigInt
  amountB: BigInt
  timestamp: BigInt!
  transactionHash: Bytes!
}
```

**查询示例:**
```graphql
{
  botActions(
    first: 10
    orderBy: timestamp
    orderDirection: desc
    where: { action: "COMPOUND" }
  ) {
    id
    action
    amountA
    amountB
    timestamp
  }
}
```

---

#### PoolDayData

```graphql
type PoolDayData {
  id: ID!
  pool: Pool!
  date: Int!
  volumeA: BigInt!
  volumeB: BigInt!
  swapCount: BigInt!
  reserveA: BigInt!
  reserveB: BigInt!
}
```

**查询示例:**
```graphql
{
  poolDayDatas(
    first: 30
    orderBy: date
    orderDirection: desc
  ) {
    date
    volumeA
    volumeB
    swapCount
  }
}
```

---

### 复杂查询示例

#### 获取池子概览

```graphql
{
  pool(id: "1") {
    reserveA
    reserveB
    price
    totalLiquidity
    swapCount
    
    # 最近交易
    swaps: swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
      user
      amountIn
      amountOut
      timestamp
    }
    
    # Bot 操作
    botActions: botActions(first: 5, orderBy: timestamp, orderDirection: desc) {
      action
      timestamp
    }
  }
}
```

#### 获取用户数据

```graphql
{
  user(id: "0x...") {
    liquidityBalance
    swapCount
    totalValueAdded
    totalValueRemoved
  }
}
```

#### 获取历史统计

```graphql
{
  poolDayDatas(first: 7, orderBy: date, orderDirection: desc) {
    date
    volumeA
    volumeB
    swapCount
    reserveA
    reserveB
  }
}
```

---

## Bot RPC API

Bot 通过 JSON-RPC 与以太坊节点交互。

### 主要 RPC 方法

#### eth_call

读取合约状态。

```javascript
const reserves = await provider.call({
  to: contractAddress,
  data: iface.encodeFunctionData("getReserves")
});
```

#### eth_sendRawTransaction

发送签名交易。

```javascript
const tx = await wallet.sendTransaction({
  to: contractAddress,
  data: iface.encodeFunctionData("compoundFees"),
  gasLimit: 300000
});
```

#### eth_getTransactionReceipt

获取交易收据。

```javascript
const receipt = await provider.getTransactionReceipt(txHash);
```

---

## 错误码

### 合约错误

| 错误消息 | 说明 |
|---------|------|
| `No reentrant` | 重入攻击保护 |
| `Only bot` | 仅 Bot 可调用 |
| `Invalid amounts` | 输入数量无效 |
| `Insufficient output amount` | 输出数量不足 |
| `Insufficient liquidity` | 流动性不足 |
| `No fees to compound` | 没有可复投的手续费 |

### RPC 错误

| 错误码 | 说明 |
|-------|------|
| `-32000` | Gas 不足 |
| `-32601` | 方法不存在 |
| `-32602` | 参数无效 |

---

## 速率限制

### Subgraph API

- 每秒最多 100 个查询
- 单次查询最多返回 1000 条记录

### RPC 节点

- 取决于节点提供商
- 建议使用多个备用节点

---

## SDK 示例

### JavaScript / TypeScript

```typescript
import { ethers } from 'ethers';

// 连接合约
const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const miniAMM = new ethers.Contract(address, abi, provider);

// 读取数据
const reserves = await miniAMM.getReserves();
const price = await miniAMM.getPrice();

// 写入数据
const signer = provider.getSigner();
const miniAMMWithSigner = miniAMM.connect(signer);

await tokenA.approve(miniAMMAddress, amountA);
const tx = await miniAMMWithSigner.addLiquidity(amountA, amountB);
await tx.wait();
```

### Go

```go
import (
    "github.com/ethereum/go-ethereum/ethclient"
    "github.com/ethereum/go-ethereum/accounts/abi/bind"
)

// 连接
client, _ := ethclient.Dial("http://localhost:8545")
contract, _ := NewMiniAMM(contractAddr, client)

// 读取
reserves, _ := contract.GetReserves(&bind.CallOpts{})

// 写入
auth, _ := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
tx, _ := contract.CompoundFees(auth)
```

---

## 测试工具

### Hardhat Console

```bash
npx hardhat console --network localhost
```

```javascript
const MiniAMM = await ethers.getContractFactory("MiniAMM");
const miniAMM = await MiniAMM.attach("0x...");
await miniAMM.getReserves();
```

### GraphQL Playground

访问: http://localhost:8001/subgraphs/name/mini-amm-subgraph

---

更多信息请参考完整文档和源代码。
