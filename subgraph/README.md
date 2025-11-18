# Mini-AMM Subgraph

The Graph 数据索引服务，用于索引 Mini-AMM 合约的链上事件。

## 功能

- 实时索引 Swap, Mint, Burn 事件
- 记录 Bot 操作 (复投和再平衡)
- 提供 GraphQL 查询接口
- 时间序列数据统计

## 安装

```bash
npm install
```

## 开发

### 1. 更新合约地址

编辑 `subgraph.yaml`，更新 `source.address` 为部署的 MiniAMM 合约地址。

### 2. 生成代码

```bash
npm run codegen
```

### 3. 构建

```bash
npm run build
```

### 4. 部署到本地 Graph Node

```bash
# 创建 Subgraph
npm run create-local

# 部署
npm run deploy-local
```

## 查询示例

访问 GraphQL Playground: http://localhost:8001/subgraphs/name/mini-amm-subgraph

### 查询池子信息

```graphql
{
  pool(id: "1") {
    reserveA
    reserveB
    price
    totalLiquidity
    swapCount
  }
}
```

### 查询最近交易

```graphql
{
  swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
    user
    amountIn
    amountOut
    AtoB
    timestamp
  }
}
```

### 查询 Bot 操作

```graphql
{
  botActions(first: 10, orderBy: timestamp, orderDirection: desc) {
    action
    amountA
    amountB
    timestamp
  }
}
```

## 实体说明

- **Pool**: 流动性池状态
- **Swap**: 交换事件
- **Mint**: 添加流动性事件
- **Burn**: 移除流动性事件
- **BotAction**: Bot 操作记录
- **User**: 用户信息
- **PoolDayData**: 每日统计
- **PoolHourData**: 每小时统计

## 更多信息

查看 [The Graph 文档](https://thegraph.com/docs/)
