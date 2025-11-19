/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // 生成静态页面以避免首次访问时编译
  // 这会在 build 时预渲染所有页面
  experimental: {
    optimizePackageImports: ['recharts', 'ethers'],
  },
  // 允许来自特定IP的开发模式跨域请求
  allowedDevOrigins: ['155.94.154.240'],
};

module.exports = nextConfig;
