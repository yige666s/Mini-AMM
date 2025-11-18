# Mini-AMM 智能合约

基于 Uniswap V2 的迷你版自动做市商（AMM）智能合约。

## 合约文件

- **MiniAMM.sol** - 主 AMM 合约
- **LPToken.sol** - 流动性提供者代币
- **MockERC20.sol** - 测试用 ERC20 代币
- **interfaces/IERC20.sol** - ERC20 接口

## 核心功能

### 1. 流动性管理

#### 添加流动性

```solidity
function addLiquidity(uint256 amountA, uint256 amountB) 
    external 
    returns (uint256 liquidity)
```

用户提供 TokenA 和 TokenB，获得 LP Token。

#### 移除流动性

```solidity
function removeLiquidity(uint256 liquidity) 
    external 
    returns (uint256 amountA, uint256 amountB)
```

销毁 LP Token，取回相应比例的 TokenA 和 TokenB。

### 2. 代币交换

```solidity
function swap(uint256 amountIn, bool AtoB) 
    external 
    returns (uint256 amountOut)
```

基于 x*y=k 公式计算输出量，收取 0.3% 手续费。

**定价公式:**
```
amountOut = (reserveOut * amountIn * 997) / (reserveIn * 1000 + amountIn * 997)
```

### 3. Bot 功能

#### 复投手续费

```solidity
function compoundFees() 
    external 
    onlyBot 
    returns (uint256 liquidity)
```

将累积的手续费重新注入流动性池。

#### 价格再平衡

```solidity
function rebalance(uint256 amountIn, bool AtoB) 
    external 
    onlyBot 
    returns (uint256 amountOut)
```

执行小额 swap 调整池子比例。

### 4. 查询函数

```solidity
function getReserves() external view returns (uint256, uint256)
function getFees() external view returns (uint256, uint256)
function getPrice() external view returns (uint256)
function getAmountOut(uint256 amountIn, bool AtoB) external view returns (uint256)
```

## 安全特性

1. **重入保护** - 使用 `noReentrant` modifier
2. **权限控制** - Bot 专属函数使用 `onlyBot` modifier
3. **输入验证** - 检查所有输入参数
4. **溢出保护** - Solidity 0.8+ 内置
5. **最小流动性** - 首次添加流动性锁定 1000 wei

## 事件

```solidity
event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool AtoB, uint256 timestamp)
event Mint(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)
event Burn(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidity, uint256 timestamp)
event FeeCollected(uint256 feeA, uint256 feeB, uint256 timestamp)
event Rebalance(uint256 amountIn, uint256 amountOut, bool AtoB, uint256 timestamp)
event BotUpdated(address indexed oldBot, address indexed newBot)
```

## 开发

### 安装依赖

```bash
npm install
```

### 编译合约

```bash
npx hardhat compile
```

### 运行测试

```bash
npx hardhat test
```

### 部署合约

```bash
# 本地网络
npx hardhat run scripts/deploy.js --network localhost

# Sepolia 测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 验证合约

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 测试覆盖

测试套件包含：

- ✅ 合约部署测试
- ✅ 添加/移除流动性测试
- ✅ 代币交换测试
- ✅ 手续费收取测试
- ✅ 复投功能测试
- ✅ 再平衡功能测试
- ✅ 权限控制测试
- ✅ 价格查询测试

运行测试:

```bash
npx hardhat test
```

## Gas 优化

- 使用 `immutable` 存储 token 地址
- 优化存储布局
- 最小化状态变量读写
- 使用 `unchecked` 块（谨慎使用）

## 升级路线

### V2 功能

- [ ] 集中流动性 (Uniswap V3 style)
- [ ] 多级手续费
- [ ] 价格预言机
- [ ] 闪电贷

### V3 功能

- [ ] 跨链支持
- [ ] 治理功能
- [ ] 质押奖励

## 安全审计

⚠️ **注意**: 本项目为演示项目，未经过专业安全审计，请勿用于生产环境。

生产环境建议:
1. 进行专业安全审计
2. 实施 Bug Bounty 计划
3. 使用多签钱包管理关键功能
4. 实施时间锁机制

## License

MIT

## 参考资料

- [Uniswap V2 白皮书](https://uniswap.org/whitepaper.pdf)
- [Uniswap V2 Core](https://github.com/Uniswap/v2-core)
- [Solidity 文档](https://docs.soliditylang.org/)
