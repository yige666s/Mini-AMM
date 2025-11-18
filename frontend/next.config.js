/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    const path = require('path')
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.resolve.alias = Object.assign({}, config.resolve.alias, {
      // Map react-native async storage to browser shim
      "@react-native-async-storage/async-storage": path.resolve(__dirname, "./shims/asyncStorage.js"),
      // Shim pino-pretty used by some logging libs so bundler won't fail
      "pino-pretty": path.resolve(__dirname, "./shims/pino-pretty.js"),
    })
    return config;
  },
};

module.exports = nextConfig;
