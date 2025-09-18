/** @type {import('next').NextConfig} */
const nextConfig = {
	// 🚨 開発サーバー時のみ.next-devを使用（ビルドとの競合回避）
	distDir: process.env.NEXT_DEV_SERVER === "true" ? ".next-dev" : ".next",
	experimental: {
		optimizePackageImports: [
			"@solana/wallet-adapter-react",
			"@solana/wallet-adapter-react-ui",
		],
	},
	transpilePackages: [
		"@solana/wallet-adapter-react",
		"@solana/wallet-adapter-react-ui",
	],
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			os: false,
			path: false,
			crypto: false,
		};
		return config;
	},
};

export default nextConfig;
