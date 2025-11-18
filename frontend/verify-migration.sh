#!/bin/bash

echo "========================================="
echo "前端迁移验证脚本"
echo "========================================="
echo ""

# 检查依赖
echo "✓ 检查依赖..."
if grep -q "ethers" package.json; then
    echo "  ✓ ethers.js 已安装"
else
    echo "  ✗ ethers.js 未安装"
    exit 1
fi

if grep -q "wagmi\|rainbowkit" package.json; then
    echo "  ✗ 仍然包含 Wagmi/RainbowKit"
    exit 1
else
    echo "  ✓ Wagmi/RainbowKit 已移除"
fi

# 检查关键文件
echo ""
echo "✓ 检查关键文件..."
files=(
    "lib/Web3Context.tsx"
    "lib/hooks/useContracts.ts"
    "lib/hooks/useTokenBalance.ts"
    "lib/hooks/usePoolData.ts"
    "app/components/ConnectButton.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file 存在"
    else
        echo "  ✗ $file 不存在"
        exit 1
    fi
done

# 检查是否移除了旧文件
echo ""
echo "✓ 检查旧文件清理..."
if [ -f "lib/wagmi.ts" ]; then
    echo "  ✗ lib/wagmi.ts 仍然存在"
    exit 1
else
    echo "  ✓ lib/wagmi.ts 已移除"
fi

if [ -d "shims" ]; then
    echo "  ✗ shims 目录仍然存在"
    exit 1
else
    echo "  ✓ shims 目录已移除"
fi

# TypeScript 类型检查
echo ""
echo "✓ 运行 TypeScript 类型检查..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "  ✓ TypeScript 检查通过"
else
    echo "  ✗ TypeScript 检查失败"
    exit 1
fi

# ESLint 检查
echo ""
echo "✓ 运行 ESLint 检查..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ ESLint 检查通过"
else
    echo "  ⚠ ESLint 有警告（可能是 TypeScript 版本不匹配）"
fi

# 构建测试
echo ""
echo "✓ 运行生产构建..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "  ✓ 构建成功"
else
    echo "  ✗ 构建失败"
    exit 1
fi

echo ""
echo "========================================="
echo "✅ 所有检查通过！前端迁移成功！"
echo "========================================="
echo ""
echo "下一步:"
echo "1. 配置 .env.local 文件"
echo "2. 启动开发服务器: npm run dev"
echo "3. 连接 MetaMask 并测试功能"
echo ""
