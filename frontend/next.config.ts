import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // 匹配所有 /api 開頭的請求
        destination: 'http://127.0.0.1:3000/api/:path*', // 代理到本地伺服器
      },
    ];
  },
};

export default nextConfig;
