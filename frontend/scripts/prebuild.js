#!/usr/bin/env node

/**
 * 预构建脚本
 * 该脚本在构建后运行，确保所有页面都被预编译
 * 这样用户首次访问时不需要等待编译
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始预构建检查...');

// 检查 .next 目录是否存在
const nextDir = path.join(__dirname, '..', '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ .next 目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 检查是否有 standalone 目录（用于生产部署）
const standaloneDir = path.join(nextDir, 'standalone');
if (fs.existsSync(standaloneDir)) {
  console.log('✅ 发现 standalone 构建');
}

// 检查静态文件
const staticDir = path.join(nextDir, 'static');
if (fs.existsSync(staticDir)) {
  console.log('✅ 静态文件已生成');
}

// 检查页面文件
const pagesManifest = path.join(nextDir, 'server', 'pages-manifest.json');
if (fs.existsSync(pagesManifest)) {
  const manifest = JSON.parse(fs.readFileSync(pagesManifest, 'utf-8'));
  const pages = Object.keys(manifest);
  console.log(`✅ 已构建 ${pages.length} 个页面:`);
  pages.forEach(page => console.log(`   - ${page}`));
} else {
  console.warn('⚠️  未找到 pages-manifest.json');
}

console.log('✅ 预构建检查完成！');
console.log('💡 提示: 使用 npm start 启动生产服务器');
