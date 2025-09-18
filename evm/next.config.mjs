/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 開発サーバー時のみ.next-devを使用（ビルドとの競合回避）
  distDir: process.env.NEXT_DEV_SERVER === "true" ? ".next-dev" : ".next",
  experimental: {
    optimizePackageImports: ["@mysten/dapp-kit"],
  },
  transpilePackages: ["@mysten/dapp-kit"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
