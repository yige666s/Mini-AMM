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
};

module.exports = nextConfig;
