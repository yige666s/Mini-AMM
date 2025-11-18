# 贡献指南

感谢你对 Mini-AMM 项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请创建一个 Issue 并包含以下信息：

- Bug 的详细描述
- 复现步骤
- 期望的行为
- 实际的行为
- 截图（如果适用）
- 环境信息（操作系统、Node.js 版本等）

### 提出新功能

如果你有新功能的想法，请创建一个 Issue 并描述：

- 功能的详细说明
- 使用场景
- 为什么这个功能有用
- 实现思路（可选）

### 提交代码

1. **Fork 项目**

   点击右上角的 Fork 按钮

2. **克隆仓库**

   ```bash
   git clone https://github.com/your-username/mini-amm-demo.git
   cd mini-amm-demo
   ```

3. **创建分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **进行更改**

   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新相关文档

5. **提交更改**

   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式（不影响功能）
   - `refactor:` 重构
   - `test:` 测试相关
   - `chore:` 构建过程或辅助工具的变动

6. **推送到 GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**

   在 GitHub 上创建 Pull Request，并描述你的更改。

## 开发规范

### 代码风格

#### Solidity

- 使用 4 空格缩进
- 遵循 [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- 使用有意义的变量名
- 添加 NatSpec 注释

```solidity
/// @notice 添加流动性到池子
/// @param amountA Token A 的数量
/// @param amountB Token B 的数量
/// @return liquidity 获得的 LP Token 数量
function addLiquidity(uint256 amountA, uint256 amountB) 
    external 
    returns (uint256 liquidity) 
{
    // 实现
}
```

#### Go

- 使用 `gofmt` 格式化代码
- 遵循 [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- 使用有意义的变量名
- 添加必要的注释

```go
// CompoundService 负责自动复投累积的手续费
type CompoundService struct {
    config    *Config
    rpcClient *RPCClient
}

// Start 启动自动复投服务
func (c *CompoundService) Start(ctx context.Context) {
    // 实现
}
```

#### TypeScript/React

- 使用 2 空格缩进
- 使用函数式组件和 Hooks
- 使用 TypeScript 类型注解
- 遵循 React 最佳实践

```typescript
interface SwapProps {
  tokenA: string
  tokenB: string
}

export default function SwapPage({ tokenA, tokenB }: SwapProps) {
  // 实现
}
```

### 测试

- 为新功能添加测试
- 确保所有测试通过
- 测试覆盖率应保持在 80% 以上

```bash
# 运行测试
make test

# 或分别运行
cd contracts && npx hardhat test
cd bot && go test ./...
cd frontend && npm run test
```

### 文档

- 更新相关的 README
- 为新功能添加使用示例
- 更新 API 文档
- 保持文档的中文版本同步

## 审查流程

1. 提交 Pull Request
2. 自动运行 CI/CD 测试
3. 代码审查
4. 根据反馈进行修改
5. 合并到主分支

## 社区规范

### 行为准则

- 尊重所有贡献者
- 接受建设性的批评
- 专注于对项目最有利的事情
- 对社区成员表现出同理心

### 交流方式

- Issue 讨论
- Pull Request 评论
- Discord/Telegram 群组（如果有）

## 开发环境设置

### 前置要求

- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- Git

### 设置步骤

```bash
# 1. Fork 并克隆项目
git clone https://github.com/your-username/mini-amm-demo.git
cd mini-amm-demo

# 2. 安装依赖
make install

# 3. 启动开发环境
make up

# 4. 部署合约
make deploy

# 5. 运行测试
make test
```

## 常见问题

### 如何调试智能合约？

使用 Hardhat console:

```bash
cd contracts
npx hardhat console --network localhost
```

### 如何调试 Bot？

在 Bot 中添加日志：

```go
log.Infof("调试信息: %v", data)
```

### 如何调试前端？

使用浏览器开发者工具和 React DevTools。

## 版本发布

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

- MAJOR.MINOR.PATCH
- 例如：1.2.3

### 发布流程

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git tag
4. 发布 Release

## 许可证

通过贡献代码，你同意你的贡献将使用 MIT 许可证。

## 联系方式

如有任何问题，请通过以下方式联系：

- GitHub Issues
- Email: [你的邮箱]
- Discord: [Discord 链接]

---

再次感谢你的贡献！🎉
